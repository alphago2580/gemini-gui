# TODO — Gemini GUI Feature Backlog

Priority: 🔴 High | 🟡 Medium | 🟢 Low

## 🔴 High Priority

### Markdown Rendering
- [x] Render assistant responses as Markdown (bold, italic, lists, headers)
- [x] Code blocks with syntax highlighting (highlight.js or prism)
- [x] Inline code styling
- [x] LaTeX/math rendering support (KaTeX)
- [x] Markdown table rendering
- [x] Code block copy button

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
- [x] Ctrl+F: Search in conversation
- [x] Ctrl+,: Open settings
- [x] Escape: Close modals/panels
- [x] Ctrl+Enter: Send message (alternative)
- [x] Ctrl+B: Toggle sidebar
- [x] Ctrl+Shift+P: Command palette

### Input Enhancements
- [x] Auto-resize textarea
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

### UX Enhancements
- [x] Session status indicator — visual connection state (idle/connecting/connected/error) in header
- [x] Message count badge — show message count per conversation in sidebar
- [x] UserAvatar — role-based avatar component with initials and icon display
- [x] ProgressBar — versatile progress indicator with variants, sizes, animation
- [x] Tooltip — hover/focus tooltip with delay and 4 positions
- [x] Badge — notification count/dot indicator with wrapper and inline modes
- [x] Skeleton — loading placeholder with shimmer animation for text/circular/rectangular
- [x] Accordion — expandable/collapsible content sections with single/multiple mode
- [x] Switch — accessible toggle switch with sizes and labels
- [x] Chip — selectable/removable tag chips with variants and icons
- [x] AvatarGroup — stacked avatar display with overflow count
- [x] Divider — horizontal/vertical separator with label support

### Accessibility
- [x] ARIA labels on all interactive elements
- [x] Screen reader announcements for new messages
- [x] Focus management for keyboard navigation
- [x] High contrast mode

### Developer Experience
- [ ] Storybook for component development
- [ ] E2E test coverage for critical flows
- [ ] Performance monitoring (React Profiler)
- [x] Error boundary components

### Code Quality
- [x] Extract UI string constants for i18n readiness
- [x] React.memo on all components
- [x] useCallback/useMemo optimization
- [x] Zero TypeScript `any` types
- [x] Zero TypeScript type-checking errors
- [x] Stable message IDs for React keys
- [x] Custom hooks extracted from App.tsx (12 hooks)
- [ ] Storybook for component development
- [ ] E2E tests with Playwright

---
*Updated by agent team. Check PROGRESS.md for completion status.*
