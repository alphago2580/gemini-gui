export interface ElectronAPI {
  sendMessage: (message: string) => Promise<{ success: boolean; output: string; error: string | null }>;
  stopGemini: () => Promise<{ success: boolean; error?: string }>;
  onStreamData: (callback: (data: any) => void) => void;
  onStreamComplete: (callback: (data: any) => void) => void;
  onStreamError: (callback: (data: any) => void) => void;
  removeAllListeners: () => void;
  saveTempFile: (fileName: string, fileData: ArrayBuffer) => Promise<{ success: boolean; path?: string; error?: string }>;
  cleanupTempFiles: () => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
