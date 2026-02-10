# PROGRESS — Gemini GUI Agent Team

## Current Status
- **Version**: 0.1.0
- **Total Lines**: ~1400
- **Test Status**: Passing (1672 tests)
- **Last Agent Run**: Agent 2 (Hooks & Utils)

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

### Agent 2 (Quality) — High Contrast Mode
- Added `[data-high-contrast="true"]` CSS variable overrides for both dark and light themes
- High contrast dark: pure black background, white text, stronger borders
- High contrast light: pure white background, black text, thick dark borders
- Toggle in Settings: ON/OFF button with `role="switch"` and `aria-checked`
- State persisted via `useLocalStorage('gemini-high-contrast')`
- Applied as `data-high-contrast` attribute on `document.documentElement`
- Added 6 tests in Settings (toggle rendering, state, callbacks)
- Added 3 integration tests in App (attribute, enable via settings, persistence)
- Total tests: 278 → 287 (all passing)

### Agent 2 (Quality) — Syntax Highlighting for Code Blocks
- Created lightweight `syntaxHighlight.ts` tokenizer (no external deps)
- Supports JS/TS, Python, Bash, JSON, CSS language families
- Tokenizes: keywords, strings, comments, numbers, function calls, punctuation
- Tokens rendered as `<span class="sh-{type}">` in MarkdownRenderer code blocks
- CSS colors inspired by VS Code theme (dark + light variants)
- Only applied when language is specified; plain code blocks unchanged
- Added 22 unit tests for tokenizer (keywords, strings, comments, numbers, etc.)
- Added 5 integration tests in MarkdownRenderer (highlighting, no-lang fallback, text preservation)
- Total tests: 287 → 314 (16 test files, all passing)

### Agent 2 (Quality) — Command Palette (Ctrl+Shift+P)
- Created `CommandPalette` component with fuzzy search, keyboard navigation, and command execution
- Supports: search input with filtering, ArrowUp/Down navigation, Enter to execute, Escape to close
- 6 built-in commands: New Chat, Clear, Search, Settings, Toggle Sidebar, Export Markdown
- Each command displays label and optional keyboard shortcut badge
- Added Ctrl+Shift+P / Cmd+Shift+P to `useKeyboardShortcuts` hook (toggles palette)
- Overlay click to dismiss, click-through prevention on palette body
- Full accessibility: `role="dialog"` + `aria-modal`, `role="combobox"` input, `role="listbox"` + `role="option"` items, `aria-activedescendant`
- CSS: overlay with centered top-positioned palette, scrollable list, selected item highlight, theme vars
- Added 26 unit tests for CommandPalette (rendering, filtering, keyboard nav, execution, accessibility)
- Added 3 tests for Ctrl+Shift+P in useKeyboardShortcuts
- Added 6 integration tests in App (open/close, command execution, toggle)
- Total tests: 314 → 349 (17 test files, all passing)

### Agent 2 (Quality) — Paste Image from Clipboard
- Added `handlePaste` event handler on textarea for clipboard image pasting
- Detects `image/*` MIME types in `clipboardData.items`, converts to File objects
- Prevents default behavior for image pastes (allows text paste through)
- Pasted images appear in FileAttachment file chip list
- Added 4 integration tests in App (attach PNG, attach JPEG, skip text, multiple images)
- Total tests: 349 → 353 (17 test files, all passing)

### Agent 2 (Quality) — Message Edit (Click to Edit Sent Message)
- Added `editMessage` function to `useConversations` hook
- Edit button (pencil icon &#9998;) appears on hover for user messages only
- Click edit: inline textarea replaces message content with save/cancel buttons
- Save: updates message content in state and localStorage
- Cancel: reverts to original content, exits edit mode
- CSS: edit-message-btn, edit-message-form, edit-message-input, edit-save-btn, edit-cancel-btn
- `.editing` class on message bubble highlights border during edit
- Added 3 unit tests for `editMessage` in useConversations hook
- Added 5 integration tests in App (show button, enter edit, populate, save, cancel)
- Total tests: 353 → 361 (17 test files, all passing)

### Agent 2 (Quality) — Typing Indicator Animation
- Created `TypingIndicator` component replacing inline loading-dots in App.tsx
- Shows "생각하는 중..." before streaming starts, "입력 중..." during streaming
- Bounce dots animation with configurable `isStreaming` prop
- Added blinking streaming cursor (`▋`) on last assistant message during streaming
- Cursor applied via `.streaming-cursor::after` CSS pseudo-element
- Added `isStreaming` state to App.tsx: set true on stream data, false on complete/error
- Full accessibility: `role="status"`, `aria-label="응답 생성 중"`, `aria-hidden="true"` on dots
- Added 10 unit tests for TypingIndicator (render, props, dots, accessibility)
- Added 5 integration tests in App (loading text, role status, dots, streaming cursor, streaming text)
- Total tests: 361 → 376 (18 test files, all passing)

### Agent 2 (Quality) — System Prompt Editor
- Added `systemPrompt` field to `AppSettings` interface in `types.d.ts`
- Created system prompt textarea editor in Settings component with placeholder text
- Added "초기화" (clear) button that appears when system prompt has content
- System prompt persisted via existing settings localStorage mechanism
- Wired system prompt through IPC: renderer → preload → main → GeminiProcess
- GeminiProcess passes `--system-instruction` flag to CLI when system prompt is set
- `sendMessage` IPC handler now accepts optional `systemPrompt` parameter
- Empty system prompts are sent as `undefined` (not passed to CLI)
- Added `.system-prompt-input` and `.clear-prompt-btn` CSS with theme variable support
- Added 9 unit tests for Settings (textarea, placeholder, hint, value, save, clear button visibility, clear action)
- Added 3 integration tests in App (send with prompt, send without prompt, editor visibility in settings)
- Total tests: 376 → 388 (18 test files, all passing)

### Agent 2 (Quality) — Prompt Templates/Presets
- Created `PromptTemplate` interface in `types.d.ts` (id, name, content)
- Created `usePromptTemplates` hook with CRUD operations (add, delete, update) and localStorage persistence
- 3 default templates: 번역 (한→영), 코드 리뷰, 요약
- Created `PromptTemplates` component with dropdown trigger (📋), template list, and inline add form
- Click-outside-to-close behavior via mousedown event listener
- Template selection appends content to textarea input
- Delete button on each template (hover-reveal, stopPropagation to avoid triggering select)
- Add form with name/content inputs, save disabled when empty, cancel to dismiss
- Full accessibility: `aria-expanded`, `aria-haspopup="listbox"`, `role="listbox"`/`role="option"`, `role="form"` on add form
- CSS with theme variables, slide-up animation, scrollable dropdown, hover effects
- Integrated into App.tsx input row (next to textarea and send button)
- Added `.input-row` flex container and refactored `.input-container` to column layout
- Added 10 unit tests for `usePromptTemplates` hook (defaults, CRUD, persistence, edge cases)
- Added 21 unit tests for `PromptTemplates` component (rendering, interactions, add/delete, accessibility, outside click)
- Added 5 integration tests in App (trigger visibility, dropdown, template selection, append, layout)
- Total tests: 388 → 423 (20 test files, all passing)

### Agent 2 (Quality) — Model Selection Dropdown
- Updated model list in Settings: added Gemini 2.5 Pro, 2.5 Flash, 2.0 Flash; removed deprecated 2.0 Flash Experimental
- Added `--model` flag support to GeminiProcess CLI args (skipped when 'auto')
- Wired model through full IPC chain: renderer `sendMessage` → preload → main → GeminiProcess
- Added `MODEL_DISPLAY_NAMES` map in App.tsx for user-friendly model names
- Header subtitle now shows current model name (e.g., "모델: Gemini 2.5 Pro")
- Added hint text and `aria-label` to model select in Settings
- Added 4 tests for GeminiProcess (--model flag, auto skip, undefined skip, combined flags)
- Added 1 test for Settings (hint text)
- Added 6 integration tests in App (header display, model in sendMessage, settings change, auto model)
- Updated 4 existing tests for new sendMessage signature (3rd model param)
- Total tests: 423 → 434 (20 test files, all passing)

### Agent 2 (Quality) — Token Usage Display
- Added `TokenUsage` interface to `types.d.ts` (inputTokens, outputTokens, totalTokens)
- Created `TokenUsage` component showing input/output/total token counts with arrow icons
- Component displays as compact pill below last assistant message after stream completes
- Parses both camelCase (`inputTokens`) and snake_case (`input_tokens`) stats from CLI
- Token usage auto-clears when sending a new message, hidden during loading
- Only displays when actual token counts are present (> 0)
- CSS with theme variable support, `role="status"` for accessibility
- Added 10 unit tests for TokenUsage component (rendering, formatting, accessibility, edge cases)
- Added 5 integration tests in App (result stats display, loading hide, snake_case, zero tokens)
- Total tests: 434 → 449 (21 test files, all passing)

### Agent 2 (Quality) — Export Conversation as PDF
- Created `exportToHtml` utility function in `src/renderer/utils/format.ts`
- Generates styled HTML document from messages with proper CSS for print
- HTML escaping for XSS prevention (escapeHtml helper)
- Added `export-pdf` IPC handler in main process using hidden BrowserWindow + `printToPDF()`
- Creates temp HTML file, loads in hidden window, generates PDF buffer, saves via native dialog
- Automatic cleanup of temp HTML file and hidden window
- Added `exportPdf` to ElectronAPI type in `types.d.ts` and preload bridge
- Added PDF export button in header actions (alongside Clear and Export)
- Added `handleExportPdf` in App.tsx with conversation title → safe filename conversion
- Added 'PDF로 내보내기' command to CommandPalette (now 7 commands)
- Added 10 unit tests for `exportToHtml` (HTML structure, escaping, messages, styling, timestamps)
- Added 5 integration tests in App (button visibility, aria-label, click handler, HTML content, filename)
- Total tests: 449 → 464 (21 test files, all passing)

### Agent 2 (Quality) — Delete Conversation from Sidebar
- Added `deleteConversation` function to `useConversations` hook
- Removes conversation from list by ID, clears messages/currentId if deleting the active conversation
- Added hover-reveal delete button (×) on each conversation item in Sidebar
- `stopPropagation` prevents triggering `onSelectConversation` when clicking delete
- `onDeleteConversation` is optional prop — delete buttons only shown when provided
- CSS: positioned absolute top-right, opacity 0→1 on hover, error color on button hover
- Active conversation delete button uses white color scheme to match active background
- Added 4 unit tests for `deleteConversation` in useConversations hook (delete, clear current, preserve non-current, localStorage)
- Added 5 unit tests for Sidebar delete button (rendering, callback, stopPropagation, accessibility)
- Added 3 integration tests in App (button visibility, remove from sidebar, clear messages on delete)
- Total tests: 464 → 476 (21 test files, all passing)

### Agent 2 (Quality) — LaTeX/Math Rendering Support
- Created lightweight `mathRenderer.ts` utility (no external dependencies)
- `renderMathToHtml`: converts LaTeX math expressions to HTML using Unicode math symbols
- Supports: Greek letters (α-ω, Α-Ω), math operators (×, ÷, ±, ≤, ≥, ≠, ≈), arrows (→, ←, ⇒)
- Supports: big operators (∑, ∏, ∫), set theory (∈, ⊂, ∪, ∩, ∅), logic (∀, ∃, ∞)
- Supports: `\frac{num}{den}` fractions with CSS flexbox layout
- Supports: `\sqrt{x}` square root with Unicode √ and overline
- Supports: superscripts (`^`) and subscripts (`_`) — Unicode characters for simple cases, `<sup>`/`<sub>` HTML for complex ones
- Supports: `\text{}`, `\mathrm{}`, `\mathbf{}`, `\overline{}`, `\hat{}`, `\vec{}` decorators
- Supports: trig/log/lim math functions rendered in upright (non-italic) style
- Integrated into MarkdownRenderer: inline math `$...$` and block math `$$...$$`
- Block math: centered, larger font, `role="math"` for accessibility
- Inline math: `aria-label` with original LaTeX for screen readers
- Math inside code blocks is not parsed (preserved as literal text)
- Added `parseMathSegments` and `containsMath` utility functions
- CSS: serif math font family, fraction layout, sqrt, superscript/subscript sizing, function styling
- Added 45 unit tests for mathRenderer (Greek, symbols, sup/sub, frac, sqrt, functions, text, complex expressions, containsMath, parseMathSegments)
- Added 14 integration tests for MarkdownRenderer math (inline, block, fractions, sqrt, accessibility, mixed content, code block isolation)
- Total tests: 476 → 535 (22 test files, all passing)

### Agent 2 (Quality) — MessageBubble Component Extraction
- Extracted inline message rendering from App.tsx into reusable `MessageBubble` component
- MessageBubble encapsulates: message display, edit mode (local state), delete, streaming cursor
- Moved `editingIndex` and `editContent` state from App.tsx into MessageBubble's local state
- App.tsx reduced from ~620 lines to ~560 lines (cleaner, more maintainable)
- MessageBubble props: message, index, isStreaming, isLastAssistant, onDelete, onEdit
- Added 24 unit tests for MessageBubble (rendering, roles, CSS classes, delete, edit flow, streaming cursor)
- All existing App.tsx integration tests continue to pass (behavior unchanged)
- Total tests: 535 → 559 (23 test files, all passing)

### Agent 2 (Quality) — useStreamHandler Hook Extraction
- Extracted streaming data handling from App.tsx into `useStreamHandler` custom hook
- Hook manages: isLoading, isStreaming, tokenUsage state + stream listener setup/teardown
- Provides: startLoading, stopLoading, clearTokenUsage helper callbacks
- App.tsx reduced from ~560 lines to ~487 lines (total reduction: 620 → 487)
- Removed direct dependency on StreamData, StreamErrorData types from App.tsx
- Added 16 unit tests for useStreamHandler (init state, listeners, streaming, errors, token parsing)
- Total tests: 559 → 575 (24 test files, all passing)

### Agent 2 (Quality) — Code Block Copy Button
- Added copy-to-clipboard button on all code blocks in MarkdownRenderer
- CopyButton component uses `navigator.clipboard.writeText` API
- Visual feedback: button text changes to "✓" for 2s after successful copy
- Button positioned in code block header alongside language label
- Code block header layout refactored from absolute positioning to flex layout
- Accessible: `aria-label` changes between "코드 복사" and "복사됨"
- Added 6 unit tests (button rendering, clipboard interaction, feedback, multiple blocks)
- Total tests: 575 → 581 (24 test files, all passing)

### Agent 2 (Quality) — Markdown Table Rendering
- Added table parsing in MarkdownRenderer's `renderParagraphContent` function
- Supports standard Markdown table syntax: `| Header | ... |` with `|---|` separator
- Column alignment: left (default), right (`:---:`), center (`:---:`)
- Inline markdown rendered inside table cells (bold, italic, code, links)
- Table CSS: theme-aware borders, header background, hover row highlight
- User message tables styled with rgba borders for blue background compatibility
- Added 9 unit tests (simple table, headers, cells, inline markdown, alignment, empty cells, mixed content, multiple tables)
- Total tests: 581 → 590 (24 test files, all passing)

### Agent 2 (Quality) — Smart Scroll to Bottom
- Created `useAutoScroll` custom hook replacing naive scroll-on-every-message behavior
- Auto-scrolls only when user is near bottom of messages (within 100px threshold)
- Shows floating "↓" scroll-to-bottom button when user scrolls up and new messages arrive
- Button positioned as absolute overlay inside chat-container with theme-aware styling
- Smooth scroll animation via `scrollIntoView({ behavior: 'smooth' })`
- Button click scrolls to bottom and hides the button
- Uses `requestAnimationFrame` for proper DOM update timing
- Tracks previous message count via ref to detect new message additions
- Removed old `scrollToBottom` function and `useEffect` from App.tsx in favor of hook
- Added `position: relative` to `.chat-container` for button positioning context
- Accessible: `aria-label="새 메시지로 이동"` on scroll button
- Added 10 unit tests for useAutoScroll hook (init state, refs, scroll position detection, button visibility, scrollIntoView call)
- Total tests: 630 → 640 (27 test files, all passing)

### Agent 2 (Quality) — Conversation Branching (Fork from Any Message)
- Added `forkConversation` function to `useConversations` hook
- Creates new conversation with messages up to the fork point (inclusive)
- Forked conversation title includes `(분기)` suffix for easy identification
- Switches to the new forked conversation automatically
- Preserves original conversation untouched
- Added fork button (⎗) to `MessageBubble` component (hover-reveal, both user and assistant messages)
- `onFork` prop is optional — fork button only rendered when provided
- CSS: `.fork-message-btn` with same hover-reveal pattern as edit/delete buttons
- Calls `electronAPI.newConversation` to start fresh CLI session for forked conversation
- New forked conversation automatically appears in tabs via existing `ensureTabOpen` effect
- Added 7 unit tests for `forkConversation` in useConversations (fork messages, switch, naming, null cases, preserve original, IPC call)
- Added 4 unit tests for MessageBubble fork button (render, callback, both roles)
- Added 3 integration tests in App (fork buttons visible, fork creates subset, sidebar label)
- Total tests: 640 → 654 (27 test files, all passing)

### Agent 2 (Quality) — useMessageSend Hook Extraction
- Extracted message sending logic from App.tsx into `useMessageSend` custom hook
- Hook manages: input state, attachedFiles state, handleSend, handleKeyDown, handlePaste
- Includes: fileToArrayBuffer, saveTempFiles, temp file cleanup on unmount
- Encapsulates: file attachment (add/remove), clipboard image pasting, Enter/Shift+Enter key handling
- Passes systemPrompt and model settings through to IPC sendMessage call
- Error handling: toast notification + error message on send failure
- App.tsx reduced from ~540 lines to ~406 lines (134 line reduction)
- Added 18 unit tests for useMessageSend (init state, input, files, send, key handling, paste, errors, cleanup)
- Total tests: 654 → 672 (28 test files, all passing)

### Agent 2 (Quality) — Settings Local State Sync Bug Fix
- Fixed bug: Settings dialog local state wasn't reset when reopened after cancel
- `localSettings` (useState) only set initial value, didn't sync with prop changes
- Added `useEffect` to reset `localSettings` when dialog opens or settings prop changes
- Prevents stale/modified values from persisting across open/close cycles
- Added 2 tests: reset after cancel/reopen, sync on external settings prop change
- Total tests: 672 → 674 (28 test files, all passing)

### Agent 2 (Quality) — Stable Message IDs for React Keys
- Added optional `id` field to `Message` interface in `types.d.ts`
- Created `generateMessageId()` utility in `format.ts` (timestamp + counter for uniqueness)
- User messages in `useMessageSend` now get unique IDs at creation
- Assistant messages in `useStreamHandler` now get unique IDs at creation
- Legacy messages loaded from localStorage get IDs assigned in `useConversations`
- App.tsx uses `key={message.id || index}` for stable React reconciliation
- Prevents incorrect component reuse when messages are deleted or reordered
- Added 3 tests for `generateMessageId` (format, uniqueness, timestamp)
- Total tests: 674 → 677 (28 test files, all passing)

### Agent 2 (Quality) — React.memo and useMemo Performance Optimization
- Applied `React.memo` to `MessageBubble` component — prevents re-render when props haven't changed
- Applied `React.memo` to `MarkdownRenderer` component — prevents re-parsing when content is unchanged
- Added `useMemo` for `parseBlocks` in MarkdownRenderer — caches parsing result per content value
- Used Inner/Wrapper pattern for React.memo compatibility with esbuild
- No test changes needed — behavior is identical, only rendering performance is improved
- Total tests: 677 (28 test files, all passing)

### Agent 2 (Quality) — Additional React.memo + sanitizeFileName Utility
- Applied `React.memo` to Sidebar, TokenUsage, TypingIndicator, TabBar components
- Extracted `sanitizeFileName` utility from duplicated inline regex in App.tsx export handlers
- Reduced code duplication in `handleExport` and `handleExportPdf` with shared `getCurrentTitle` helper
- Added 5 tests for `sanitizeFileName` (special chars, spaces, Korean, alphanumeric, multiple spaces)
- Total tests: 677 → 682 (28 test files, all passing)

### Agent 2 (Quality) — useExport Hook Extraction
- Extracted export logic (handleExport, handleExportPdf, getCurrentTitle) from App.tsx into `useExport` custom hook
- Hook receives messages, conversations, currentConversationId and returns memoized export handlers
- All functions wrapped with `useCallback` for stable references
- App.tsx reduced from ~403 lines to ~385 lines
- Removed `exportToMarkdown`, `exportToHtml`, `sanitizeFileName` imports from App.tsx (now in hook)
- Added 8 unit tests for useExport (return values, getCurrentTitle, empty messages, export args, PDF args, filename sanitization)
- Total tests: 682 → 690 (29 test files, all passing)

### Agent 2 (Quality) — useSettings Hook Extraction
- Extracted settings state management from App.tsx into `useSettings` custom hook
- Hook manages: settings state, localStorage load/save, handleSettingsSave
- Includes DEFAULT_SETTINGS constant and STORAGE_KEY_SETTINGS
- Removed `AppSettings` type import from App.tsx (now in hook)
- App.tsx reduced from ~385 lines to ~359 lines
- Added 6 unit tests for useSettings (defaults, load, invalid JSON, save, persistence, function type)
- Total tests: 690 → 696 (30 test files, all passing)

### Agent 2 (Quality) — Remove Debug Logging + React.memo Remaining Components
- Removed `console.log('Stream data received:', data)` from useStreamHandler.ts (debug log in production)
- Applied `React.memo` to CommandPalette, PromptTemplates, FileAttachment, Toast, Settings
- All 12 components now wrapped with React.memo (except ErrorBoundary which is a class component)
- Total tests: 696 (30 test files, all passing)

### Agent 2 (Quality) — Fix TypeScript Type Checking (560 → 0 errors)
- Added `vitest/globals` and `@testing-library/jest-dom` to tsconfig `types` array
- Fixed `MarkdownRenderer.tsx` HeadingTag type: `keyof JSX.IntrinsicElements` → explicit union type
- Fixed `GeminiProcess.test.ts`: `mockSpawn` variadic args typing, `Object.assign` for mock pty methods
- Fixed `CommandPalette.test.tsx`: explicit `vi.fn<() => void>()` type parameters for Command actions
- Fixed `useExport.test.ts`: double-cast `window as unknown as Record` for mock assignment
- Fixed `App.test.tsx`: `as unknown as typeof window.electronAPI` replacing `as any`
- Fixed `test/setup.ts`: replaced `as any` with typed cast for window.require mock
- Eliminated all `as any` usage from test files
- `npx tsc --noEmit` now passes with 0 errors (down from 560)
- Total tests: 696 (30 test files, all passing)

### Agent 2 (Quality) — Eliminate All `any` Types from Source & Test Code
- **GeminiProcess.ts**: Added `PtyModule` interface, typed `IPtyProcess` with overloads, replaced `any` env params with `NodeJS.ProcessEnv`, typed process field as `IPtyProcess | ChildProcess | null`
- **main/index.ts**: Created `getErrorMessage()` utility for safe error handling, replaced all `catch (error: any)` with `catch (error)` + `getErrorMessage()`, typed `jsonData` as `Record<string, unknown>`
- **App.test.tsx**: Replaced all `data: any` stream callback types with `StreamData` import (6 occurrences)
- Zero `any` usage remaining across entire codebase (src/ and test/)
- Total tests: 696 (30 test files, all passing)

### Agent 2 (Quality) — useCallback Optimization in App.tsx
- Wrapped `handleClearConversation` and `handleToggleSidebar` with `useCallback`
- These functions are dependencies of the `commands` useMemo and passed to child components
- Without useCallback, they were recreated every render, causing commands array to also recreate
- Total tests: 696 (30 test files, all passing)

### Agent 2 (Quality) — Extract Shared Test Utility for Stream Mocking
- Created `setupStreamCallbacks()` helper in App.test.tsx to replace 6 duplicated mock setups
- Each setup was 4-8 lines of identical `let` + `mockImplementation` boilerplate
- Helper captures both `streamData` and `streamComplete` callbacks in a single call
- Reduced ~40 lines of duplicated code to 6 one-liner calls
- Total tests: 696 (30 test files, all passing)

### Agent 2 (Quality) — Extract UI String Constants for i18n Readiness
- Created `src/renderer/constants/strings.ts` with 186 lines of centralized UI string constants
- All Korean UI text, ARIA labels, placeholders, titles, and button text extracted
- Migrated all 13 components to import from `constants/strings` as `* as S`
- Components: App, Settings, Sidebar, MessageBubble, TabBar, FileAttachment, PromptTemplates, Toast, TypingIndicator, TokenUsage, CommandPalette, MarkdownRenderer, ErrorBoundary
- Organized by component section: App-level, Header, Command Palette, Sidebar, Settings, MessageBubble, etc.
- Updated TODO.md to reflect all completed features (vast majority now done)
- Prepares codebase for future internationalization (i18n) support
- Total tests: 696 (30 test files, all passing)

### Agent 2 (Quality) — Hooks String Constants + Model List Consolidation + Performance
- Migrated 4 hooks to use centralized string constants: useConversations, useMessageSend, useStreamHandler, usePromptTemplates
- Added 12 new string constants for hooks: conversation titles, error prefixes, file labels, default templates
- Moved `MODEL_DISPLAY_NAMES` from App.tsx to constants/strings.ts (shared between App and Settings)
- Replaced hardcoded `<option>` elements in Settings with dynamic rendering from MODEL_DISPLAY_NAMES
- Removed unused `parseMathSegments` import from MarkdownRenderer
- Removed unused `MODEL_AUTO` constant (replaced by MODEL_DISPLAY_NAMES entry)
- Wrapped `handleSettingsSave` with `useCallback` for stable reference
- Memoized `tabs` array in useTabs with `useMemo` to avoid re-creation on every render
- Total tests: 696 (30 test files, all passing)

### Agent 2 (Quality) — Centralize localStorage Keys, Unify ID Generation, Improve Type Safety
- Centralized all 8 localStorage key strings from 6 hooks/components to `constants/strings.ts`
- Keys: conversations, current-conversation, settings, theme, prompt-templates, sidebar-collapsed, high-contrast, open-tabs
- Replaced `Date.now().toString()` with `generateUniqueId(prefix)` in useConversations, usePromptTemplates, useToast
- New `generateUniqueId()` uses monotonic counter to prevent same-millisecond ID collisions
- `generateMessageId()` now delegates to `generateUniqueId('msg')` (no behavior change)
- Fixed `useAutoScroll` parameter type from `unknown[]` to `Message[]` for proper type safety
- Replaced inline type definitions with shared `Conversation` interface in Sidebar.tsx and useTabs.ts
- Updated Sidebar.test.tsx, useTabs.test.ts, useAutoScroll.test.ts to use proper typed test data
- Added 3 unit tests for `generateUniqueId` (prefix, default, uniqueness)
- TypeScript: 0 errors (`npx tsc --noEmit` passes)
- Total tests: 699 (30 test files, all passing)

### Agent 2 (Hooks & Utils) — usePerformanceMonitor Tests + any Fix, useDebounce, useClipboard
- Added 14 unit tests for `usePerformanceMonitor` hook (init state, toggle, render metrics, slowest/fastest, average, cap at 50, reset, rounding, memory usage, stable refs)
- Fixed 2 `any` type casts in usePerformanceMonitor: `(performance as any).memory` → typed `Performance & { memory?: ... }` cast
- Created `useDebounce` hook — debounces a value by a configurable delay
- Added 8 unit tests for useDebounce (initial value, delay, timer reset, objects, zero delay, cleanup)
- Created `useClipboard` hook — clipboard copy with `copied` feedback state and auto-reset
- Added 10 unit tests for useClipboard (copy, reset timer, errors, stable refs)
- Zone B tests: 359 (25 test files, all passing)
- Build: passes successfully

### Agent 2 (Quality) — Integrate Priority 2 Components into App
- Integrated 4 untracked components into App.tsx: PerformancePanel, MessageSearch, InputPreview, PinnedMessages
- **PerformancePanel**: React Profiler-based performance monitoring dialog with render metrics, memory usage, recent render list
- **usePerformanceMonitor**: Custom hook providing onRender callback, getData, toggle, reset for React.Profiler integration
- **MessageSearch**: Full-text search across all conversations with highlighted results, keyboard navigation, and auto-scroll to result
- **InputPreview**: Markdown preview panel below input (shows rendered preview of input text)
- **PinnedMessages**: Pin/unpin messages bar above chat area, with navigate-to-message and unpin actions
- Added `handlePinMessage`, `handleUnpinMessage`, `handleSearchNavigate` callbacks in App.tsx
- Added 'pin' action to right-click MessageContextMenu (📌 고정)
- Added `STORAGE_KEY_PINNED_MESSAGES` to constants/strings.ts for localStorage persistence
- Added `perfData` useMemo for computed performance data
- Added 5 integration tests in App.test.tsx (PinnedMessages default, context menu pin, InputPreview default, PerformancePanel default, MessageSearch default)
- Total tests: 938 (55 test files, all passing)
- TypeScript: 0 errors, Build: passes successfully

### Agent 2 (Hooks & Utils) — useBookmarks, useEmojiReactions, wordCount
- Created `useBookmarks` hook — CRUD for bookmarked messages with localStorage persistence
  - addBookmark, removeBookmark, isBookmarked, clearBookmarks, getBookmarksForConversation
  - Duplicate prevention (same conversationId + messageIndex)
  - Compatible with BookmarkedMessages component interface
- Created `useEmojiReactions` hook — emoji reaction management with localStorage persistence
  - addReaction (with count increment), removeReaction (with count decrement), toggleReaction
  - getReactions, clearReactions (per message), clearAllReactions
  - Message-keyed storage: `{conversationId}:{messageIndex}` → EmojiReaction[]
  - Compatible with EmojiReactionPicker component interface
- Created `wordCount` utility module with text statistics functions
  - countWords, countLines, countSentences, countParagraphs, getTextStats, estimateReadingTime
  - Handles edge cases: empty, whitespace-only, Korean text, multiline
- Added 12 unit tests for useBookmarks (add, dedupe, remove, isBookmarked, clear, filter, persistence, stable refs)
- Added 16 unit tests for useEmojiReactions (add, increment, different emojis, remove, toggle, clear, persistence, stable refs)
- Added 30 unit tests for wordCount (words, lines, sentences, paragraphs, stats, reading time)
- Total tests: 996 (58 test files, all passing)
- TypeScript: 0 errors, Build: passes successfully

### Agent 2 (Hooks & Utils) — useThrottle, useUndoRedo, useWindowSize, stringUtils
- Created `useThrottle` hook — throttle rapidly changing values with configurable delay (9 tests)
- Created `useUndoRedo` hook — undo/redo state management with history limit (12 tests)
- Created `useWindowSize` hook — reactive window dimensions tracking (4 tests)
- Created `stringUtils` utility — truncate, capitalize, slugify, escapeHtml, stripHtml, highlightMatches, excerpt, countOccurrences, isBlank, pluralize (38 tests)
- Total: 63 new tests, all passing

### Agent 2 (Hooks & Utils) — usePrevious, useMediaQuery, useInterval, dateUtils
- Created `usePrevious` hook — track previous value of any state/prop (7 tests)
- Created `useMediaQuery` hook — reactive CSS media query matching with change listener (6 tests)
- Created `useInterval` hook — declarative setInterval with dynamic delay and null pause (8 tests)
- Created `dateUtils` utility — formatDate, formatTime, formatDateTime, timeAgo (Korean), isToday, isSameDay, formatDuration (27 tests)
- Total: 48 new tests, all passing

### Agent 2 (Hooks & Utils) — useEventListener, useFocus, useToggle, arrayUtils
- Created `useEventListener` hook — declarative event listener with auto-cleanup, custom element support (7 tests)
- Created `useFocus` hook — track focus state with ref, focus/blur controls (8 tests)
- Created `useToggle` hook — boolean state with toggle/setTrue/setFalse helpers (7 tests)
- Created `arrayUtils` utility — unique, groupBy, chunk, moveItem, range, shuffle, findLast, flatten (33 tests)
- Total: 55 new tests, all passing

### Agent 2 (Hooks & Utils) — useHover, useOnClickOutside, useCountdown, numberUtils
- Created `useHover` hook — track hover state with callbacks (5 tests)
- Created `useOnClickOutside` hook — detect clicks outside element via mousedown (6 tests)
- Created `useCountdown` hook — countdown timer with start/pause/resume/reset and onComplete callback (10 tests)
- Created `numberUtils` utility — clamp, formatBytes, formatPercent, roundTo, lerp, mapRange, formatCompact (31 tests)
- Total: 52 new tests, all passing
- Cumulative total: 1217 tests (74 test files, all passing)
- TypeScript: 0 errors

### Agent 2 (Hooks & Utils) — useDocumentTitle, useScrollPosition, validationUtils
- Created `useDocumentTitle` hook — dynamically set document.title with restore-on-unmount (7 tests)
- Created `useScrollPosition` hook — track scroll position, direction, isAtTop/isAtBottom with throttling (8 tests)
- Created `validationUtils` utility — isValidEmail, isValidUrl, isNotEmpty, hasMinLength, hasMaxLength, isInRange, isAlphanumeric, isNumeric, matchesPattern, validateAll (20 tests)
- Total: 35 new tests, all passing
- Cumulative total: 1252 tests (77 test files, all passing)

### Agent 2 (Hooks & Utils) — useAsync, useMap, useSet hooks and objectUtils utility
- Created `useAsync` hook — manage async operations with loading/error/data states, execute/reset (11 tests)
- Created `useMap` hook — Map-like state management with set/get/has/remove/clear/reset (13 tests)
- Created `useSet` hook — Set-like state management with add/remove/toggle/has/clear/reset (12 tests)
- Created `objectUtils` utility — pick, omit, deepClone, isEqual, merge, isEmpty, getPath, mapValues (31 tests)
- Total: 67 new tests, all passing
- Cumulative total: 1319 tests (81 test files, all passing)
- TypeScript: 0 errors, Build: passes successfully

### Agent 2 (Hooks & Utils) — useReadingProgress, useFormattingToolbar, useNotification hooks and colorUtils utility
- Created `useReadingProgress` hook — scroll progress tracking (0-100%) with container/window support, throttling, reset (12 tests)
- Created `useFormattingToolbar` hook — markdown formatting actions (bold, italic, code, strikethrough, link, codeblock) with textarea selection, placeholder insertion (18 tests)
- Created `useNotification` hook — browser Notification API integration with permission management, request/show helpers (10 tests)
- Created `colorUtils` utility — hexToRgb, rgbToHex, rgbToHsl, hslToRgb, lighten, darken, luminance, contrastRatio, mix, getContrastText, rgbToCss, rgbaToCss (42 tests)
- Total: 82 new tests, all passing
- Cumulative total: 1416 tests (86 test files, all passing)
- TypeScript: 0 errors, Build: passes successfully

### Agent 2 (Hooks & Utils) — useDialogs, useQueue, useSelection, useMutationObserver, useRetry, domUtils, storageUtils
- Created `useDialogs` hook — consolidates 11 dialog/panel open states for App.tsx with open/close/toggle actions (15 tests)
- Created `useQueue` hook — FIFO queue state management with enqueue, dequeue, peek, clear, contains, toArray (11 tests)
- Created `useSelection` hook — text selection tracking with targetRef filtering, offsets, clear (9 tests)
- Created `useMutationObserver` hook — declarative MutationObserver with auto-cleanup, latest callback ref pattern (6 tests)
- Created `useRetry` hook — async retry with configurable maxRetries, delay, exponential/fixed backoff, cancel, reset (8 tests)
- Created `domUtils` utility — isElementVisible, isElementFullyVisible, getScrollPercent, isNearBottom, getFocusableElements, trapFocus, scrollIntoViewIfNeeded, copyToClipboard, data attributes, matchesSelector, closestAncestor (31 tests)
- Created `storageUtils` utility — type-safe getItem/setItem, hasItem, prefix operations, getStorageSize, expiry (TTL), createNamespace (27 tests)
- Total: 95 new tests (added tests for 4 previously untested files + 2 new modules)
- Cumulative total: 1511 tests (92 test files, all passing)
- TypeScript: 0 errors, Build: passes successfully

### Agent 2 (Quality) — useKeyCombo, useLongPress, useIdle hooks and urlUtils utility
- Created `useKeyCombo` hook — sequential key combination detection with modifier support (11 tests)
- Created `useLongPress` hook — long press gesture detection for mouse and touch (10 tests)
- Created `useIdle` hook — user inactivity detection with configurable timeout and events (10 tests)
- Created `urlUtils` utility — isValidUrl, getDomain, getFileExtension, parseQueryParams, buildUrl, stripQueryParams, isAbsoluteUrl, ensureProtocol, extractUrls, getPathSegments, matchesDomain, joinPath (45 tests)
- Total: 76 new tests
- Cumulative total: 1587 tests (96 test files, all passing)
- TypeScript: 0 errors, Build: passes successfully

### Agent 2 (Hooks & Utils) — useIntersectionObserver, usePageVisibility, useSpeechSynthesis hooks and cryptoUtils utility
- Created `useIntersectionObserver` hook — element visibility detection with IntersectionObserver API, freezeOnceVisible, threshold/rootMargin support (10 tests)
- Created `usePageVisibility` hook — page tab visibility tracking with onVisible/onHidden callbacks, hidden duration measurement (10 tests)
- Created `useSpeechSynthesis` hook — Web Speech API TTS with speak/cancel/pause/resume, voice list, isSpeaking/isPaused state (14 tests)
- Created `cryptoUtils` utility — generateUUID, randomHex, randomInt, hashDjb2, hashSHA256, base64Encode/Decode, shortId, timingSafeEqual, stringToColor (41 tests)
- Total: 85 new tests (5 new test files)
- Cumulative total: 1672 tests (101 test files, all passing)
- TypeScript: 0 errors, Build: passes successfully
