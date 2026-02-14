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

export interface ConversationFolder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
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
  notificationSound: boolean;
  showTimestamps: boolean;
  fontSize: number;
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

export interface SessionStatusData {
  status: 'idle' | 'connecting' | 'connected' | 'error';
}

export type TokenBurnerTaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type TokenBurnerTaskStatus = 'pending' | 'active' | 'complete' | 'failed';
export type TokenBurnerAgentStatus = 'idle' | 'working' | 'testing' | 'error';

export interface TokenBurnerTask {
  id: string;
  title: string;
  description: string;
  priority: TokenBurnerTaskPriority;
  status: TokenBurnerTaskStatus;
  assignee?: string;
  failReason?: string;
}

export interface TokenBurnerAgentState {
  id: string;
  model: string;
  status: TokenBurnerAgentStatus;
  currentTask: { title: string } | null;
  elapsed: number;
  completed: number;
  failed: number;
}

export interface TokenBurnerQueueStatus {
  pending: number;
  active: number;
  complete: number;
  failed: number;
  total: number;
}

export interface TokenBurnerDashboardData {
  projectName: string;
  projectPath: string;
  isRunning: boolean;
  agents: TokenBurnerAgentState[];
  queue: TokenBurnerQueueStatus;
  metrics: { totalTasks: number; successRate: number; avgDuration: number };
  recentEvents: Array<{ type: string; taskId?: string; agentId?: string }>;
  gitLog: Array<{ hash: string; message: string }>;
}

export interface TokenBurnerAPI {
  init: (projectPath: string) => Promise<{ success: boolean; error?: string }>;
  launch: (agentCount: number) => Promise<{ success: boolean; error?: string }>;
  stop: () => Promise<{ success: boolean }>;
  addTask: (title: string, description: string, priority?: string) => Promise<{ success: boolean; taskId?: string; error?: string }>;
  getDashboard: () => Promise<TokenBurnerDashboardData>;
  getQueueStatus: () => Promise<TokenBurnerQueueStatus>;
  getAgentStates: () => Promise<TokenBurnerAgentState[]>;
  selectProject: () => Promise<{ success: boolean; path?: string; canceled?: boolean }>;
  onEvent: (callback: (data: unknown) => void) => void;
  removeAllListeners: () => void;
}

export interface ElectronAPI {
  sendMessage: (message: string, systemPrompt?: string, model?: string) => Promise<{ success: boolean; output: string; error: string | null }>;
  stopGemini: () => Promise<{ success: boolean; error?: string }>;
  newConversation: () => Promise<{ success: boolean }>;
  onStreamData: (callback: (data: StreamData) => void) => void;
  onStreamComplete: (callback: (data: StreamCompleteData) => void) => void;
  onStreamError: (callback: (data: StreamErrorData) => void) => void;
  onSessionStatus: (callback: (data: SessionStatusData) => void) => void;
  removeAllListeners: () => void;
  onMenuAction: (callback: (action: string) => void) => void;
  saveTempFile: (fileName: string, fileData: ArrayBuffer) => Promise<string>;
  cleanupTempFiles: () => Promise<{ success: boolean; error?: string }>;
  exportMarkdown: (content: string, defaultFileName: string) => Promise<{ success: boolean; canceled?: boolean; path?: string; error?: string }>;
  exportPdf: (htmlContent: string, defaultFileName: string) => Promise<{ success: boolean; canceled?: boolean; path?: string; error?: string }>;
  showNotification: (title: string, body: string) => Promise<{ success: boolean; error?: string }>;
  isWindowFocused: () => Promise<boolean>;
  setWindowTitle: (title: string) => Promise<void>;
  tokenburner: TokenBurnerAPI;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
