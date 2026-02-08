import { contextBridge, ipcRenderer } from 'electron';

// Renderer에서 안전하게 사용할 수 있는 API 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 메시지를 Gemini CLI로 전송
  sendMessage: (message: string) => ipcRenderer.invoke('send-message', message),

  // Gemini CLI 프로세스 중지
  stopGemini: () => ipcRenderer.invoke('stop-gemini'),

  // 새 대화 시작 (세션 초기화)
  newConversation: () => ipcRenderer.invoke('new-conversation'),

  // 스트리밍 데이터 수신 리스너
  onStreamData: (callback: (data: any) => void) => {
    ipcRenderer.on('stream-data', (event, data) => callback(data));
  },

  // 스트리밍 완료 리스너
  onStreamComplete: (callback: (data: any) => void) => {
    ipcRenderer.on('stream-complete', (event, data) => callback(data));
  },

  // 스트리밍 에러 리스너
  onStreamError: (callback: (data: any) => void) => {
    ipcRenderer.on('stream-error', (event, data) => callback(data));
  },

  // 리스너 제거
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('stream-data');
    ipcRenderer.removeAllListeners('stream-complete');
    ipcRenderer.removeAllListeners('stream-error');
  },

  // 파일 관련 API
  saveTempFile: (fileName: string, fileData: ArrayBuffer) =>
    ipcRenderer.invoke('save-temp-file', fileName, fileData),

  cleanupTempFiles: () => ipcRenderer.invoke('cleanup-temp-files')
});
