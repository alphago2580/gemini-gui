import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import FileAttachment from './components/FileAttachment';
import MessageBubble from './components/MessageBubble';
import Toast from './components/Toast';
import TypingIndicator from './components/TypingIndicator';
import CommandPalette from './components/CommandPalette';
import PromptTemplates from './components/PromptTemplates';
import TokenUsage from './components/TokenUsage';
import TabBar from './components/TabBar';
import type { Command } from './components/CommandPalette';
import { useConversations } from './hooks/useConversations';
import { usePromptTemplates } from './hooks/usePromptTemplates';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { useAutoResize } from './hooks/useAutoResize';
import { useToast } from './hooks/useToast';
import { useStreamHandler } from './hooks/useStreamHandler';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTabs } from './hooks/useTabs';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useMessageSend } from './hooks/useMessageSend';
import { useExport } from './hooks/useExport';
import { useSettings } from './hooks/useSettings';

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'auto': 'Auto',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
  'gemini-1.5-pro': 'Gemini 1.5 Pro',
  'gemini-1.5-flash': 'Gemini 1.5 Flash',
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
    editMessage,
    deleteConversation,
    forkConversation,
  } = useConversations();

  // Tabs
  const {
    tabs,
    selectTab,
    closeTab,
    newTab,
    nextTab,
    prevTab,
    ensureTabOpen,
    cleanupTabs,
  } = useTabs(currentConversationId, handleSelectConversation, handleNewChat, conversations);

  // Ensure current conversation is in tabs
  useEffect(() => {
    if (currentConversationId) {
      ensureTabOpen(currentConversationId);
    }
  }, [currentConversationId, ensureTabOpen]);

  // Clean up tabs when conversations are deleted (only after conversations are loaded)
  useEffect(() => {
    if (conversations.length > 0) {
      cleanupTabs(conversations.map(c => c.id));
    }
  }, [conversations, cleanupTabs]);

  // Theme
  const { themeMode, setThemeMode } = useTheme();

  // Toast notifications
  const { toasts, addToast, dismissToast } = useToast();

  // Prompt templates
  const { templates, addTemplate, deleteTemplate } = usePromptTemplates();

  // Stream handler
  const {
    isLoading,
    isStreaming,
    tokenUsage,
    clearTokenUsage,
    startLoading,
    stopLoading,
  } = useStreamHandler({
    currentConversationId,
    setMessages,
    updateCurrentConversation,
    addToast,
  });

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage('gemini-sidebar-collapsed', false);
  const [highContrast, setHighContrast] = useLocalStorage('gemini-high-contrast', false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Apply high contrast attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', String(highContrast));
  }, [highContrast]);

  // Auto-scroll
  const {
    messagesContainerRef,
    messagesEndRef,
    showScrollButton,
    scrollToBottom,
    handleScroll: handleMessagesScroll,
  } = useAutoScroll(messages);

  // Settings state (extracted to custom hook)
  const { settings, handleSettingsSave } = useSettings();

  // Message send logic (input, files, send, paste)
  const {
    input,
    setInput,
    attachedFiles,
    handleFilesSelected,
    handleRemoveFile,
    handleSend,
    handleKeyDown,
    handlePaste,
  } = useMessageSend({
    currentConversationId,
    isLoading,
    settings,
    setMessages,
    updateCurrentConversation,
    handleNewChat,
    startLoading,
    stopLoading,
    clearTokenUsage,
    addToast,
  });

  // Auto-resize textarea
  const { textareaRef } = useAutoResize(input);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Clear current conversation messages
  const handleClearConversation = useCallback(() => {
    if (currentConversationId) {
      updateCurrentConversation([]);
    }
  }, [currentConversationId, updateCurrentConversation]);

  // Toggle sidebar collapse
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, [setIsSidebarCollapsed]);

  // Export handlers (extracted to custom hook)
  const { handleExport, handleExportPdf } = useExport({
    messages,
    conversations,
    currentConversationId,
  });

  // Command palette commands
  const commands: Command[] = useMemo(() => [
    { id: 'new-chat', label: '새 대화', shortcut: 'Ctrl+N', action: handleNewChat },
    { id: 'clear', label: '대화 지우기', shortcut: 'Ctrl+L', action: handleClearConversation },
    { id: 'search', label: '대화 검색', shortcut: 'Ctrl+F', action: () => searchInputRef.current?.focus() },
    { id: 'settings', label: '설정 열기', shortcut: 'Ctrl+,', action: () => setIsSettingsOpen(true) },
    { id: 'toggle-sidebar', label: '사이드바 토글', shortcut: 'Ctrl+B', action: handleToggleSidebar },
    { id: 'export', label: 'Markdown으로 내보내기', action: handleExport },
    { id: 'export-pdf', label: 'PDF로 내보내기', action: handleExportPdf },
  ], [handleNewChat, handleClearConversation, handleToggleSidebar, handleExport, handleExportPdf]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onClearConversation: handleClearConversation,
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    onCloseSettings: () => setIsSettingsOpen(false),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onToggleSidebar: handleToggleSidebar,
    onToggleCommandPalette: () => setIsCommandPaletteOpen(prev => !prev),
    onNextTab: nextTab,
    onPrevTab: prevTab,
    isSettingsOpen,
  });


  return (
    <div className="app" role="application">
      <Sidebar
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={deleteConversation}
        searchInputRef={searchInputRef}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <main className="main-content">
        <header className="app-header">
          <div className="header-title">
            <h1>Gemini GUI</h1>
            <p>모델: {MODEL_DISPLAY_NAMES[settings.model] || settings.model}</p>
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
              <button
                className="header-action-btn"
                onClick={handleExportPdf}
                aria-label="PDF로 내보내기"
                title="PDF로 내보내기"
              >
                PDF
              </button>
            </div>
          )}
        </header>

        <TabBar
          tabs={tabs}
          activeTabId={currentConversationId}
          onSelectTab={selectTab}
          onCloseTab={closeTab}
          onNewTab={newTab}
        />

        <div className="chat-container">
          <div className="messages" role="log" aria-label="대화 메시지" aria-live="polite" ref={messagesContainerRef} onScroll={handleMessagesScroll}>
            {messages.length === 0 && (
              <div className="welcome-message">
                <h2>Gemini에 오신 것을 환영합니다!</h2>
                <p>아래 입력창에 메시지를 입력하여 대화를 시작하세요.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                index={index}
                isStreaming={isStreaming}
                isLastAssistant={message.role === 'assistant' && index === messages.length - 1}
                onDelete={deleteMessage}
                onEdit={editMessage}
                onFork={forkConversation}
              />
            ))}
            {isLoading && (
              <TypingIndicator isStreaming={isStreaming} />
            )}
            {tokenUsage && !isLoading && (
              <TokenUsage usage={tokenUsage} />
            )}
            <div ref={messagesEndRef} />
          </div>

          {showScrollButton && (
            <button
              className="scroll-to-bottom-btn"
              onClick={() => scrollToBottom('smooth')}
              aria-label="새 메시지로 이동"
              title="새 메시지로 이동"
            >
              ↓
            </button>
          )}

          <div className="input-container" role="form" aria-label="메시지 입력">
            <FileAttachment
              onFilesSelected={handleFilesSelected}
              attachedFiles={attachedFiles}
              onRemoveFile={handleRemoveFile}
            />
            <div className="input-row">
            <PromptTemplates
              templates={templates}
              onSelect={(content) => setInput(prev => prev + content)}
              onAdd={addTemplate}
              onDelete={deleteTemplate}
            />
            <label htmlFor="message-input" className="sr-only">메시지 입력</label>
            <textarea
              ref={textareaRef}
              id="message-input"
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
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
        </div>
      </main>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsSave}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        highContrast={highContrast}
        onHighContrastChange={setHighContrast}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
};

export default App;
