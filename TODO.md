# TODO — Gemini GUI Feature Backlog

Priority: 🔴 High | 🟡 Medium | 🟢 Low

## 🔴 High Priority

### Markdown Rendering
- [x] Render assistant responses as Markdown (bold, italic, lists, headers)
- [x] Code blocks with language labels
- [x] Inline code styling
- [ ] Syntax highlighting for code blocks (highlight.js or prism)
- [ ] LaTeX/math rendering support (KaTeX)

### Conversation Management  
- [x] Search through conversation history
- [x] Export conversation as Markdown file
- [ ] Export conversation as PDF
- [x] Delete individual messages
- [x] Clear conversation

### Theme System
- [x] Dark/Light theme toggle
- [x] System theme detection (prefers-color-scheme)
- [x] Theme persistence in settings
- [x] CSS variables for all colors

## 🟡 Medium Priority

### Multi-Tab Support
- [ ] Tab bar for multiple conversations
- [ ] New tab button
- [ ] Close tab with confirmation
- [ ] Tab switching with keyboard shortcuts (Ctrl+Tab)

### Keyboard Shortcuts
- [x] Ctrl+N: New conversation
- [x] Ctrl+L: Clear conversation
- [x] Ctrl+F: Search in conversation (focuses sidebar search)
- [x] Ctrl+,: Open settings
- [x] Escape: Close modals/panels
- [x] Ctrl+Enter: Send message (alternative)

### Input Enhancements
- [x] Auto-resize textarea (useAutoResize hook)
- [ ] Drag & drop file attachment
- [ ] Paste image from clipboard
- [ ] Message edit (click to edit sent message)
- [ ] Command palette (Ctrl+Shift+P)

### UI Polish
- [ ] Loading spinner during response generation
- [ ] Typing indicator animation
- [ ] Smooth scroll to bottom on new messages
- [x] Toast notifications for errors
- [x] Responsive sidebar (collapsible)

## 🟢 Low Priority

### Advanced Features
- [ ] Conversation branching (fork from any message)
- [ ] Token usage display
- [ ] Model selection dropdown
- [ ] System prompt editor
- [ ] Prompt templates/presets

### Accessibility
- [x] ARIA labels on all interactive elements
- [x] Screen reader announcements for new messages (aria-live="polite")
- [x] Focus management for keyboard navigation (tabIndex + Enter/Space on conversation items)
- [ ] High contrast mode

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

---
*Updated by agent team. Check PROGRESS.md for completion status.*
