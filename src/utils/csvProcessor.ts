import type { CSVRow, ProcessedRow } from '@/types/csv';

export function parseCSV(csvContent: string): CSVRow[] {
  // Preprocess the CSV content to handle multiline fields
  const preprocessed = preprocessCSVContent(csvContent);
  const lines = preprocessed.split('\n');
  const headers = lines[0];
  
  const rows: CSVRow[] = [];
  
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    try {
      // Handle CSV parsing with proper quote handling
      const values = parseCSVLine(line);
      
      // Skip lines that don't have enough fields or are clearly incomplete
      if (values.length < 2) continue;
      
      // Ensure we have at least 5 fields by padding with empty strings
      while (values.length < 5) {
        values.push('');
      }
      
      // Create row object
      const row: CSVRow = {
        conversationId: values[0]?.trim() || '',
        conversationName: values[1]?.trim() || '',
        sentenceRule: values[2]?.trim() || '',
        keywordRule: values[3]?.trim() || '',
        message: values.slice(4).join(',').trim() || ''
      };
      
      // Only add rows that have at least conversationId and conversationName
      if (row.conversationId && row.conversationName) {
        rows.push(row);
      }
      
    } catch (error) {
      console.warn(`Warning: Could not parse line ${lineIndex + 1}: ${line}`);
      // Continue processing other lines instead of failing completely
      continue;
    }
  }
  
  return rows;
}

function preprocessCSVContent(content: string): string {
  // Split into lines
  const lines = content.split('\n');
  const processedLines: string[] = [];
  
  let currentRow = '';
  let inQuotedField = false;
  let inMultilineMessage = false;
  let commaCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Count commas to determine if this might be a new row
    const commasInLine = (line.match(/,/g) || []).length;
    
    if (i === 0) {
      // Header line
      processedLines.push(line);
      continue;
    }
    
    // Check if this line looks like it starts a new row
    // (has enough commas and starts with an ID pattern)
    const looksLikeNewRow = commasInLine >= 3 && /^[A-Z0-9-]+,/.test(line.trim());
    
    if (looksLikeNewRow && currentRow) {
      // Complete the previous row
      processedLines.push(currentRow);
      currentRow = line;
    } else if (currentRow) {
      // Continue building the current row (multiline field)
      currentRow += ' ' + line.trim();
    } else {
      // Start a new row
      currentRow = line;
    }
  }
  
  // Add the last row
  if (currentRow) {
    processedLines.push(currentRow);
  }
  
  return processedLines.join('\n');
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
      i++;
      continue;
    } else {
      current += char;
    }
    i++;
  }
  
  // Add the last field
  result.push(current);
  
  // Clean up any remaining quotes from field values
  return result.map(field => {
    // Remove surrounding quotes if they exist
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.slice(1, -1);
    }
    return field;
  });
}

export function processCSVRow(row: CSVRow, pageid: string): ProcessedRow {
  // Convert Sentence Rule: Replace | with ,
  const sentenceRuleParts = row.sentenceRule
    .split('|')
    .map(part => part.trim())
    .filter(part => part.length > 0);
  
  // Convert Keyword Rule: Replace | with , and wrap each part with includes()
  const keywordRuleParts = row.keywordRule
    .split('|')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map(part => `includes(${part})`);
  
  // Combine Sentence Rule and Keyword Rule for q_val
  const q_val = [...sentenceRuleParts, ...keywordRuleParts].join(',');
  
  // Convert Message to JSON format for a_val
  const a_val = `[[{"text":"${row.message.replace(/"/g, '\\"').replace(/\n/g, '\\n')}","type":"text"}]]`;
  
  return {
    ...row,
    intentname: row.conversationName,
    q_val: q_val,
    a_val: a_val
  };
}

export function validateCSVRow(row: CSVRow): string[] {
  const errors: string[] = [];
  
  if (!row.conversationId) {
    errors.push('Conversation ID is required');
  }
  
  if (!row.conversationName) {
    errors.push('Conversation Name is required');
  }
  
  if (!row.sentenceRule && !row.keywordRule) {
    errors.push('At least one of Sentence Rule or Keyword Rule is required');
  }
  
  if (!row.message) {
    errors.push('Message is required');
  }
  
  return errors;
}