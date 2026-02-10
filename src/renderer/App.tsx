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
import CodeSnippets from './components/CodeSnippets';
import KeyboardShortcutHelp from './components/KeyboardShortcutHelp';
import ReadingProgressBar from './components/ReadingProgressBar';
import LinkCollection from './components/LinkCollection';
import ConversationStats from './components/ConversationStats';
import BookmarkedMessages from './components/BookmarkedMessages';
import PerformancePanel from './components/PerformancePanel';
import MessageSearch from './components/MessageSearch';
import InputPreview from './components/InputPreview';
import PinnedMessages from './components/PinnedMessages';
import type { PinnedMessage } from './components/PinnedMessages';
import { calculateConversationStats } from './utils/conversationStats';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import { useBookmarks } from './hooks/useBookmarks';
import { useEmojiReactions } from './hooks/useEmojiReactions';
import EmojiReactionPicker from './components/EmojiReactionPicker';
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
import { useDialogs } from './hooks/useDialogs';
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

  // Dialog/panel state (extracted to custom hook)
  const dialogs = useDialogs();

  // UI state (localStorage-persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage(S.STORAGE_KEY_SIDEBAR_COLLAPSED, false);
  const [highContrast, setHighContrast] = useLocalStorage(S.STORAGE_KEY_HIGH_CONTRAST, false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageIndex: number } | null>(null);
  const [pinnedMessages, setPinnedMessages] = useLocalStorage<PinnedMessage[]>(S.STORAGE_KEY_PINNED_MESSAGES, []);

  // Performance monitor
  const perfMonitor = usePerformanceMonitor();

  // Bookmarks
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();

  // Emoji reactions
  const { toggleReaction, getReactions } = useEmojiReactions();
  const [emojiPickerTarget, setEmojiPickerTarget] = useState<{ index: number; x: number; y: number } | null>(null);

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

  // Reading progress
  const [readingProgress, setReadingProgress] = useState(0);
  const handleScrollWithProgress = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    handleMessagesScroll();
    const el = e.currentTarget;
    if (el.scrollHeight <= el.clientHeight) {
      setReadingProgress(100);
    } else {
      const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
      setReadingProgress(pct);
    }
  }, [handleMessagesScroll]);

  // Conversation stats (computed)
  const conversationStatsData = useMemo(
    () => calculateConversationStats(conversations),
    [conversations]
  );

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

  // Pin/unpin message handlers
  const handlePinMessage = useCallback((messageIndex: number) => {
    const msg = messages[messageIndex];
    if (!msg) return;
    setPinnedMessages(prev => {
      if (prev.some(p => p.index === messageIndex)) return prev;
      return [...prev, { index: messageIndex, role: msg.role, content: msg.content }];
    });
  }, [messages, setPinnedMessages]);

  const handleUnpinMessage = useCallback((messageIndex: number) => {
    setPinnedMessages(prev => prev.filter(p => p.index !== messageIndex));
  }, [setPinnedMessages]);

  // Context menu items and handler
  const contextMenuItems: ContextMenuItem[] = useMemo(() => [
    { id: 'copy', label: S.CTX_COPY, icon: S.CTX_COPY_ICON },
    { id: 'edit', label: S.CTX_EDIT, icon: S.CTX_EDIT_ICON },
    { id: 'pin', label: S.CTX_PIN, icon: S.CTX_PIN_ICON },
    { id: 'bookmark', label: S.CTX_BOOKMARK, icon: S.CTX_BOOKMARK_ICON },
    { id: 'emoji', label: S.CTX_REACTION, icon: S.CTX_REACTION_ICON },
    { id: 'fork', label: S.CTX_FORK, icon: S.CTX_FORK_ICON },
    { id: 'delete', label: S.CTX_DELETE, icon: S.CTX_DELETE_ICON, danger: true },
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
      case 'pin':
        handlePinMessage(idx);
        break;
      case 'bookmark': {
        const msg = messages[idx];
        if (msg) {
          const conv = conversations.find(c => c.id === currentConversationId);
          addBookmark({
            conversationId: currentConversationId || '',
            conversationTitle: conv?.title || S.CTX_NO_TITLE,
            messageIndex: idx,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(),
          });
        }
        break;
      }
      case 'emoji':
        setEmojiPickerTarget({ index: idx, x: contextMenu.x, y: contextMenu.y });
        break;
      case 'fork':
        forkConversation(idx);
        break;
      case 'delete':
        deleteMessage(idx);
        break;
    }
    setContextMenu(null);
  }, [contextMenu, messages, editMessage, handlePinMessage, forkConversation, deleteMessage, conversations, currentConversationId, addBookmark]);

  const handleNavigateToMessage = useCallback((messageIndex: number) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const messageElements = container.querySelectorAll('[data-message-index]');
    const target = messageElements[messageIndex];
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [messagesContainerRef]);

  const handleMessageContextMenu = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, messageIndex: index });
  }, []);

  // Emoji reaction handler
  const handleEmojiSelect = useCallback((emoji: string) => {
    if (emojiPickerTarget && currentConversationId) {
      toggleReaction(currentConversationId, emojiPickerTarget.index, emoji);
    }
    setEmojiPickerTarget(null);
  }, [emojiPickerTarget, currentConversationId, toggleReaction]);

  // MessageSearch navigation: switch to conversation and scroll to message
  const handleSearchNavigate = useCallback((conversationId: string, messageIndex: number) => {
    if (conversationId !== currentConversationId) {
      handleSelectConversation(conversationId);
    }
    setTimeout(() => handleNavigateToMessage(messageIndex), 100);
  }, [currentConversationId, handleSelectConversation, handleNavigateToMessage]);

  // Performance data (computed)
  const perfData = useMemo(
    () => perfMonitor.getData(messages.length, conversations.length),
    [perfMonitor, messages.length, conversations.length]
  );

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
    { id: 'settings', label: S.CMD_SETTINGS, shortcut: 'Ctrl+,', action: dialogs.openSettings },
    { id: 'toggle-sidebar', label: S.CMD_TOGGLE_SIDEBAR, shortcut: 'Ctrl+B', action: handleToggleSidebar },
    { id: 'export', label: S.CMD_EXPORT_MD, action: handleExport },
    { id: 'export-pdf', label: S.CMD_EXPORT_PDF, action: handleExportPdf },
    { id: 'message-search', label: S.CMD_MESSAGE_SEARCH, action: dialogs.openMessageSearch },
    { id: 'perf-monitor', label: S.CMD_PERF_MONITOR, action: dialogs.openPerfPanel },
    { id: 'toggle-preview', label: S.CMD_TOGGLE_PREVIEW, action: dialogs.toggleInputPreview },
    { id: 'bookmarks', label: S.CMD_BOOKMARKS, action: dialogs.openBookmarks },
  ], [handleNewChat, handleClearConversation, handleToggleSidebar, handleExport, handleExportPdf, inlineSearch, dialogs]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onClearConversation: handleClearConversation,
    onToggleSettings: dialogs.toggleSettings,
    onCloseSettings: dialogs.closeSettings,
    onFocusSearch: () => inlineSearch.open(),
    onToggleSidebar: handleToggleSidebar,
    onToggleCommandPalette: dialogs.toggleCommandPalette,
    onToggleQuickSwitcher: dialogs.toggleQuickSwitcher,
    onNextTab: nextTab,
    onPrevTab: prevTab,
    onToggleShortcutHelp: dialogs.toggleShortcutHelp,
    isSettingsOpen: dialogs.isSettingsOpen,
  });


  return (
    <div className="app" role="application">
      <Sidebar
        onNewChat={handleNewChat}
        onOpenSettings={dialogs.openSettings}
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
              <button
                className="header-action-btn"
                onClick={dialogs.openCodeSnippets}
                aria-label={S.ARIA_CODE_SNIPPETS}
                title={S.TITLE_CODE_SNIPPETS}
              >
                {S.CODE_BUTTON}
              </button>
              <button
                className="header-action-btn"
                onClick={dialogs.openLinkCollection}
                aria-label={S.ARIA_LINK_COLLECTION}
                title={S.TITLE_LINK_COLLECTION}
              >
                {S.LINKS_BUTTON}
              </button>
              <button
                className="header-action-btn"
                onClick={dialogs.openStats}
                aria-label={S.ARIA_CONVERSATION_STATS}
                title={S.TITLE_CONVERSATION_STATS}
              >
                {S.STATS_BUTTON}
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
          <PinnedMessages
            messages={pinnedMessages}
            onNavigate={handleNavigateToMessage}
            onUnpin={handleUnpinMessage}
          />
          <div className="messages" role="log" aria-label={S.ARIA_MESSAGE_LOG} aria-live="polite" ref={messagesContainerRef} onScroll={handleScrollWithProgress}>
            <ReadingProgressBar progress={readingProgress} isVisible={messages.length > 0} />
            {messages.length === 0 && (
              <WelcomeScreen onPromptClick={(prompt) => setInput(prompt)} />
            )}
            {messages.map((message, index) => {
              const msgReactions = currentConversationId ? getReactions(currentConversationId, index) : [];
              return (
                <div key={message.id || index} data-message-index={index} onContextMenu={(e) => handleMessageContextMenu(e, index)}>
                  <MessageBubble
                    message={message}
                    index={index}
                    isStreaming={isStreaming}
                    isLastAssistant={message.role === 'assistant' && index === messages.length - 1}
                    onDelete={deleteMessage}
                    onEdit={editMessage}
                    onFork={forkConversation}
                  />
                  {msgReactions.length > 0 && (
                    <div className="message-reactions">
                      {msgReactions.map(r => (
                        <span key={r.emoji} className="message-reaction-badge" title={`${r.emoji} ${r.count}`}>
                          {r.emoji}{r.count > 1 ? ` ${r.count}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
            <InputPreview content={input} isVisible={dialogs.isInputPreviewVisible} />
          </div>
        </div>
      </main>

      <Settings
        isOpen={dialogs.isSettingsOpen}
        onClose={dialogs.closeSettings}
        settings={settings}
        onSave={handleSettingsSave}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        highContrast={highContrast}
        onHighContrastChange={setHighContrast}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
      <CommandPalette
        isOpen={dialogs.isCommandPaletteOpen}
        onClose={dialogs.closeCommandPalette}
        commands={commands}
      />
      <QuickSwitcher
        isOpen={dialogs.isQuickSwitcherOpen}
        onClose={dialogs.closeQuickSwitcher}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelect={handleSelectConversation}
      />
      <CodeSnippets
        isOpen={dialogs.isCodeSnippetsOpen}
        onClose={dialogs.closeCodeSnippets}
        messages={messages}
        onNavigateToMessage={handleNavigateToMessage}
      />
      <KeyboardShortcutHelp
        isOpen={dialogs.isShortcutHelpOpen}
        onClose={dialogs.closeShortcutHelp}
      />
      <LinkCollection
        isOpen={dialogs.isLinkCollectionOpen}
        onClose={dialogs.closeLinkCollection}
        messages={messages}
        onNavigateToMessage={handleNavigateToMessage}
      />
      <ConversationStats
        isOpen={dialogs.isStatsOpen}
        onClose={dialogs.closeStats}
        stats={conversationStatsData}
      />
      <BookmarkedMessages
        isOpen={dialogs.isBookmarksOpen}
        onClose={dialogs.closeBookmarks}
        bookmarks={bookmarks}
        onNavigateToMessage={handleSearchNavigate}
        onRemoveBookmark={removeBookmark}
      />
      <PerformancePanel
        isOpen={dialogs.isPerfPanelOpen}
        onClose={dialogs.closePerfPanel}
        data={perfData}
        isMonitoring={perfMonitor.isEnabled}
        onToggleMonitoring={perfMonitor.toggle}
        onReset={perfMonitor.reset}
      />
      <MessageSearch
        isOpen={dialogs.isMessageSearchOpen}
        onClose={dialogs.closeMessageSearch}
        conversations={conversations}
        onNavigateToResult={handleSearchNavigate}
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
      {emojiPickerTarget && (
        <div className="emoji-picker-overlay" onClick={() => setEmojiPickerTarget(null)}>
          <div style={{ position: 'fixed', left: emojiPickerTarget.x, top: emojiPickerTarget.y }} onClick={(e) => e.stopPropagation()}>
            <EmojiReactionPicker
              isOpen={true}
              onSelect={handleEmojiSelect}
              onClose={() => setEmojiPickerTarget(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
