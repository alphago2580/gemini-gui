import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import FileAttachment from './components/FileAttachment';
import MarkdownRenderer from './components/MarkdownRenderer';
import Toast from './components/Toast';
import { useConversations } from './hooks/useConversations';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { useAutoResize } from './hooks/useAutoResize';
import { useToast } from './hooks/useToast';
import { exportToMarkdown } from './utils/format';
import type { AppSettings, StreamData, StreamErrorData, Message } from '../preload/types';

const STORAGE_KEY_SETTINGS = 'gemini-settings';

const DEFAULT_SETTINGS: AppSettings = {
  model: 'auto',
  temperature: 1,
  maxTokens: 2048,
  theme: 'dark'
};

const App: React.FC = () => {
  // Conversation state (extracted to custom hook)
  const {
    conversations,
    currentConversationId,
    messages,
    setMessages,
    handleNewChat,
    handleSelectConversation,
    updateCurrentConversation,
    deleteMessage,
  } = useConversations();

  // Theme
  const { themeMode, setThemeMode } = useTheme();

  // Toast notifications
  const { toasts, addToast, dismissToast } = useToast();

  // UI state
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-resize textarea
  const { textareaRef } = useAutoResize(input);

  // Settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // File attachment state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Clear current conversation messages
  const handleClearConversation = () => {
    if (currentConversationId) {
      updateCurrentConversation([]);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onClearConversation: handleClearConversation,
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    onCloseSettings: () => setIsSettingsOpen(false),
    onFocusSearch: () => searchInputRef.current?.focus(),
    isSettingsOpen,
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle settings save
  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  // Handle file selection from FileAttachment component
  const handleFilesSelected = (files: File[]) => {
    setAttachedFiles(prev => [...prev, ...files]);
  };

  // Handle file removal from attachedFiles
  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Convert File to ArrayBuffer for saveTempFile
  const fileToArrayBuffer = async (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Save attached files to temp storage
  const saveTempFiles = async (): Promise<string[]> => {
    const tempFilePaths: string[] = [];

    for (const file of attachedFiles) {
      try {
        const buffer = await fileToArrayBuffer(file);
        if (window.electronAPI && window.electronAPI.saveTempFile) {
          const filePath = await window.electronAPI.saveTempFile(file.name, buffer);
          tempFilePaths.push(filePath);
          console.log(`Temp file saved: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error saving temp file ${file.name}:`, error);
      }
    }

    return tempFilePaths;
  };

  // Cleanup temp files on component unmount
  useEffect(() => {
    return () => {
      if (window.electronAPI && window.electronAPI.cleanupTempFiles) {
        window.electronAPI.cleanupTempFiles();
      }
    };
  }, []);

  // 스트리밍 데이터 수신 리스너 설정
  useEffect(() => {
    if (window.electronAPI) {
      // 스트리밍 데이터 처리
      window.electronAPI.onStreamData((data: StreamData) => {
        console.log('Stream data received:', data);

        if (data.type === 'message' && data.role === 'assistant') {
          // 어시스턴트 메시지 스트리밍
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];

            if (lastMessage && lastMessage.role === 'assistant' && data.delta) {
              // 스트리밍 중: 마지막 메시지에 추가
              const updated = [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + (data.content || '') }
              ];
              updateCurrentConversation(updated);
              return updated;
            } else if (!data.delta) {
              // 완전한 메시지 (delta가 false인 경우)
              const updated = [...prev, {
                role: 'assistant' as const,
                content: data.content || '',
                timestamp: new Date()
              }];
              updateCurrentConversation(updated);
              return updated;
            } else {
              // 첫 delta 메시지: 새 어시스턴트 메시지 시작
              const updated = [...prev, {
                role: 'assistant' as const,
                content: data.content || '',
                timestamp: new Date()
              }];
              updateCurrentConversation(updated);
              return updated;
            }
          });
        } else if (data.type === 'result') {
          // 결과 통계 (선택적으로 표시 가능)
          console.log('Result stats:', data.stats);
        }
      });

      // 스트리밍 완료 처리
      window.electronAPI.onStreamComplete(() => {
        setIsLoading(false);
      });

      // 스트리밍 에러 처리
      window.electronAPI.onStreamError((data: StreamErrorData) => {
        console.error('Stream error:', data);
        addToast('error', data.error);
        setMessages(prev => {
          const updated = [...prev, {
            role: 'assistant' as const,
            content: `오류: ${data.error}`,
            timestamp: new Date()
          }];
          updateCurrentConversation(updated);
          return updated;
        });
        setIsLoading(false);
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners();
      }
    };
  }, [currentConversationId, setMessages, updateCurrentConversation, addToast]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Create new conversation if none exists
    if (!currentConversationId) {
      handleNewChat();
    }

    // Prepare message content with file information if files are attached
    let fullMessageContent = input;
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map(f => f.name).join(', ');
      fullMessageContent = `${input}\n\n[첨부 파일: ${fileNames}]`;

      // Save temp files
      try {
        const tempFilePaths = await saveTempFiles();
        if (tempFilePaths.length > 0) {
          console.log(`Saved ${tempFilePaths.length} file(s) to temp storage`);
          fullMessageContent += `\n[파일 경로: ${tempFilePaths.join(', ')}]`;
        }
      } catch (error) {
        console.error('Error saving temp files:', error);
      }
    }

    const userMessage: Message = {
      role: 'user',
      content: fullMessageContent,
      timestamp: new Date()
    };

    // Add user message to state
    setMessages(prev => {
      const updated = [...prev, userMessage];
      updateCurrentConversation(updated);
      return updated;
    });

    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    try {
      // sendMessage는 Promise를 반환하지만 실제 응답은 스트리밍으로 온다
      await window.electronAPI.sendMessage(messageToSend);
      // 성공 시 스트리밍 완료 이벤트에서 isLoading을 false로 설정
      // Clear attached files after successful send
      setAttachedFiles([]);
    } catch (error: unknown) {
      // 에러 발생 시
      const errMsg = error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'error' in error
          ? String((error as { error: unknown }).error)
          : String(error);
      addToast('error', `메시지 전송 실패: ${errMsg}`);
      const errorMessage: Message = {
        role: 'assistant',
        content: `오류 발생: ${errMsg}`,
        timestamp: new Date()
      };
      setMessages(prev => {
        const updated = [...prev, errorMessage];
        updateCurrentConversation(updated);
        return updated;
      });
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (messages.length === 0) return;

    const currentConv = conversations.find(c => c.id === currentConversationId);
    const title = currentConv?.title || 'Untitled Conversation';
    const markdown = exportToMarkdown(title, messages);
    const safeTitle = title.replace(/[^a-zA-Z0-9가-힣\s-]/g, '').replace(/\s+/g, '-');
    const defaultFileName = `${safeTitle}.md`;

    if (window.electronAPI?.exportMarkdown) {
      await window.electronAPI.exportMarkdown(markdown, defaultFileName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app" role="application">
      <Sidebar
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        searchInputRef={searchInputRef}
      />

      <main className="main-content">
        <header className="app-header">
          <div className="header-title">
            <h1>Gemini GUI</h1>
            <p>Powered by Gemini CLI</p>
          </div>
          {messages.length > 0 && (
            <div className="header-actions">
              <button
                className="header-action-btn"
                onClick={handleClearConversation}
                aria-label="대화 지우기"
                title="대화 지우기 (Ctrl+L)"
              >
                Clear
              </button>
              <button
                className="header-action-btn"
                onClick={handleExport}
                aria-label="대화 내보내기"
                title="Markdown으로 내보내기"
              >
                Export
              </button>
            </div>
          )}
        </header>

        <div className="chat-container">
          <div className="messages" role="log" aria-label="대화 메시지" aria-live="polite">
            {messages.length === 0 && (
              <div className="welcome-message">
                <h2>Gemini에 오신 것을 환영합니다!</h2>
                <p>아래 입력창에 메시지를 입력하여 대화를 시작하세요.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`} role="article" aria-label={`${message.role === 'user' ? '사용자' : 'Gemini'} 메시지`}>
                <div className="message-header">
                  <span className="role">{message.role === 'user' ? '사용자' : 'Gemini'}</span>
                  <span className="timestamp">{message.timestamp.toLocaleTimeString()}</span>
                  <button
                    className="delete-message-btn"
                    onClick={() => deleteMessage(index)}
                    aria-label={`메시지 삭제`}
                    title="메시지 삭제"
                  >
                    &times;
                  </button>
                </div>
                <div className="message-content">
                  <MarkdownRenderer content={message.content} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant loading" role="status" aria-label="응답 생성 중">
                <div className="message-header">
                  <span className="role">Gemini</span>
                </div>
                <div className="message-content">
                  <div className="loading-dots" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container" role="form" aria-label="메시지 입력">
            <FileAttachment
              onFilesSelected={handleFilesSelected}
              attachedFiles={attachedFiles}
              onRemoveFile={handleRemoveFile}
            />
            <label htmlFor="message-input" className="sr-only">메시지 입력</label>
            <textarea
              ref={textareaRef}
              id="message-input"
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요... (Enter/Ctrl+Enter: 전송, Shift+Enter: 줄바꿈)"
              disabled={isLoading}
              rows={1}
              aria-label="메시지 입력"
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label={isLoading ? '전송 중' : '메시지 전송'}
            >
              {isLoading ? '전송 중...' : '전송'}
            </button>
          </div>
        </div>
      </main>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsSave}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
