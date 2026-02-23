export interface AnalysisResult {
  summary: string;
  deadlines: string[];
  citations: string[];
  logic_check: string;
}

export interface DocumentFile {
  name: string;
  type: string;
  data: string; // base64
}

export type TabId = 'summary' | 'deadlines' | 'citations' | 'logic_check';

export interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}
