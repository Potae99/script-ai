export interface CSVRow {
  conversationId: string;
  conversationName: string;
  sentenceRule: string;
  keywordRule: string;
  message: string;
}

export interface ProcessedRow extends CSVRow {
  intentname: string;
  q_val: string;
  a_val: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
  results: BatchResult[];
}

export interface BatchResult {
  conversationName: string;
  success: boolean;
  error?: string;
  data?: any;
}