'use client';

import { useState } from 'react';
import type { FormData, ApiResponse } from '@/types/api';
import CSVBatchUploader from '@/components/CSVBatchUploader';

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    pageid: '619831537888082',
    intentname: 'test01',
    q_val: '01,02,includes(03),includes(04)',
    a_val: '[[{"text":"oooooooo","type":"text"}]]',
    authToken: 'zqyp3szoqa3b70ypcoyr4'
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/run-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Zwiz API Script Runner
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('single')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'single'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ส่งรายการเดียว (Single Run)
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'batch'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ส่งจาก CSV (Batch Run)
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'single' ? (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="pageid" className="block text-sm font-medium text-gray-700 mb-2">
                  Page ID
                </label>
                <input
                  type="text"
                  id="pageid"
                  name="pageid"
                  value={formData.pageid}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="intentname" className="block text-sm font-medium text-gray-700 mb-2">
                  Intent Name
                </label>
                <input
                  type="text"
                  id="intentname"
                  name="intentname"
                  value={formData.intentname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="authToken" className="block text-sm font-medium text-gray-700 mb-2">
                  Authorization Token <span className="text-xs text-gray-500">(หลัง "BEARER jm_admin01 ")</span>
                </label>
                <input
                  type="text"
                  id="authToken"
                  name="authToken"
                  value={formData.authToken}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="zqyp3szoqa3b70ypcoyr4"
                  required
                />
              </div>

              <div>
                <label htmlFor="q_val" className="block text-sm font-medium text-gray-700 mb-2">
                  Question Value
                </label>
                <input
                  type="text"
                  id="q_val"
                  name="q_val"
                  value={formData.q_val}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="a_val" className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Value (JSON)
                </label>
                <textarea
                  id="a_val"
                  name="a_val"
                  value={formData.a_val}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running Script...
                    </div>
                  ) : (
                    'Run Script'
                  )}
                </button>
              </div>
            </form>
          </div>

          {result && (
            <div className="border-t border-gray-200 px-6 py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Result
              </h3>
              
              <div className={`p-4 rounded-md ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {result.success ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">Success!</span>
                    </div>
                    <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-auto max-h-96">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-red-800">Error</span>
                    </div>
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Generated cURL Command
              </h3>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="text-sm text-gray-800 overflow-auto">
{`curl 'https://api-enterprise.zwiz.app/intents' \\
  -H 'accept: */*' \\
  -H 'accept-language: th-TH,th;q=0.9,en;q=0.8' \\
  -H 'authorization: BEARER jm_admin01 ${formData.authToken}' \\
  -H 'content-type: application/json' \\
  -H 'origin: https://demo.enterprise.zwiz.app' \\
  -H 'referer: https://demo.enterprise.zwiz.app/' \\
  --data-raw '{"pageid":"${formData.pageid}","intentname":"${formData.intentname}","q_type":"text","a_type":"json","q_val":"${formData.q_val}","a_val":"${formData.a_val.replace(/"/g, '\\"')}","context_in":"","context_out":"","postidlist":"","userstatus":"","usertags":"","isShow":true,"linenoti_status":false,"linenoti_text":null,"starttime":null,"endtime":null,"intentstatus":true,"follow_up_fb_quick_reply":"","follow_up_fb_val":null,"follow_up_ig_quick_reply":null,"follow_up_ig_val":null,"follow_up_line_quick_reply":"","follow_up_line_val":null,"follow_up_quick_reply":null,"follow_up_status":null,"follow_up_type":"json","follow_up_val":"[[]]","follow_up_within_seconds":null,"follow_up_whatsapp_quick_reply":null,"follow_up_whatsapp_val":null,"time_setting":null,"exceptpostidlist":"","post_keywords":"","onlytime":false,"quick_reply":"","follow_up_intentgroup":{"assigngroupid":null,"assignsubgroupid":null,"priority":null,"duedate":null,"day":null,"hour":null,"minute":null,"mood":null,"wrap_up":null,"wrap_up_route":null,"tags":null},"user_tags_delete":"","follow_up_usertags":"","intentgroup":{"assigngroupid":null,"assignsubgroupid":null,"priority":null,"duedate":null,"day":null,"hour":null,"minute":null,"mood":null,"wrap_up":null,"wrap_up_route":null,"tags":null}}'`}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <CSVBatchUploader 
            authToken={formData.authToken}
            pageid={formData.pageid}
          />
        )}
      </div>
    </div>
  );
}