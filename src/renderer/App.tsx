import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
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
import SplitButton from './components/SplitButton';
import Chip from './components/Chip';
import Tooltip from './components/Tooltip';
import type { SplitButtonOption } from './components/SplitButton';
import { calculateConversationStats } from './utils/conversationStats';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import EmojiReactionPicker from './components/EmojiReactionPicker';
import { insertBold, insertItalic, insertInlineCode, insertStrikethrough, insertLink, insertCodeBlock } from './utils/textFormatting';
import type { Command } from './components/CommandPalette';
import { useInlineSearch } from './hooks/useInlineSearch';
import { useMessageActions } from './hooks/useMessageActions';
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

  // Settings state (extracted to custom hook)
  const { settings, handleSettingsSave } = useSettings();

  // Notify when response completes while window is not focused (agent4)
  const handleStreamComplete = useCallback(async () => {
    const api = window.electronAPI;
    if (!api?.isWindowFocused || !api?.showNotification) return;
    const focused = await api.isWindowFocused();
    if (!focused) {
      api.showNotification(S.APP_TITLE, S.NOTIFICATION_RESPONSE_COMPLETE);
    }
  }, []);

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
    onComplete: handleStreamComplete,
  });

  // Dialog/panel state (extracted to custom hook)
  const dialogs = useDialogs();

  // UI state (localStorage-persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage(S.STORAGE_KEY_SIDEBAR_COLLAPSED, false);
  const [highContrast, setHighContrast] = useLocalStorage(S.STORAGE_KEY_HIGH_CONTRAST, false);

  // Performance monitor
  const perfMonitor = usePerformanceMonitor();

  // Inline search (Ctrl+F within conversation)
  const inlineSearch = useInlineSearch(messages);

  // Warn before closing when generation is in progress (agent4)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isLoading) {
        e.preventDefault();
        return S.CLOSE_CONFIRM_MESSAGE;
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isLoading]);

  // Apply high contrast attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', String(highContrast));
  }, [highContrast]);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.setProperty('--message-font-size', `${settings.fontSize}px`);
  }, [settings.fontSize]);

  // Auto-scroll
  const {
    messagesContainerRef,
    messagesEndRef,
    showScrollButton,
    scrollToBottom,
    handleScroll: handleMessagesScroll,
  } = useAutoScroll(messages);

  // Message actions (context menu, pin, bookmark, emoji, navigation)
  const msgActions = useMessageActions({
    messages,
    conversations,
    currentConversationId,
    editMessage,
    deleteMessage,
    forkConversation,
    messagesContainerRef,
    handleSelectConversation,
  });

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

  // Current conversation title (for window title sync)
  const currentConvTitle = useMemo(() => {
    const conv = conversations.find(c => c.id === currentConversationId);
    return conv?.title || S.UNTITLED_CONVERSATION;
  }, [conversations, currentConversationId]);

  // Sync window title with current conversation (agent4)
  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.setWindowTitle) return;
    const title = currentConversationId
      ? `${currentConvTitle} — ${S.APP_TITLE}`
      : S.APP_TITLE;
    api.setWindowTitle(title);
  }, [currentConvTitle, currentConversationId]);

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

  // Stop generation handler (agent4)
  const handleStopGeneration = useCallback(async () => {
    const api = window.electronAPI;
    if (!api?.stopGemini) return;
    await api.stopGemini();
    stopLoading();
  }, [stopLoading]);

  // Regenerate last response (agent4)
  const handleRegenerate = useCallback(() => {
    if (isLoading || messages.length === 0) return;
    let lastUserMsgIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMsgIndex = i;
        break;
      }
    }
    if (lastUserMsgIndex === -1) return;
    const lastUserContent = messages[lastUserMsgIndex].content;
    const trimmed = messages.slice(0, lastUserMsgIndex);
    setMessages(trimmed);
    updateCurrentConversation(trimmed);
    setInput(lastUserContent);
  }, [isLoading, messages, setMessages, updateCurrentConversation, setInput]);

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

  // Export split button options
  const exportOptions: SplitButtonOption[] = useMemo(() => [
    { id: 'export-md', label: S.EXPORT_MD_OPTION, icon: '📄', onClick: handleExport },
    { id: 'export-pdf', label: S.EXPORT_PDF_OPTION, icon: '📑', onClick: handleExportPdf },
  ], [handleExport, handleExportPdf]);

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
    { id: 'regenerate', label: S.REGENERATE_TITLE, action: handleRegenerate },
  ], [handleNewChat, handleClearConversation, handleToggleSidebar, handleExport, handleExportPdf, inlineSearch, dialogs, handleRegenerate]);

  // Native menu actions (agent4)
  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.onMenuAction) return;
    api.onMenuAction((action: string) => {
      switch (action) {
        case 'new-chat': handleNewChat(); break;
        case 'export-md': handleExport(); break;
        case 'export-pdf': handleExportPdf(); break;
        case 'settings': dialogs.openSettings(); break;
        case 'command-palette': dialogs.toggleCommandPalette(); break;
        case 'toggle-sidebar': handleToggleSidebar(); break;
        case 'shortcut-help': dialogs.toggleShortcutHelp(); break;
      }
    });
  }, [handleNewChat, handleExport, handleExportPdf, handleToggleSidebar, dialogs]);

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
              <Tooltip content={S.TITLE_CLEAR} position="bottom">
                <button
                  className="header-action-btn"
                  onClick={handleClearConversation}
                  aria-label={S.ARIA_CLEAR}
                >
                  {S.CLEAR_BUTTON}
                </button>
              </Tooltip>
              <SplitButton
                label={S.EXPORT_BUTTON}
                onClick={handleExport}
                options={exportOptions}
                variant="secondary"
                size="small"
                ariaLabel={S.ARIA_EXPORT}
              />
              <Tooltip content={S.TITLE_CODE_SNIPPETS} position="bottom">
                <button
                  className="header-action-btn"
                  onClick={dialogs.openCodeSnippets}
                  aria-label={S.ARIA_CODE_SNIPPETS}
                >
                  {S.CODE_BUTTON}
                </button>
              </Tooltip>
              <Tooltip content={S.TITLE_LINK_COLLECTION} position="bottom">
                <button
                  className="header-action-btn"
                  onClick={dialogs.openLinkCollection}
                  aria-label={S.ARIA_LINK_COLLECTION}
                >
                  {S.LINKS_BUTTON}
                </button>
              </Tooltip>
              <Tooltip content={S.TITLE_CONVERSATION_STATS} position="bottom">
                <button
                  className="header-action-btn"
                  onClick={dialogs.openStats}
                  aria-label={S.ARIA_CONVERSATION_STATS}
                >
                  {S.STATS_BUTTON}
                </button>
              </Tooltip>
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
            messages={msgActions.pinnedMessages}
            onNavigate={msgActions.handleNavigateToMessage}
            onUnpin={msgActions.handleUnpinMessage}
          />
          <div className="messages" role="log" aria-label={S.ARIA_MESSAGE_LOG} aria-live="polite" ref={messagesContainerRef} onScroll={handleScrollWithProgress}>
            <ReadingProgressBar progress={readingProgress} isVisible={messages.length > 0} />
            {messages.length === 0 && (
              <WelcomeScreen onPromptClick={(prompt) => setInput(prompt)} />
            )}
            {messages.map((message, index) => {
              const msgReactions = currentConversationId ? msgActions.getReactions(currentConversationId, index) : [];
              return (
                <div key={message.id || index} data-message-index={index} onContextMenu={(e) => msgActions.handleMessageContextMenu(e, index)}>
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
                        <Chip
                          key={r.emoji}
                          label={r.count > 1 ? `${r.emoji} ${r.count}` : r.emoji}
                          variant="default"
                          icon={undefined}
                        />
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
              <TokenUsage usage={tokenUsage} maxTokens={settings.maxTokens} />
            )}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
              <button
                className="regenerate-btn"
                onClick={handleRegenerate}
                aria-label={S.ARIA_REGENERATE}
                title={S.REGENERATE_TITLE}
              >
                {S.REGENERATE_BUTTON}
              </button>
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
            {isLoading ? (
              <button
                className="send-button stop-button"
                onClick={handleStopGeneration}
                aria-label={S.ARIA_STOP_GENERATION}
              >
                {S.STOP_BUTTON}
              </button>
            ) : (
              <button
                className="send-button"
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label={S.ARIA_SEND}
              >
                {S.SEND_BUTTON}
              </button>
            )}
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
        onNavigateToMessage={msgActions.handleNavigateToMessage}
      />
      <KeyboardShortcutHelp
        isOpen={dialogs.isShortcutHelpOpen}
        onClose={dialogs.closeShortcutHelp}
      />
      <LinkCollection
        isOpen={dialogs.isLinkCollectionOpen}
        onClose={dialogs.closeLinkCollection}
        messages={messages}
        onNavigateToMessage={msgActions.handleNavigateToMessage}
      />
      <ConversationStats
        isOpen={dialogs.isStatsOpen}
        onClose={dialogs.closeStats}
        stats={conversationStatsData}
      />
      <BookmarkedMessages
        isOpen={dialogs.isBookmarksOpen}
        onClose={dialogs.closeBookmarks}
        bookmarks={msgActions.bookmarks}
        onNavigateToMessage={msgActions.handleSearchNavigate}
        onRemoveBookmark={msgActions.removeBookmark}
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
        onNavigateToResult={msgActions.handleSearchNavigate}
      />
      {msgActions.contextMenu && (
        <MessageContextMenu
          x={msgActions.contextMenu.x}
          y={msgActions.contextMenu.y}
          items={msgActions.contextMenuItems}
          onSelect={msgActions.handleContextMenuAction}
          onClose={msgActions.closeContextMenu}
        />
      )}
      {msgActions.emojiPickerTarget && (
        <div className="emoji-picker-overlay" onClick={msgActions.closeEmojiPicker}>
          <div style={{ position: 'fixed', left: msgActions.emojiPickerTarget.x, top: msgActions.emojiPickerTarget.y }} onClick={(e) => e.stopPropagation()}>
            <EmojiReactionPicker
              isOpen={true}
              onSelect={msgActions.handleEmojiSelect}
              onClose={msgActions.closeEmojiPicker}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
