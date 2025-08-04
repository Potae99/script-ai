'use client';

import { useState, useRef } from 'react';
import { parseCSV, processCSVRow, validateCSVRow } from '@/utils/csvProcessor';
import type { CSVRow, ProcessedRow, BatchProgress } from '@/types/csv';

interface CSVBatchUploaderProps {
  authToken: string;
  pageid: string;
}

export default function CSVBatchUploader({ authToken, pageid }: CSVBatchUploaderProps) {
  const [csvRows, setCsvRows] = useState<CSVRow[]>([]);
  const [processedRows, setProcessedRows] = useState<ProcessedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const totalLines = content.split('\n').length - 1; // Exclude header
      const rows = parseCSV(content);
      
      // Validate rows
      const validRows: CSVRow[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];
      
      rows.forEach((row, index) => {
        const rowErrors = validateCSVRow(row);
        if (rowErrors.length > 0) {
          errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
        } else {
          validRows.push(row);
        }
      });

      // Add warning if some rows were skipped during parsing
      const skippedRows = totalLines - rows.length;
      if (skippedRows > 0) {
        warnings.push(`เตือน: ข้ามไป ${skippedRows} บรรทัดที่ไม่สามารถอ่านได้`);
      }

      // Show results to user
      let message = `✅ อ่านไฟล์ CSV สำเร็จ!\n\n`;
      message += `📊 สถิติ:\n`;
      message += `- รวมทั้งหมด: ${totalLines} บรรทัด\n`;
      message += `- อ่านได้: ${rows.length} บรรทัด\n`;
      message += `- ใช้งานได้: ${validRows.length} บรรทัด\n`;
      
      if (warnings.length > 0) {
        message += `\n⚠️ ${warnings.join('\n')}\n`;
      }
      
      if (errors.length > 0) {
        message += `\n❌ ข้อผิดพลาด ${errors.length} รายการ:\n`;
        message += errors.slice(0, 3).join('\n');
        if (errors.length > 3) {
          message += `\n... และอีก ${errors.length - 3} รายการ`;
        }
        message += '\n\nจะใช้เฉพาะบรรทัดที่ถูกต้องเท่านั้น';
      }

      alert(message);

      if (validRows.length === 0) {
        return;
      }

      setCsvRows(validRows);
      
      // Process rows for preview
      const processed = validRows.map(row => processCSVRow(row, pageid));
      setProcessedRows(processed);
      setShowPreview(true);
      
    } catch (error) {
      alert(`❌ ไม่สามารถอ่านไฟล์ CSV ได้:\n${error instanceof Error ? error.message : 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ'}\n\nกรุณาตรวจสอบ:\n1. ไฟล์เป็น CSV format ที่ถูกต้อง\n2. Encoding เป็น UTF-8\n3. ข้อมูลในไฟล์ไม่เสียหาย`);
    }
  };

  const handleBatchRun = async () => {
    if (processedRows.length === 0) return;

    setIsProcessing(true);
    setShouldStop(false);
    const initialProgress = {
      total: processedRows.length,
      completed: 0,
      failed: 0,
      current: '',
      results: []
    };
    setProgress(initialProgress);

    try {
      let successCount = 0;
      let failCount = 0;
      const results: any[] = [];

      // ส่งทีละ row
      for (let i = 0; i < processedRows.length && !shouldStop; i++) {
        const row = processedRows[i];
        
        // อัพเดต progress - แสดง row ปัจจุบันที่กำลังส่ง
        setProgress(prev => ({
          ...prev,
          current: `กำลังส่ง: ${row.conversationName} (${i + 1}/${processedRows.length})`
        }));

        try {
          // ส่ง request ทีละ row
          const response = await fetch('/api/run-script', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pageid: pageid,
              intentname: row.intentname,
              q_val: row.q_val,
              a_val: row.a_val,
              authToken: authToken
            }),
          });

          const result = await response.json();

          if (result.success) {
            successCount++;
            results.push({
              conversationName: row.conversationName,
              success: true,
              data: result.data
            });
          } else {
            failCount++;
            results.push({
              conversationName: row.conversationName,
              success: false,
              error: result.error || 'Unknown error'
            });
          }

        } catch (error) {
          failCount++;
          results.push({
            conversationName: row.conversationName,
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
          });
        }

        // อัพเดต progress หลังส่งแต่ละ row
        setProgress({
          total: processedRows.length,
          completed: successCount,
          failed: failCount,
          current: `เสร็จแล้ว: ${i + 1}/${processedRows.length}`,
          results: [...results]
        });

        // หน่วงเวลาเล็กน้อยเพื่อไม่ให้ API ถูก spam
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // เสร็จสิ้นหรือหยุดกระบวนการ
      const statusMessage = shouldStop 
        ? `หยุดการส่ง! ส่งไปแล้ว: ${successCount + failCount}/${processedRows.length}, สำเร็จ: ${successCount}, ล้มเหลว: ${failCount}`
        : `เสร็จสิ้น! สำเร็จ: ${successCount}, ล้มเหลว: ${failCount}`;
      
      setProgress(prev => ({
        ...prev,
        current: statusMessage
      }));

    } catch (error) {
      alert(`Error in batch processing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setShouldStop(false);
    }
  };

  const handleStopProcessing = () => {
    setShouldStop(true);
  };

  const resetUploader = () => {
    setCsvRows([]);
    setProcessedRows([]);
    setProgress(null);
    setShowPreview(false);
    setShouldStop(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600">
        <h2 className="text-xl font-bold text-white">
          CSV Batch Upload & Send
        </h2>
        <p className="text-purple-100 text-sm mt-1">
          อัพโหลดไฟล์ CSV เพื่อส่งข้อมูลหลายๆ รายการพร้อมกัน
        </p>
      </div>

      <div className="p-6">
        {!showPreview ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกไฟล์ CSV
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  รูปแบบไฟล์ CSV ที่ต้องการ:
                </h4>
                <div className="text-xs text-blue-700">
                  <p><strong>Header:</strong> Conversation ID, Conversation Name, Sentence Rule, Keyword Rule, Message</p>
                  <p><strong>การแปลงข้อมูล:</strong></p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li>Conversation Name → Intent Name</li>
                    <li>Sentence Rule: แปลง | เป็น ,</li>
                    <li>Keyword Rule: แปลง | เป็น , และใส่ includes() รอบแต่ละส่วน</li>
                    <li>Message → JSON format สำหรับ a_val</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-2">
                  ✅ ระบบจัดการปัญหา CSV อัตโนมัติ:
                </h4>
                <div className="text-xs text-green-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>ข้ามบรรทัดที่อ่านไม่ได้หรือไม่สมบูรณ์</li>
                    <li>รวม multiline text ให้เป็น single line</li>
                    <li>แสดงสถิติการอ่านไฟล์ที่ละเอียด</li>
                    <li>ทำงานได้แม้ไฟล์มีปัญหาบางส่วน</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                  📋 ไฟล์ทดสอบ:
                </h4>
                <div className="text-xs text-yellow-700">
                  <p>ใช้ไฟล์ <code className="bg-yellow-100 px-1 rounded">test-csv-sample.csv</code> หรือ <code className="bg-yellow-100 px-1 rounded">example-data.csv</code> ในโปรเจคสำหรับทดสอบ</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Preview ({processedRows.length} รายการ)
              </h3>
              <div className="space-x-2">
                {!isProcessing ? (
                  <>
                    <button
                      onClick={resetUploader}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      เลือกไฟล์ใหม่
                    </button>
                    <button
                      onClick={handleBatchRun}
                      className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      ส่งทั้งหมด ({processedRows.length} รายการ)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleStopProcessing}
                      disabled={shouldStop}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {shouldStop ? 'กำลังหยุด...' : 'หยุดการส่ง'}
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md">
                      กำลังส่งข้อมูล...
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Preview Table */}
            <div className="mb-6 border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Intent Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Q Val
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedRows.slice(0, 10).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {row.intentname}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          <div className="max-w-xs truncate" title={row.q_val}>
                            {row.q_val}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          <div className="max-w-xs truncate" title={row.message}>
                            {row.message}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {processedRows.length > 10 && (
                <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 text-center">
                  และอีก {processedRows.length - 10} รายการ...
                </div>
              )}
            </div>

            {/* Progress */}
            {progress && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  สถานะการส่งข้อมูล
                </h4>
                
                {/* Current Status */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {progress.current}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {Math.round(((progress.completed + progress.failed) / progress.total) * 100)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div className="relative h-full rounded-full overflow-hidden">
                      {/* Success portion */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                      ></div>
                      {/* Failed portion */}
                      <div 
                        className="absolute top-0 h-full bg-red-500 transition-all duration-500"
                        style={{ 
                          left: `${(progress.completed / progress.total) * 100}%`,
                          width: `${(progress.failed / progress.total) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-gray-800">{progress.total}</div>
                    <div className="text-xs text-gray-500">รวมทั้งหมด</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{progress.completed}</div>
                    <div className="text-xs text-green-600">สำเร็จ</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{progress.failed}</div>
                    <div className="text-xs text-red-600">ล้มเหลว</div>
                  </div>
                </div>

                {/* Results List */}
                {progress.results.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">รายละเอียดผลลัพธ์:</h5>
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {progress.results.map((result, index) => (
                        <div key={index} className={`p-3 border-b last:border-b-0 ${
                          result.success 
                            ? 'bg-green-50 hover:bg-green-100' 
                            : 'bg-red-50 hover:bg-red-100'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                result.success ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="font-medium text-sm text-gray-800">
                                {result.conversationName}
                              </span>
                            </div>
                            <div className="text-xs">
                              {result.success ? (
                                <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                  ✅ สำเร็จ
                                </span>
                              ) : (
                                <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                  ❌ ล้มเหลว
                                </span>
                              )}
                            </div>
                          </div>
                          {!result.success && result.error && (
                            <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                              <strong>เหตุผล:</strong> {result.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processing Animation */}
                {isProcessing && !shouldStop && (
                  <div className="flex items-center justify-center mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
                    <span className="text-sm text-gray-600">กำลังประมวลผล...</span>
                  </div>
                )}

                {/* Stop Animation */}
                {isProcessing && shouldStop && (
                  <div className="flex items-center justify-center mt-4">
                    <div className="animate-pulse rounded-full h-6 w-6 bg-red-500 mr-3"></div>
                    <span className="text-sm text-red-600">กำลังหยุดการประมวลผล...</span>
                  </div>
                )}

                {/* Action Buttons after completion */}
                {!isProcessing && progress && progress.results.length > 0 && (
                  <div className="flex justify-center mt-4 space-x-3">
                    <button
                      onClick={resetUploader}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      เริ่มใหม่
                    </button>
                    <button
                      onClick={() => {
                        const csv = processedRows.map(row => ({
                          Name: row.conversationName,
                          Status: progress.results.find(r => r.conversationName === row.conversationName)?.success ? 'Success' : 'Failed',
                          Error: progress.results.find(r => r.conversationName === row.conversationName)?.error || ''
                        }));
                        console.log('Results:', csv);
                      }}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      ดาวน์โหลดผลลัพธ์
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}