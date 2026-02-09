export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  theme: ThemeMode;
  systemPrompt: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface StreamData {
  type: 'message' | 'result';
  role?: 'assistant' | 'user';
  content?: string;
  delta?: boolean;
  stats?: Record<string, unknown>;
}

export interface StreamCompleteData {
  success: boolean;
}

export interface StreamErrorData {
  error: string;
}

export interface ElectronAPI {
  sendMessage: (message: string, systemPrompt?: string, model?: string) => Promise<{ success: boolean; output: string; error: string | null }>;
  stopGemini: () => Promise<{ success: boolean; error?: string }>;
  newConversation: () => Promise<{ success: boolean }>;
  onStreamData: (callback: (data: StreamData) => void) => void;
  onStreamComplete: (callback: (data: StreamCompleteData) => void) => void;
  onStreamError: (callback: (data: StreamErrorData) => void) => void;
  removeAllListeners: () => void;
  saveTempFile: (fileName: string, fileData: ArrayBuffer) => Promise<string>;
  cleanupTempFiles: () => Promise<{ success: boolean; error?: string }>;
  exportMarkdown: (content: string, defaultFileName: string) => Promise<{ success: boolean; canceled?: boolean; path?: string; error?: string }>;
  exportPdf: (htmlContent: string, defaultFileName: string) => Promise<{ success: boolean; canceled?: boolean; path?: string; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
