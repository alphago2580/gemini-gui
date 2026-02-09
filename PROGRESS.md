# PROGRESS — Gemini GUI Agent Team

## Current Status
- **Version**: 0.1.0
- **Total Lines**: ~1400
- **Test Status**: Passing (278 tests)
- **Last Agent Run**: Agent 2 (Quality)

## Completed Features
- [x] Basic Electron + React shell
- [x] Gemini CLI process management
- [x] Chat interface (send/receive)
- [x] Sidebar with conversation list
- [x] Settings panel
- [x] File attachment support
- [x] Dark/Light/System theme system
- [x] Markdown rendering for messages

## Agent Activity Log
<!-- Agents: append your work here -->

### Agent 2 (Quality) — Test Coverage & Refactoring
- Added comprehensive unit tests for Sidebar component (13 tests)
- Added comprehensive unit tests for Settings component (17 tests)
- Added comprehensive unit tests for FileAttachment component (20 tests)
- Expanded App.tsx integration tests from 2 to 24 tests
- Extracted utility functions (formatFileSize, getFileIcon, generateConversationTitle) to `src/renderer/utils/format.ts`
- Added 14 unit tests for extracted utility functions
- Updated FileAttachment.tsx and App.tsx to use shared utilities
- Total tests: 6 → 92 (all passing)

### Agent 2 (Quality) — Error Boundary, TypeScript Strictness & Custom Hooks
- Added ErrorBoundary component with default/custom fallback UI and reset functionality
- Added 6 tests for ErrorBoundary component
- Wrapped root App component with ErrorBoundary in index.tsx
- Fixed `any` types throughout codebase:
  - Settings.tsx: `onSave: (settings: any)` → `onSave: (settings: AppSettings)`
  - App.tsx: Replaced all `any` with proper types (StreamData, StreamErrorData, unknown)
  - preload/index.ts: Replaced `any` callbacks with `unknown`
- Added shared `AppSettings`, `StreamData`, `StreamErrorData` interfaces to `types.d.ts`
- Added missing `newConversation` method to `ElectronAPI` type definition
- Created `useLocalStorage` custom hook with 8 tests
- Total tests: 92 → 106 (all passing)

### Agent 2 (Quality) — useConversations Hook Extraction & Keyboard Shortcuts
- Extracted conversation management logic from App.tsx into `useConversations` custom hook
- Added `Message` and `Conversation` interfaces to shared types in `types.d.ts`
- App.tsx reduced from ~460 lines to ~355 lines
- Added 15 unit tests for `useConversations` hook
- Created `useKeyboardShortcuts` hook with Ctrl+N (new chat), Ctrl+L (clear), Ctrl+, (settings), Escape (close settings)
- Added 10 unit tests for `useKeyboardShortcuts` hook
- Total tests: 106 → 131 (all passing)

### Agent 2 (Quality) — Dark/Light Theme System
- Created `useTheme` hook with dark/light/system mode support
- Added `ThemeMode` type to shared types in `types.d.ts`
- Defined CSS variables for all colors in `:root` (dark) and `[data-theme="light"]`
- Replaced all hardcoded colors across 5 CSS files with CSS variables
- Added theme selector UI (3-button toggle) to Settings panel
- System theme detection via `prefers-color-scheme` media query with live updates
- Theme persisted to localStorage (`gemini-theme` key)
- Added 12 tests for `useTheme` hook
- Added 4 tests for theme selector in Settings
- Total tests: 131 → 147 (all passing)

### Agent 2 (Quality) — Accessibility & Auto-Resize Textarea
- Added ARIA labels, roles, and landmarks to all components (App, Sidebar, Settings, FileAttachment)
- App.tsx: `role="application"`, `<main>` landmark, `role="log"` with `aria-live="polite"` on messages, `role="form"` on input area, `role="article"` on messages, `role="status"` on loading indicator
- Sidebar.tsx: Changed to `<nav>` element, added `role="list"`/`role="listitem"`, `aria-current` on active conversation, keyboard navigation (Enter/Space) on conversation items, `tabIndex={0}` for focusability
- Settings.tsx: Added `role="dialog"`, `aria-modal="true"`, `aria-label` on close button
- FileAttachment.tsx: Added `role="region"`, `role="list"`/`role="listitem"` on file chips, descriptive `aria-label` on remove buttons with filename, `aria-hidden` on decorative icons
- Added `sr-only` CSS utility class for screen reader labels
- Created `useAutoResize` hook for auto-resizing textarea (min 44px, max 200px)
- Textarea auto-grows with content and shows scrollbar when exceeding max height
- Added 7 tests for `useAutoResize` hook
- Added 8 accessibility tests for App component
- Added 10 accessibility tests for Sidebar component
- Added 3 accessibility tests for Settings component
- Added 7 accessibility tests for FileAttachment component
- Total tests: 147 → 182 (all passing)

### Agent 2 (Quality) — Export Conversation as Markdown
- Created `exportToMarkdown` utility function in `src/renderer/utils/format.ts`
- Added `ExportableMessage` interface for type-safe message export
- Added IPC handler `export-markdown` in main process with native save dialog
- Added `exportMarkdown` to ElectronAPI type and preload bridge
- Added Export button in app header (visible only when messages exist)
- Styled export button with CSS variables for theme support
- Added 8 tests for `exportToMarkdown` function
- Added 5 tests for export UI in App component
- Total tests: 182 → 195 (all passing)

### Agent 2 (Quality) — Search Through Conversation History
- Added search input to Sidebar component with real-time filtering
- Search filters by conversation title and message content (case-insensitive)
- Shows "검색 결과가 없습니다" when no matches found
- Used `useMemo` for efficient filtering
- Added search input CSS with theme variable support
- Added `aria-label` on search input for accessibility
- Added 8 tests for search functionality (title search, content search, case-insensitive, empty results, clear search)
- Total tests: 195 → 203 (all passing)

### Agent 2 (Quality) — Delete Individual Messages
- Added `deleteMessage` function to `useConversations` hook
- Added delete button (×) on each message bubble, visible on hover
- Button hidden by default, appears on message hover for clean UI
- Updates both local state and conversation storage
- Added 4 tests for `deleteMessage` in useConversations hook
- Added 2 tests for delete UI in App component
- Total tests: 203 → 209 (all passing)

### Agent 2 (Quality) — Clear Conversation Button
- Added Clear button in header alongside Export (grouped in `.header-actions`)
- Clear button visible only when messages exist, triggers `handleClearConversation`
- Refactored single export button to header-actions group with shared CSS class
- Added 4 tests for Clear button (visibility, clearing, welcome message restore, aria-label)
- Total tests: 209 → 213 (all passing)

### Agent 2 (Quality) — Ctrl+Enter Send & KeyDown Migration
- Migrated textarea from deprecated `onKeyPress` to `onKeyDown`
- Ctrl+Enter now sends messages (alongside plain Enter)
- Shift+Enter preserved as newline behavior
- Updated placeholder text to document Ctrl+Enter shortcut
- Added 2 tests: Ctrl+Enter send, Shift+Enter no-send
- Total tests: 213 → 215 (all passing)

### Agent 2 (Quality) — Markdown Rendering
- Created `MarkdownRenderer` component for rendering Markdown content in messages
- Supports: headings (h1-h6), **bold**, *italic*, `inline code`, fenced code blocks with language labels, unordered/ordered lists, blockquotes, horizontal rules, links
- Code blocks display with language badge and monospace font styling
- All inline formatting (bold, italic, code, links) works within any block element
- Applied to all messages via `<MarkdownRenderer content={message.content} />`
- Added MarkdownRenderer.css with full theme variable support (dark/light)
- Removed `white-space: pre-wrap` from `.message-content` to work with Markdown blocks
- Added 24 tests for MarkdownRenderer (plain text, headings, inline formatting, code blocks, lists, blockquotes, horizontal rules, complex content)
- Total tests: 215 → 239 (all passing)

### Agent 2 (Quality) — Ctrl+F Search Focus Shortcut
- Added `onFocusSearch` callback to `useKeyboardShortcuts` hook
- Ctrl+F / Cmd+F focuses the sidebar search input
- Added `searchInputRef` prop to Sidebar component for ref-based focus control
- App.tsx creates ref and passes it to Sidebar, wired to keyboard shortcut
- Added 2 tests for useKeyboardShortcuts (Ctrl+F, Meta+F)
- Added 1 integration test for App (Ctrl+F focuses sidebar search)
- Total tests: 239 → 242 (all passing)

### Agent 2 (Quality) — Toast Notifications
- Created `Toast` component with auto-dismiss (5s), manual dismiss, and exit animation
- Supports error/success/info types with distinct colors
- Created `useToast` hook for managing toast state (addToast, dismissToast)
- Integrated into App.tsx: shows toast on stream errors and send errors
- Toast positioned fixed top-right with slide-in/out animations
- Full accessibility: `role="alert"`, `aria-live="assertive"`, `aria-label` on close button
- Added 11 tests for Toast component (rendering, types, accessibility, auto-dismiss, manual dismiss)
- Added 6 tests for useToast hook (add, dismiss, unique IDs)
- Added 1 integration test in App (toast shown on send error)
- Total tests: 242 → 260 (all passing)

### Agent 2 (Quality) — Responsive Collapsible Sidebar
- Added `isCollapsed` and `onToggleCollapse` props to Sidebar component
- Collapsed state hides title, search, conversations list; shows only icon buttons
- Toggle button with ◀/▶ indicators and accessible aria-labels
- CSS transition animation (width 260px ↔ 60px, 0.2s ease)
- State persisted via `useLocalStorage('gemini-sidebar-collapsed')`
- Added Ctrl+B / Cmd+B keyboard shortcut to toggle sidebar (useKeyboardShortcuts)
- Added 11 tests for Sidebar collapse (toggle, class, hiding, accessibility)
- Added 2 tests for Ctrl+B in useKeyboardShortcuts
- Added 5 integration tests in App (toggle, Ctrl+B, persistence)
- Total tests: 260 → 278 (all passing)
