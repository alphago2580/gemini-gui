# TODO — Gemini GUI Feature Backlog

Priority: 🔴 High | 🟡 Medium | 🟢 Low

## 🔴 High Priority

### Markdown Rendering
- [x] Render assistant responses as Markdown (bold, italic, lists, headers)
- [x] Code blocks with language labels
- [x] Inline code styling
- [x] Syntax highlighting for code blocks (lightweight custom tokenizer)
- [x] LaTeX/math rendering support (lightweight custom renderer, no external deps)
- [x] Copy button on code blocks (clipboard API)
- [x] Table rendering (headers, alignment, inline markdown in cells)

### Conversation Management
- [x] Search through conversation history
- [x] Export conversation as Markdown file
- [x] Export conversation as PDF
- [x] Delete individual messages
- [x] Clear conversation
- [x] Delete conversation from sidebar

### Theme System
- [x] Dark/Light theme toggle
- [x] System theme detection (prefers-color-scheme)
- [x] Theme persistence in settings
- [x] CSS variables for all colors

## 🟡 Medium Priority

### Multi-Tab Support
- [x] Tab bar for multiple conversations
- [x] New tab button
- [x] Close tab with confirmation
- [x] Tab switching with keyboard shortcuts (Ctrl+Tab)

### Keyboard Shortcuts
- [x] Ctrl+N: New conversation
- [x] Ctrl+L: Clear conversation
- [x] Ctrl+F: Search in conversation (focuses sidebar search)
- [x] Ctrl+,: Open settings
- [x] Escape: Close modals/panels
- [x] Ctrl+Enter: Send message (alternative)

### Input Enhancements
- [x] Auto-resize textarea (useAutoResize hook)
- [x] Drag & drop file attachment
- [x] Paste image from clipboard
- [x] Message edit (click to edit sent message)
- [x] Command palette (Ctrl+Shift+P)

### UI Polish
- [x] Loading spinner during response generation
- [x] Typing indicator animation
- [x] Smooth scroll to bottom on new messages
- [x] Toast notifications for errors
- [x] Responsive sidebar (collapsible)

## 🟢 Low Priority

### Advanced Features
- [x] Conversation branching (fork from any message)
- [x] Token usage display
- [x] Model selection dropdown
- [x] System prompt editor
- [x] Prompt templates/presets

### Accessibility
- [x] ARIA labels on all interactive elements
- [x] Screen reader announcements for new messages (aria-live="polite")
- [x] Focus management for keyboard navigation (tabIndex + Enter/Space on conversation items)
- [x] High contrast mode

### Developer Experience
- [ ] Storybook for component development
- [ ] E2E test coverage for critical flows
- [ ] Performance monitoring (React Profiler)
- [x] Error boundary components (ErrorBoundary with tests)
- [x] Comprehensive unit tests for all components (106 tests)
- [x] Extract shared utility functions to src/renderer/utils/
- [x] Remove `any` types from codebase (AppSettings, StreamData, etc.)
- [x] Custom hooks extraction (useLocalStorage, useConversations, useKeyboardShortcuts, useAutoResize)
- [x] App.tsx refactored — conversation logic extracted to useConversations hook
- [x] Comprehensive accessibility (ARIA) improvements across all components (182 tests)
- [x] Export conversation as Markdown (195 tests)
- [x] Search through conversation history in sidebar (203 tests)
- [x] Delete individual messages (209 tests)
- [x] Clear conversation button + Ctrl+L (213 tests)
- [x] Ctrl+Enter send + onKeyPress→onKeyDown migration (215 tests)
- [x] Markdown rendering for messages — headings, bold, italic, code blocks, lists, blockquotes, links (239 tests)
- [x] Ctrl+F: Focus sidebar search shortcut (242 tests)
- [x] Toast notifications for errors with auto-dismiss (260 tests)
- [x] Responsive collapsible sidebar with Ctrl+B shortcut (278 tests)
- [x] High contrast mode with dark/light variants (287 tests)
- [x] Syntax highlighting for code blocks — JS/TS, Python, Bash, JSON, CSS (314 tests)
- [x] Command palette (Ctrl+Shift+P) with search, keyboard nav, 6 commands (349 tests)
- [x] Paste image from clipboard — detect image MIME types, attach to file list (353 tests)
- [x] Message edit — inline edit for user messages with save/cancel (361 tests)
- [x] Typing indicator animation — TypingIndicator component with streaming cursor (376 tests)
- [x] System prompt editor — textarea in Settings, --system-instruction CLI flag (388 tests)
- [x] Prompt templates/presets — PromptTemplates component with add/delete/select, usePromptTemplates hook (423 tests)
- [x] Model selection dropdown — updated model list, --model CLI flag, header display, full IPC wiring (434 tests)
- [x] Token usage display — TokenUsage component, camelCase/snake_case stats parsing, accessible (449 tests)
- [x] Export conversation as PDF — exportToHtml utility, hidden BrowserWindow printToPDF, header PDF button (464 tests)
- [x] Delete conversation from sidebar — hover-reveal × button, deleteConversation in useConversations, clears messages on current delete (476 tests)
- [x] LaTeX/math rendering — lightweight renderer, Greek letters, fractions, sqrt, sup/sub, math symbols, inline $...$ and block $$...$$ (535 tests)
- [x] MessageBubble component extraction — encapsulated message rendering, edit mode, delete, streaming cursor (559 tests)
- [x] useStreamHandler hook extraction — streaming data, errors, token usage, loading state (575 tests)
- [x] Code block copy button — clipboard API, visual feedback, accessible (581 tests)
- [x] Markdown table rendering — headers, alignment, inline markdown in cells, theme CSS (590 tests)
- [x] Multi-tab support — TabBar component, useTabs hook, Ctrl+Tab/Ctrl+Shift+Tab navigation, localStorage persistence (630 tests)
- [x] Smart scroll to bottom — useAutoScroll hook, auto-scroll when near bottom, scroll-to-bottom button when scrolled up (640 tests)
- [x] Conversation branching — fork from any message, creates new conversation with messages up to fork point, (분기) suffix in title (654 tests)
- [x] useMessageSend hook extraction — message sending, file handling, paste, key events extracted from App.tsx (672 tests)

---
*Updated by agent team. Check PROGRESS.md for completion status.*
