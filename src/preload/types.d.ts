export interface AppSettings {
  model: string;
  temperature: number;
  maxTokens: number;
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
  sendMessage: (message: string) => Promise<{ success: boolean; output: string; error: string | null }>;
  stopGemini: () => Promise<{ success: boolean; error?: string }>;
  newConversation: () => Promise<{ success: boolean }>;
  onStreamData: (callback: (data: StreamData) => void) => void;
  onStreamComplete: (callback: (data: StreamCompleteData) => void) => void;
  onStreamError: (callback: (data: StreamErrorData) => void) => void;
  removeAllListeners: () => void;
  saveTempFile: (fileName: string, fileData: ArrayBuffer) => Promise<string>;
  cleanupTempFiles: () => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
