import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import FileAttachment from './components/FileAttachment';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

interface AppSettings {
  model: string;
  temperature: number;
  maxTokens: number;
}

const STORAGE_KEY_CONVERSATIONS = 'gemini-conversations';
const STORAGE_KEY_SETTINGS = 'gemini-settings';
const STORAGE_KEY_CURRENT_CONVERSATION = 'gemini-current-conversation';

const DEFAULT_SETTINGS: AppSettings = {
  model: 'auto',
  temperature: 1,
  maxTokens: 2048
};

const App: React.FC = () => {
  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // UI state
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // File attachment state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations and settings from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const savedCurrentConversationId = localStorage.getItem(STORAGE_KEY_CURRENT_CONVERSATION);

    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        // Restore timestamps as Date objects
        const conversations = parsed.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversations);

        // Restore current conversation if it exists
        if (savedCurrentConversationId) {
          const conversation = conversations.find((c: Conversation) => c.id === savedCurrentConversationId);
          if (conversation) {
            setCurrentConversationId(savedCurrentConversationId);
            setMessages(conversation.messages);
          }
        }
      } catch (error) {
        console.error('Failed to parse saved conversations:', error);
      }
    }

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  // Save current conversation ID to localStorage
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem(STORAGE_KEY_CURRENT_CONVERSATION, currentConversationId);
    }
  }, [currentConversationId]);

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

  // Generate conversation title from first user message
  const generateConversationTitle = (firstMessage: string): string => {
    const maxLength = 50;
    return firstMessage.length > maxLength
      ? firstMessage.substring(0, maxLength) + '...'
      : firstMessage;
  };

  // Create a new conversation
  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: '새로운 대화',
      timestamp: new Date(),
      messages: []
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setMessages([]);

    // 세션 초기화 (새 대화는 새 세션으로 시작)
    if (window.electronAPI && window.electronAPI.newConversation) {
      window.electronAPI.newConversation();
    }
  };

  // Select an existing conversation
  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversationId(id);
      setMessages(conversation.messages);
    }
  };

  // Update current conversation with new messages
  const updateCurrentConversation = (updatedMessages: Message[]) => {
    setMessages(updatedMessages);

    if (currentConversationId) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          // Update title if this is the first message
          const title = updatedMessages.length === 1 && updatedMessages[0].role === 'user'
            ? generateConversationTitle(updatedMessages[0].content)
            : conv.title;

          return {
            ...conv,
            messages: updatedMessages,
            title,
            timestamp: new Date()
          };
        }
        return conv;
      }));
    }
  };

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
      window.electronAPI.onStreamData((data: any) => {
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
                role: 'assistant',
                content: data.content || '',
                timestamp: new Date()
              }];
              updateCurrentConversation(updated);
              return updated;
            } else {
              // 첫 delta 메시지: 새 어시스턴트 메시지 시작
              const updated = [...prev, {
                role: 'assistant',
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
      window.electronAPI.onStreamComplete((data: any) => {
        console.log('Stream complete:', data);
        setIsLoading(false);
      });

      // 스트리밍 에러 처리
      window.electronAPI.onStreamError((data: any) => {
        console.error('Stream error:', data);
        setMessages(prev => {
          const updated = [...prev, {
            role: 'assistant',
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
  }, [currentConversationId]);

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
    } catch (error: any) {
      // 에러 발생 시
      const errorMessage: Message = {
        role: 'assistant',
        content: `오류 발생: ${error.error || error.message || '알 수 없는 오류'}`,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app">
      <Sidebar
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
      />

      <div className="main-content">
        <header className="app-header">
          <h1>Gemini GUI</h1>
          <p>Powered by Gemini CLI</p>
        </header>

        <div className="chat-container">
          <div className="messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <h2>Gemini에 오신 것을 환영합니다!</h2>
                <p>아래 입력창에 메시지를 입력하여 대화를 시작하세요.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-header">
                  <span className="role">{message.role === 'user' ? '사용자' : 'Gemini'}</span>
                  <span className="timestamp">{message.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant loading">
                <div className="message-header">
                  <span className="role">Gemini</span>
                </div>
                <div className="message-content">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <FileAttachment
              onFilesSelected={handleFilesSelected}
              attachedFiles={attachedFiles}
              onRemoveFile={handleRemoveFile}
            />
            <textarea
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
              disabled={isLoading}
              rows={3}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? '전송 중...' : '전송'}
            </button>
          </div>
        </div>
      </div>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />
    </div>
  );
};

export default App;
