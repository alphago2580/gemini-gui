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
import WelcomeScreen from './components/WelcomeScreen';
import InlineSearch from './components/InlineSearch';
import QuickSwitcher from './components/QuickSwitcher';
import FormattingToolbar from './components/FormattingToolbar';
import MessageContextMenu from './components/MessageContextMenu';
import type { ContextMenuItem } from './components/MessageContextMenu';
import { insertBold, insertItalic, insertInlineCode, insertStrikethrough, insertLink, insertCodeBlock } from './utils/textFormatting';
import type { Command } from './components/CommandPalette';
import { useInlineSearch } from './hooks/useInlineSearch';
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
import * as S from './constants/strings';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage(S.STORAGE_KEY_SIDEBAR_COLLAPSED, false);
  const [highContrast, setHighContrast] = useLocalStorage(S.STORAGE_KEY_HIGH_CONTRAST, false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageIndex: number } | null>(null);

  // Inline search (Ctrl+F within conversation)
  const inlineSearch = useInlineSearch(messages);

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

  // Formatting toolbar handler
  const handleFormat = useCallback((actionId: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const formatters: Record<string, (t: string, s: number, e: number) => { text: string; selectionStart: number; selectionEnd: number }> = {
      bold: insertBold, italic: insertItalic, code: insertInlineCode,
      strikethrough: insertStrikethrough, link: insertLink, codeblock: insertCodeBlock,
    };
    const fn = formatters[actionId];
    if (!fn) return;
    const result = fn(input, start, end);
    setInput(result.text);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }, [input, setInput, textareaRef]);

  // Context menu items and handler
  const contextMenuItems: ContextMenuItem[] = useMemo(() => [
    { id: 'copy', label: '복사', icon: '📋' },
    { id: 'edit', label: '수정', icon: '✏️' },
    { id: 'fork', label: '분기', icon: '🔀' },
    { id: 'delete', label: '삭제', icon: '🗑', danger: true },
  ], []);

  const handleContextMenuAction = useCallback((actionId: string) => {
    if (contextMenu === null) return;
    const idx = contextMenu.messageIndex;
    switch (actionId) {
      case 'copy':
        navigator.clipboard.writeText(messages[idx]?.content || '');
        break;
      case 'edit':
        editMessage(idx, messages[idx]?.content || '');
        break;
      case 'fork':
        forkConversation(idx);
        break;
      case 'delete':
        deleteMessage(idx);
        break;
    }
    setContextMenu(null);
  }, [contextMenu, messages, editMessage, forkConversation, deleteMessage]);

  const handleMessageContextMenu = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, messageIndex: index });
  }, []);

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
    { id: 'new-chat', label: S.CMD_NEW_CHAT, shortcut: 'Ctrl+N', action: handleNewChat },
    { id: 'clear', label: S.CMD_CLEAR, shortcut: 'Ctrl+L', action: handleClearConversation },
    { id: 'search', label: S.CMD_SEARCH, shortcut: 'Ctrl+F', action: () => inlineSearch.open() },
    { id: 'settings', label: S.CMD_SETTINGS, shortcut: 'Ctrl+,', action: () => setIsSettingsOpen(true) },
    { id: 'toggle-sidebar', label: S.CMD_TOGGLE_SIDEBAR, shortcut: 'Ctrl+B', action: handleToggleSidebar },
    { id: 'export', label: S.CMD_EXPORT_MD, action: handleExport },
    { id: 'export-pdf', label: S.CMD_EXPORT_PDF, action: handleExportPdf },
  ], [handleNewChat, handleClearConversation, handleToggleSidebar, handleExport, handleExportPdf, inlineSearch]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onClearConversation: handleClearConversation,
    onToggleSettings: () => setIsSettingsOpen(prev => !prev),
    onCloseSettings: () => setIsSettingsOpen(false),
    onFocusSearch: () => inlineSearch.open(),
    onToggleSidebar: handleToggleSidebar,
    onToggleCommandPalette: () => setIsCommandPaletteOpen(prev => !prev),
    onToggleQuickSwitcher: () => setIsQuickSwitcherOpen(prev => !prev),
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
            <h1>{S.APP_TITLE}</h1>
            <p>{S.MODEL_PREFIX} {S.MODEL_DISPLAY_NAMES[settings.model] || settings.model}</p>
          </div>
          {messages.length > 0 && (
            <div className="header-actions">
              <button
                className="header-action-btn"
                onClick={handleClearConversation}
                aria-label={S.ARIA_CLEAR}
                title={S.TITLE_CLEAR}
              >
                {S.CLEAR_BUTTON}
              </button>
              <button
                className="header-action-btn"
                onClick={handleExport}
                aria-label={S.ARIA_EXPORT}
                title={S.TITLE_EXPORT}
              >
                {S.EXPORT_BUTTON}
              </button>
              <button
                className="header-action-btn"
                onClick={handleExportPdf}
                aria-label={S.ARIA_EXPORT_PDF}
                title={S.TITLE_EXPORT_PDF}
              >
                {S.PDF_BUTTON}
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
          <InlineSearch
            isOpen={inlineSearch.isOpen}
            query={inlineSearch.query}
            matchCount={inlineSearch.matches.length}
            currentMatchIndex={inlineSearch.currentMatchIndex}
            onQueryChange={inlineSearch.setQuery}
            onNext={inlineSearch.goToNext}
            onPrev={inlineSearch.goToPrev}
            onClose={inlineSearch.close}
          />
          <div className="messages" role="log" aria-label={S.ARIA_MESSAGE_LOG} aria-live="polite" ref={messagesContainerRef} onScroll={handleMessagesScroll}>
            {messages.length === 0 && (
              <WelcomeScreen onPromptClick={(prompt) => setInput(prompt)} />
            )}
            {messages.map((message, index) => (
              <div key={message.id || index} onContextMenu={(e) => handleMessageContextMenu(e, index)}>
                <MessageBubble
                  message={message}
                  index={index}
                  isStreaming={isStreaming}
                  isLastAssistant={message.role === 'assistant' && index === messages.length - 1}
                  onDelete={deleteMessage}
                  onEdit={editMessage}
                  onFork={forkConversation}
                />
              </div>
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
              aria-label={S.SCROLL_TO_BOTTOM}
              title={S.SCROLL_TO_BOTTOM}
            >
              ↓
            </button>
          )}

          <div className="input-container" role="form" aria-label={S.ARIA_MESSAGE_INPUT}>
            <FileAttachment
              onFilesSelected={handleFilesSelected}
              attachedFiles={attachedFiles}
              onRemoveFile={handleRemoveFile}
            />
            <FormattingToolbar onFormat={handleFormat} />
            <div className="input-row">
            <PromptTemplates
              templates={templates}
              onSelect={(content) => setInput(prev => prev + content)}
              onAdd={addTemplate}
              onDelete={deleteTemplate}
            />
            <label htmlFor="message-input" className="sr-only">{S.ARIA_MESSAGE_INPUT}</label>
            <textarea
              ref={textareaRef}
              id="message-input"
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={S.MESSAGE_PLACEHOLDER}
              disabled={isLoading}
              rows={1}
              aria-label={S.ARIA_MESSAGE_INPUT}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label={isLoading ? S.ARIA_SENDING : S.ARIA_SEND}
            >
              {isLoading ? S.SENDING_BUTTON : S.SEND_BUTTON}
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
      <QuickSwitcher
        isOpen={isQuickSwitcherOpen}
        onClose={() => setIsQuickSwitcherOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelect={handleSelectConversation}
      />
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onSelect={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default App;
