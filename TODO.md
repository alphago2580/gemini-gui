# TODO — Gemini GUI Feature Backlog

Priority: 🔴 High | 🟡 Medium | 🟢 Low

## 🔴 High Priority

### Markdown Rendering
- [ ] Render assistant responses as Markdown (bold, italic, lists, headers)
- [ ] Code blocks with syntax highlighting (highlight.js or prism)
- [ ] Inline code styling
- [ ] LaTeX/math rendering support (KaTeX)

### Conversation Management  
- [ ] Search through conversation history
- [ ] Export conversation as Markdown file
- [ ] Export conversation as PDF
- [ ] Delete individual messages
- [ ] Clear conversation

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
- [ ] Ctrl+F: Search in conversation
- [x] Ctrl+,: Open settings
- [x] Escape: Close modals/panels
- [ ] Ctrl+Enter: Send message (alternative)

### Input Enhancements
- [ ] Auto-resize textarea
- [ ] Drag & drop file attachment
- [ ] Paste image from clipboard
- [ ] Message edit (click to edit sent message)
- [ ] Command palette (Ctrl+Shift+P)

### UI Polish
- [ ] Loading spinner during response generation
- [ ] Typing indicator animation
- [ ] Smooth scroll to bottom on new messages
- [ ] Toast notifications for errors
- [ ] Responsive sidebar (collapsible)

## 🟢 Low Priority

### Advanced Features
- [ ] Conversation branching (fork from any message)
- [ ] Token usage display
- [ ] Model selection dropdown
- [ ] System prompt editor
- [ ] Prompt templates/presets

### Accessibility
- [ ] ARIA labels on all interactive elements
- [ ] Screen reader announcements for new messages
- [ ] Focus management for keyboard navigation
- [ ] High contrast mode

### Developer Experience
- [ ] Storybook for component development
- [ ] E2E test coverage for critical flows
- [ ] Performance monitoring (React Profiler)
- [x] Error boundary components (ErrorBoundary with tests)
- [x] Comprehensive unit tests for all components (106 tests)
- [x] Extract shared utility functions to src/renderer/utils/
- [x] Remove `any` types from codebase (AppSettings, StreamData, etc.)
- [x] Custom hooks extraction (useLocalStorage, useConversations, useKeyboardShortcuts)
- [x] App.tsx refactored — conversation logic extracted to useConversations hook

---
*Updated by agent team. Check PROGRESS.md for completion status.*
