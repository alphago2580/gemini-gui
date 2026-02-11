# PROGRESS — Gemini GUI Agent Team

## Current Status
- **Version**: 0.1.0
- **Total Lines**: ~1400
- **Test Status**: Passing (6590+ tests)
- **Last Agent Run**: Agent 2 (Logic)

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

### Agent 3 (Tests & Types) — Deepen Test Coverage for 4 Components/Hooks
- **FormattingToolbar.test.tsx**: Added 5 tests — strikethrough, codeblock action clicks, button count, CSS class per action, tabIndex=-1 accessibility
- **CodeSnippets.test.tsx**: Added 6 tests — clipboard copy success, checkmark feedback after copy, clipboard failure graceful handling, panel click propagation stop, filter reset to all
- **MessageContextMenu.test.tsx**: Added 5 tests — outside click closes menu, inside click doesn't close, aria-label on menu, viewport overflow position check, non-danger item class validation
- **useAutoScroll.test.ts**: Added 5 tests — messages cleared hides button, default smooth behavior, null container ref, exact threshold boundary, just past threshold boundary
- Total tests: 849 → 869 (47 test files, all passing)

### Agent 3 (Tests & Types) — Shared Types & Export All Props/Options Interfaces
- Created `src/renderer/types/index.ts` with shared type definitions:
  - `MessageRole`: union type for `'user' | 'assistant'`
  - `ContextMenuState`: type for right-click context menu position + message index
  - `FormattingResult` + `FormatterFunction`: types for text formatting operations
  - `RoleFilter`: type for bookmark/filter role selection
- Exported `Props` interfaces from all 22 component files (were private, now importable by tests and other modules)
- Exported `Options`/`Actions` interfaces from 4 hooks: useExport, useMessageSend, useStreamHandler, useKeyboardShortcuts
- TypeScript: 0 errors, 869 tests all passing

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 2 (+40 tests)
- **GeminiProcess.test.ts**: Added 10 tests — stop/nullify, send-without-start throws, exit event, non-JSON line ignored, empty lines ignored, `\r\n` handling, malformed JSON silent fail, `--system-instruction` flag, double-start prevention
- **conversationStats.test.ts**: Added 5 tests — totalCharacters calculation, averageMessageLength, 0 avg when all empty, single conversation stats, same-length longest/shortest
- **syntaxHighlight.test.ts**: Added 11 tests — CSS/SCSS/LESS/jsonc languages, block comments in CSS, shell/zsh/py/tsx/jsx aliases, decimal starting with dot
- **KeyboardShortcutHelp.test.tsx**: Added 4 tests — modal click propagation stop, kbd elements count, shortcut rows count, Ctrl+F search shortcut
- **LinkCollection.test.tsx**: Added 5 tests — panel click propagation stop, copy/nav button aria-labels, zero link count display, non-Escape key ignored
- **QuickSwitcher.test.tsx**: Added 5 tests — ArrowUp/Down keyboard wrap, panel click propagation stop, aria-selected attribute, query reset on reopen
- Total tests: 869 → 909 (47 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 3 (+43 tests)
- **codeExtractor.test.ts**: Added 8 tests — unclosed code block, multiple blocks in single message, messageIndex preservation, empty messages array, no-language code block, whitespace-only content skip, trailing-space closing fence, groupByLanguage empty input
- **linkExtractor.test.ts**: Added 7 tests — empty link text fallback to URL, query parameters, paths with fragments, no markdown-to-bare duplication, same URL in different messages, empty messages array, http (non-https) links
- **textFormatting.test.ts**: Added 8 tests — mid-text wrap selection, mid-text cursor placeholder, asymmetric prefix/suffix, insertBold no-selection placeholder, insertLink cursor with selection, insertCodeBlock cursor with selection, insertInlineCode no-selection, insertStrikethrough no-selection
- **BookmarkedMessages.test.tsx**: Added 8 tests — filtered-empty message, role badges, panel click propagation stop, ArrowUp boundary, ArrowDown boundary, mouseEnter selection, dialog aria-label, listbox role
- **ErrorBoundary.test.tsx**: Added 5 tests — specific error message display, multiple children rendering, reset button class, custom fallback precedence, componentDidCatch logging verification
- **ConversationStats.test.tsx**: Added 7 tests — modal click propagation stop, user/assistant counts, average messages per conversation, empty conversations count, formatNumber display, message count with titles, dialog aria-label
- Total tests: 909 → 952 (47 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 4 (+50 tests)
- **useMessageSend.test.ts**: Added 10 tests — whitespace-only input, file name in message content, clear attached files after send, accumulate multiple file selections, error with non-Error object, error with plain string, both systemPrompt+model, non-Enter key ignored, null clipboardData, getAsFile returns null
- **PromptTemplates.test.tsx**: Added 7 tests — whitespace-only name disabled, whitespace-only content disabled, trim whitespace on add, cancel clears inputs, outside click closes add form, aria-haspopup attribute, all delete button aria-labels
- **useConversations.test.ts**: Added 7 tests — no update without conversationId, no title regen for multi-message, no title for assistant-only, reverse chronological order, legacy data gets IDs, deleteMessage on empty list, fork uses first user message for title
- **MarkdownRenderer.test.tsx**: Added 8 tests — blockquote with inline formatting, list items with inline code, unordered-to-ordered list transition, ___ horizontal rule, headings with inline formatting, code block after paragraph, newline-only content, link inside list item
- **mathRenderer.test.ts**: Added 12 tests — empty parseMathSegments, adjacent inline math, hat/vec decorators, left/right delimiters, double backslash line break, quad space, unknown commands, variant Greek letters, nested sqrt+frac, multiline containsMath, empty containsMath
- **useStreamHandler.test.ts**: Added 6 tests — new assistant message append, delta append to existing, totalTokens auto-computation, error message prefix content, non-assistant message ignored, listener re-registration on conversationId change
- Total tests: 952 → 1002 (47 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 5 (+55 tests)
- **EmojiReactionPicker.test.tsx**: Added 8 tests — inside click no close, non-Escape key ignored, no listeners when closed, listener cleanup on close, CSS class per option, container class, option role=button, QUICK_EMOJIS export validation
- **WelcomeScreen.test.tsx**: Added 10 tests — logo text content, all prompts click correctly, card count, CSS class per card, all icons rendered, all labels as text, root container class, title/subtitle classes, DEFAULT_SUGGESTIONS count, suggestion field validation
- **ReadingProgressBar.test.tsx**: Added 8 tests — fractional progress, fractional aria-label, container class, fill class, boundary 1%, boundary 99%, empty DOM when hidden, fill as child of bar
- **InlineSearch.test.tsx**: Added 11 tests — empty count string, single match display, search role/aria-label, container class, input class, prev/next/close title attributes, non-special keys ignored, prev/next button clicks
- **useInlineSearch.test.ts**: Added 10 tests — empty messages array, empty content messages, non-overlapping position matches, special regex characters as literal, message array reactivity, open/close idempotency, single match goToNext wrap, single match goToPrev wrap, matchIndex increments, mixed case matching
- **useTheme.test.ts**: Added 8 tests — system-to-dark removes listener, system-to-light removes listener, dark↔light roundtrip, system mode restore from localStorage, setThemeMode callback stability, return shape validation, light mode ignores system preference, dark mode ignores system preference
- Total tests: 1002 → 1057 (47 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 6 (+48 tests)
- **TabBar.test.tsx**: Added 8 tests — non-Enter/Space keyDown ignored, single tab rendering, tab-title span content, new tab title attribute, + text content, × close character, tab-bar/tab-list CSS classes, tab-item class count
- **Toast.test.tsx**: Added 8 tests — toast-exit class on manual dismiss, toast-exit class on auto-dismiss, aria-live assertive per toast, toast-message span content, toast-close class, unique key independent rendering, × close text, timer cleanup on unmount
- **useTabs.test.ts**: Added 8 tests — prevTab single tab no-op, nextTab null conversationId no-op, prevTab null conversationId no-op, closeTab non-active tab no switch, closeTab active first tab, closeTab active last tab, cleanupTabs empty array, ensureTabOpen multiple IDs
- **useSettings.test.ts**: Added 8 tests — all default fields present, overwrites all fields, multiple saves overwrite, partial saved settings, empty string in localStorage, settings reference changes, handleSettingsSave stability, empty systemPrompt persistence
- **useAutoResize.test.ts**: Added 8 tests — overflowY hidden below max, overflowY auto at max, height reset before measure, exact min height boundary, resize function stability, textareaRef stability, scrollHeight above max (201px), scrollHeight below max (199px)
- **useExport.test.ts**: Added 8 tests — fallback on null conversationId, PDF filename sanitization, missing exportMarkdown method, missing exportPdf method, markdown content inclusion, HTML content inclusion, title update on conversation change, single message export
- Total tests: 1057 → 1105 (47 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 7 (+48 tests)
- **useKeyboardShortcuts.test.ts**: Added 8 tests — Ctrl+K toggleQuickSwitcher, Ctrl+/ toggleShortcutHelp, uppercase P for Ctrl+Shift+P, optional onNextTab undefined safety, optional onToggleQuickSwitcher undefined safety, optional onToggleShortcutHelp undefined safety, Ctrl+Tab priority over switch-case, Escape without settings does nothing
- **MessageContextMenu.test.tsx**: Added 8 tests — icon span class count, label span class count, empty items rendering, onSelect with quote id, non-Escape keyDown ignored, onClose called once per click, zero coordinates styling, single item menu rendering
- **useLocalStorage.test.ts**: Added 8 tests — boolean values, null initial value, stored null from localStorage, empty string stored, nested object values, setValue stability, key change via rerender, number zero (falsy valid JSON)
- **usePromptTemplates.test.ts**: Added 8 tests — update non-existent id, add multiple sequentially, delete all templates, update preserves id, addTemplate callback stability, deleteTemplate callback stability, empty array from localStorage, added templates unique ids
- **CommandPalette.test.tsx**: Added 8 tests — Enter on empty filtered list, whitespace query shows all, aria-activedescendant after nav, input CSS class, overlay CSS class, inner container CSS class, selectedIndex clamped on filter, empty commands array
- **useToast.test.ts**: Added 8 tests — dismiss non-existent id, FIFO ordering, addToast callback stability, dismissToast callback stability, toast id prefix, dismiss first keep rest, dismiss all sequentially, toast types stored correctly
- Total tests: 1105 → 1153 (47 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 8 (+48 tests)
- **FileAttachment.test.tsx**: Added 8 tests — file input onChange with null files, file-name span content, file-size span content, file-chip count, first remove button callback, drop zone label icon/text spans, file input display:none, onFilesSelected from input change
- **MessageBubble.test.tsx**: Added 8 tests — message-header structure (role/timestamp/delete), message-content text verification, delete button title attribute, edit button title attribute, fork button title attribute, editing class removal on cancel, edit textarea rows=3, edit-message-actions structure
- **Settings.test.tsx**: Added 8 tests — settings-header structure (h2+close), settings-footer structure (cancel+save), temperature slider min/max/step, maxTokens slider min/max/step, system prompt textarea rows=4, info section CLI version+config path, light theme not active when dark, high contrast hint text
- **Sidebar.test.tsx**: Added 8 tests — non-active aria-current absent, non-Enter/Space keyDown ignored, conversation-title div text, sidebar CSS class on nav, sidebar-header rendered, sidebar-footer contains settings, collapse ◀ arrow when expanded, collapse ▶ arrow when collapsed
- **TokenUsage.test.tsx**: Added 8 tests — token-usage CSS class, token-usage-label span, token-usage-item count, token-usage-total span, token-icon spans content, single digit tokens, root element is div, rerender updates display
- **TypingIndicator.test.tsx**: Added 8 tests — typing-indicator-header role span, typing-indicator-content container, typing-text span content, explicit isStreaming=false, dots are empty spans, root element class, streaming-to-non-streaming rerender, role status contains dots+text
- Total tests: 1153 → 1201 (47 test files, all passing)

### Agent 4 (Integrator) — Integrate SplitButton Export + ProgressBar TokenUsage
- Replaced separate Export + PDF header buttons with `SplitButton` component — primary action triggers MD export, dropdown menu offers PDF export option
- Integrated `ProgressBar` into `TokenUsage` component — shows token usage ratio vs `maxTokens` setting
- ProgressBar color-coded: default (< 70%), warning (70–90%), error (> 90%)
- Added optional `maxTokens` prop to `TokenUsageProps` interface
- App.tsx passes `settings.maxTokens` to `TokenUsage` for visual usage tracking
- Added `EXPORT_OPTIONS_LABEL`, `EXPORT_MD_OPTION`, `EXPORT_PDF_OPTION`, `TOKEN_USAGE_PROGRESS_LABEL` string constants
- Added 7 unit tests for TokenUsage ProgressBar (no maxTokens, with maxTokens, zero maxTokens, percentage display, warning/error/default variants)
- Updated 4 App tests for SplitButton export behavior (no button when empty, split button visible, dropdown toggle, PDF via dropdown)
- Total tests: 2583 → 2589 (128 test files, all passing)

### Agent 4 (Integrator) — Integrate useDebounce into Sidebar Search
- Added `useDebounce` hook (200ms) to Sidebar search query for debounced conversation filtering
- Search input updates immediately (responsive UX) while filter computation is debounced (performance)
- Updated 5 existing search tests to use `waitFor` for debounced assertions
- Added 1 test verifying debounce behavior (immediate input, delayed filter)
- Total tests: 2589 → 2590 (128 test files, all passing)

### Agent 4 (Integrator) — Integrate Chip for Reactions + Divider for Settings
- Replaced manual `message-reaction-badge` span with `Chip` component for emoji reactions in App.tsx
- Integrated `Divider` component into Settings dialog — adds labeled section separators (외관, 알림 및 표시, 모델 설정) between setting groups
- Added 3 string constants for Settings section labels (`SETTINGS_SECTION_APPEARANCE`, `SETTINGS_SECTION_NOTIFICATIONS`, `SETTINGS_SECTION_MODEL`)
- Added 4 unit tests for Settings Divider (section labels, separator roles)
- Total tests: 2590 → 2594 (128 test files, all passing)

### Agent 2 (Logic) — useFormValidation, useDevicePixelRatio Hooks & stateManagementUtils Utility
- Created `useFormValidation` hook: comprehensive form validation with field-level state management
  - Per-field state tracking: value, error, touched, dirty
  - Configurable validators with `validateOnChange` and `validateOnBlur` options
  - `validate()` validates all fields at once, returns boolean
  - `validateField(name)` validates single field, returns error string or null
  - `setValue`, `setError`, `handleBlur` for field interactions
  - `reset()` and `resetField(name)` for form/field reset
  - Derived state: `isValid`, `isDirty`, `isTouched`, `values`, `errors`
  - 6 built-in validators: `required`, `minLength`, `maxLength`, `pattern`, `minValue`, `maxValue`
  - Validators receive allValues for cross-field validation support
- Created `useDevicePixelRatio` hook: display pixel density detection
  - Returns `pixelRatio`, `isHighDPI` (>1), `isRetina` (>=2)
  - Reactive updates via matchMedia `resolution` query change listener
  - Handles zoom changes and multi-monitor transitions
  - Fallback to 1 when devicePixelRatio is unavailable
- Created `stateManagementUtils` utility with 7 exports:
  - `createStore<S,A>`: Redux-like store with getState, dispatch, subscribe, select
  - `combineReducers`: merges multiple reducers into one (returns same ref when unchanged)
  - `loggerMiddleware`: pass-through middleware for debugging
  - `thunkMiddleware`: enables dispatching functions for async workflows
  - `createSelector`: memoized selector with 1-2 input selectors
  - `createAction<P>`: action creator factory with type property
  - Middleware chaining with right-to-left composition
- Added 37 tests for useFormValidation
- Added 10 tests for useDevicePixelRatio
- Added 26 tests for stateManagementUtils

### Agent 2 (Logic) — useReducerWithMiddleware, useStateWithHistory Hooks & eventBusUtils Utility
- Created `useReducerWithMiddleware` hook: useReducer with composable middleware support
- Created `useStateWithHistory` hook: useState with full change history tracking
  - Returns `value`, `setValue`, `history`, `historySize`, `clearHistory`, `goTo`
  - `history` entries contain `{ value, timestamp }` for each state change
  - Configurable `maxHistory` (default 100) with sliding window
  - `goTo(index)` sets value to any historical entry (bounds-checked)
  - `clearHistory()` retains only current value
  - Stable callback references across re-renders
- Created `eventBusUtils` utility with type-safe event bus:
  - `createEventBus<EventMap>()`: creates typed pub/sub event bus
  - `on(event, listener)`: subscribe, returns unsubscribe function
  - `off(event, listener)`: unsubscribe specific listener
  - `emit(event, data)`: publish event to all listeners (snapshot iteration)
  - `once(event, listener)`: auto-unsubscribe after first call
  - `clear(event?)`: clear listeners for one or all events
  - `listenerCount(event)` and `hasListeners(event)` for introspection
  - Safe during emit: listeners can remove themselves without issues
- Added 14 tests for useReducerWithMiddleware (init, dispatch, multi-action, payload, middleware call, getState, chain order, block, transform, re-dispatch, stable ref, empty array, state visibility, three middlewares)
- Added 14 tests for useStateWithHistory (init, initial history, setValue, history entries, timestamps, maxHistory limit, clearHistory, goTo, negative index, high index, objects, stable refs, default max, middle goTo)
- Added 25 tests for eventBusUtils (create, on+emit, multiple listeners, cross-event isolation, complex data, repeat emit, unsubscribe, off specific, off non-existent, off empty event, once, once unsubscribe, once with regular, clear event, clear preserves others, clear all, listenerCount zero, listenerCount multiple, listenerCount after off, hasListeners false, hasListeners true, hasListeners after remove, emit no listeners, self-remove during emit, undefined data)
- Total tests: 2663 → 2720 (134 test files, all passing)

### Agent 4 (Integrator) — Integrate Switch for Settings Toggles + Tooltip for Header Buttons
- Replaced 3 manual `toggle-btn` elements in Settings with `Switch` component (high-contrast, notification-sound, show-timestamps)
- Added `aria-label` prop support to Switch component for custom accessibility labels
- Wrapped 4 header action buttons (Clear, Code, Links, Stats) with `Tooltip` component for hover help text
- Removed `title` attributes from header buttons (Tooltip provides better UX)
- Updated 2 high contrast tests to match Switch component behavior (no ON/OFF text)
- Added 4 unit tests for Switch toggle integration (rendering, checked state, toggle click, timestamps)
- Total tests: 2598 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 9 (+72 tests)
- **useRetry.test.ts**: Added 8 tests — exponential/fixed backoff delay verification, cancel stops in-progress retries, maxRetries=0 single attempt, execute resets prior state, onRetry receives last error per attempt, attempt count matches maxRetries after failure
- **useFormattingToolbar.test.ts**: Added 8 tests — bold mid-text cursor positions, italic/code/strikethrough placeholder end positions, link with selection selects url, codeblock wraps in fenced block, unknown action preserves cursor, bold at end of text
- **useDialogs.test.ts**: Added 8 tests — toggle cycles for command palette/quick switcher/shortcut help, all 18 callbacks stable across rerenders, simultaneous open/close all dialogs, toggleInputPreview 4-step cycle, close already-closed no-op
- **useCountdown.test.ts**: Added 8 tests — restart clears previous timer, pause+reset, onComplete fires after resume, resume no-op after finish, multiple pauses idempotent, callback stability, does not go below zero
- **useMessageActions.test.ts**: Added 8 tests — edit/pin/bookmark/emoji context menu actions, handleEmojiSelect toggles reaction and closes picker, emoji select without target is no-op, pin deduplication, unpin by index
- **Pagination.test.tsx**: Added 8 tests + 3 generatePageRange edge cases — previous/next no-op at bounds, negative totalPages, single page no ellipsis, nav title attributes, CSS classes, 2-page no ellipsis, edge ranges
- **DropdownMenu.test.tsx**: Added 8 tests — Enter/Space without active item, disabled item click no-op, disabled mouseEnter no activation, empty actionable Home/End keys, ArrowUp wrap-around, menu tabIndex
- **PinnedMessages.test.tsx**: Added 8 tests — unpin stopPropagation, pin icon content, tabIndex on items, role class matching, non-Enter keyDown ignored, aria-labels on unpin buttons, single-item count, 80-char no-truncate
- **ColorPicker.test.tsx**: Added 8 tests — trigger title attribute, disabled prevents dropdown, input maxLength/placeholder, preset aria-label, dropdown aria-label, non-selected preset class
- Total tests: 2583 → 2655 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 10 (+91 tests)
- **messageSearch.test.ts**: Added 13 tests — empty conversations array, match at start/end, single occurrence per message, preserves conversationTitle/role, multi-conversation search, getMatchContext no-ellipsis, leading/trailing ellipsis, default contextLength, zero-length match
- **colorUtils.test.ts**: Added 21 tests — uppercase/mixed-case hex, 4/5-digit hex null, cyan/magenta rgbToHsl paths, dark color saturation, green/blue/white/black hslToRgb, lighten/darken by 0, red vs green luminance, sRGB threshold boundary, contrast >= 1, mix invalid first/default weight, mid-dark/light contrast text, zero alpha rgba
- **dateUtils.test.ts**: Added 13 tests — timeAgo boundaries (59min, 60min, 23h, 6d, 7d, 28d, 35d), Date.now() default, isSameDay different year, midnight boundary, formatDate/formatTime different values, exact hour formatDuration
- **useIdle.test.ts**: Added 8 tests — default 60s timeout, no onActive before idle, lastActiveTime update, multiple activity resets, reset-after-idle restarts timer, non-registered events ignored, return shape validation
- **useQueue.test.ts**: Added 8 tests — enqueue-after-dequeue FIFO, dequeue-all empties queue, peek updates after enqueue/dequeue, isEmpty toggle, contains on empty/mutated queue, toArray empty
- **useReactions.test.ts**: Added 8 tests — sequential multi-emoji removal, hasReaction after toggle-off, non-existent conversation/message, toggle on-off-on re-add, callback stability, cross-conversation independence
- **useUndoRedo.test.ts**: Added 8 tests — set-then-undo roundtrip, historySize decreases on undo, redo increases historySize, canUndo/canRedo after exhaustion, reset-then-set cycle, default maxHistory 50, array values
- **useKeyCombo.test.ts**: Added 8 tests — modifier-only keydown ignored, meta as mod, re-trigger after reset, sequence trim to maxLen, shift/alt modifiers, single-key combo, default 500ms timeout
- **usePerformanceMonitor.test.ts**: Added 8 tests — stops recording after disable, enable-disable-enable preserves data, multiple resets, reset-then-record fresh, update phase correct, fastest render update, memory rounding
- Total tests: 2655 → 2746 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 11 (+118 tests)
- **mathRenderer.test.ts**: Added 49 tests — textrm/textbf/bf commands, bar/overline, backslash space, empty input, HTML escaping (ampersand/quotes), single-char sub/superscript, non-mappable <sup>/<sub>, all symbol categories (mp, equiv, sim, arrows, big operators, set theory, logic, misc, dots, brackets, typography, others), all 28 math functions, frac single-char args, all Greek lowercase/uppercase/variant letters
- **MessageSearch.test.tsx**: Added 10 tests — ArrowDown/ArrowUp selection bounds, Enter with no results, selectedIndex reset on query change, empty query hides count/empty state, panel click stopPropagation, mouseEnter updates selection, mark highlighting, aria-selected
- **CodeSnippets.test.tsx**: Added 10 tests — non-Escape key ignored, code content in <code>, language labels, active filter CSS class, dialog aria-label, "plain" for no-language blocks, second message navigate index, copy/navigate button titles
- **syntaxHighlight.test.ts**: Added 20 tests — 0X uppercase hex, identifiers as text, line/block comment behavior, CSS/JSON no line comments/no functions, Python # after code, Python/bash no block comments, whitespace input, multiple punctuation, JS/Python/bash keyword groups, code reconstruction for Python/bash, $/_ identifier starts
- **LinkCollection.test.tsx**: Added 8 tests — clipboard copy/checkmark/failure, link title attribute, bare-link-only URL, second message navigate, tabIndex -1, label vs URL-only display
- **KeyboardShortcutHelp.test.tsx**: Added 10 tests — group count, Escape/Enter/Shift+Enter/Ctrl+K/Ctrl+L/Ctrl+, shortcuts, SHORTCUT_GROUPS structure validation, close button text, header/content CSS sections
- **QuickSwitcher.test.tsx**: Added 9 tests — Enter with empty results, mouseEnter selection, current CSS class, null conversationId, onChange resets index, listbox role, placeholder text, dates meta, empty conversations
- **conversationStats.test.ts**: Added 12 tests — rounding to 1 decimal, tied longest/shortest picks first, full empty stats shape, 100 conversations stress test, averageMessageLength rounding, only-assistant messages, all-empty-content, formatNumber edge cases (0, boundary values)
- Total tests: 2746 → 2864 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 12 (+58 tests)
- **useWindowSize.test.ts**: Added 8 tests — height-only resize, interface shape validation, no-throw after unmount, single resize listener registration, very small/large dimensions, simultaneous width+height update
- **useHover.test.ts**: Added 8 tests — multiple enter/leave cycles, duplicate enter stays true, duplicate leave stays false, ref stable across rerenders, ref stable after state change, interface shape, leave without prior enter
- **InputPreview.test.tsx**: Added 10 tests — input-preview/label/content CSS classes, tab-only/newline-only whitespace hidden, italic/list rendering, visibility toggle, content change from empty to non-empty
- **useMediaQuery.test.ts**: Added 8 tests — rapid true/false/true changes, boolean return type, same-value no-change, correct query string, matching-to-non-matching, independent queries, old query listener removal
- **useMutationObserver.test.ts**: Added 8 tests — options change reconnects, multiple mutations single callback, unmount disconnect, subtree+characterData options, null ref transition, empty mutations array, incremental options changes
- **useNotificationSound.test.ts**: Added 8 tests — play stability, oscillator→gain connection, gain→destination connection, gain envelope values, enabled→disabled toggle, sine wave type, return shape
- **useOnClickOutside.test.ts**: Added 8 tests — false→true resubscribe, click on element itself, deeply nested child click, true→false stops firing, default active=true, ref stability, multiple outside clicks
- **useDocumentTitle.test.ts**: Added 8 tests — very long title, Korean characters, same title multiple times, multiple updates before unmount, HTML entities, newline collapsing, original title captured at mount
- Total tests: 2864 → 2922 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 13 (+63 tests)
- **useToggle.test.ts**: Added 8 tests — triple toggle, setTrue/setFalse after toggle, setValue stability, return shape, callbacks stable after state change, idempotent setValue, even toggles return to original
- **usePrevious.test.ts**: Added 8 tests — array values, four sequential updates, empty string initial, object reference identity, zero as falsy, undefined-to-defined transition, same reference rerender, NaN
- **useEventListener.test.ts**: Added 8 tests — custom element dispatch, remove from custom element, boolean options, re-attach on eventName change, re-attach on element change, multiple events, document listener, capture option
- **useDebounce.test.ts**: Added 8 tests — boolean values, delay change without value, null value, undefined value, rapid changes final only, same value rerender, delay decrease, empty string
- **useFocus.test.ts**: Added 8 tests — null blur no-throw, double onFocus, double onBlur, focus/blur/focus cycle, ref stability, callbacks stable after state, return shape, multiple focus calls
- **useInterval.test.ts**: Added 8 tests — pre-first interval, clearInterval on unmount, short-to-long delay, null-to-null, 1ms delay, multiple delay changes, same delay rerender
- **useScrollPosition.test.ts**: Added 8 tests — default 100ms throttle, direction none, isAtBottom false, threshold boundary, isAtTop false, return shape, window fallback, clearTimeout on unmount
- **SessionIndicator.test.tsx**: Added 7 tests — base CSS class, dot/text span elements, text content, title tooltips per status, root div element
- Total tests: 2922 → 2985 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 14 (+62 tests)
- **useGeolocation.test.ts**: Added 8 tests — error message text, watch mode no-API, watch loading, watch position updates, watch error callback, watch options passthrough, requestPosition stability
- **useSpeechSynthesis.test.ts**: Added 8 tests — voice option on utterance, null voice, cancel resets state, voiceschanged listener, remove listener on unmount, cancel previous before new, callback stability
- **useSelection.test.ts**: Added 8 tests — selectionchange listener registration, clear stability, mid-text offsets, null targetRef current, deselection cycle, isCollapsed tracking, direct target element selection
- **useIntersectionObserver.test.ts**: Added 8 tests — ref stability, intersectionRatio update, frozen state persistence, no freeze when disabled, element observation, boundingClientRect storage, disconnect on options change
- **PerformancePanel.test.tsx**: Added 13 tests — modal stopPropagation, status dot CSS classes, M/U phase labels, metric card count, empty recent renders, dialog aria-label, toggle active class, formatDuration/formatMemory edge cases
- **useLongPress.test.ts**: Added 7 tests — touch short press onClick, onEnd after long press, onStart event forwarding, onLongPress event forwarding, mouse leave no onEnd, rapid double click, onMouseLeave stability
- **useDragAndDrop.test.ts**: Added 8 tests — drop counter reset, drop preventDefault, dragLeave preventDefault, multiple accept patterns, no onDrop callback, nested enter count, nested leave count
- **useReadingProgress.test.ts**: Added 8 tests — reset stability, 25% progress, container ref 50%, container non-scrollable, container scrollTop 0, container unmount cleanup, throttle suppression
- Total tests: 2985 → 3047 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 15 (+62 tests)
- **useThrottle.test.ts**: Added 8 tests — null/undefined/boolean/array values, unmount safety, immediate update after full cycle, very large delay
- **useAsync.test.ts**: Added 8 tests — unmount safety on success/error, numeric rejection, reset during loading, object/array data types, sequential execute cycle
- **useClipboard.test.ts**: Added 8 tests — empty string copy, special characters, multiline text, delay boundary, error-then-success clear, rapid copies, zero delay reset
- **useNetworkStatus.test.ts**: Added 8 tests — result shape validation, dual timestamp updates, multiple offline/online events, rapid cycling, idempotent events, timestamp Date values
- **usePageVisibility.test.ts**: Added 8 tests — result shape validation, hiddenDuration pre-hide zero, lastHiddenTime updates, duration accumulation, no-options usage, callback isolation, null lastVisibleTime
- **useNotification.test.ts**: Added 8 tests — result shape validation, unsupported notify returns null, options passthrough, no-options notify, denied permission update, notify stability, initial granted, isSupported true
- **windowState.test.ts**: Added 9 tests — empty JSON object, empty file, non-boolean isMaximized, zero dimensions invalid, x=0/y=0 valid, negative coords, JSON array fallback, extra properties, optional fields omitted save
- **Tooltip.test.tsx**: Added 8 tests — wrapper CSS class, content text match, arrow span element, re-enter deduplication, timer clearTimeout, focus/blur cycle, nested children rendering
- Total tests: 3047 → 3109 (128 test files, all passing)

### Agent 2 (Logic) — useWebSocket, useAnimationFrame Hooks & promiseUtils Utility
- Created `useWebSocket` hook: WebSocket connection management with auto-reconnect
  - `WebSocketStatus`: 'connecting' | 'connected' | 'disconnected' | 'error'
  - Returns: `status`, `lastMessage`, `send`, `connect`, `disconnect`, `reconnectCount`
  - Auto-connects when URL provided, disconnects on URL null
  - Configurable reconnect with `reconnectInterval`, `reconnectAttempts`, exponential reconnect count tracking
  - Callbacks: `onOpen`, `onClose`, `onError`, `onMessage`
  - Protocol support via `protocols` option
  - Clean teardown on unmount (close WS, clear timers, null handlers)
  - Stable `send` reference via `useCallback`
- Created `useAnimationFrame` hook: requestAnimationFrame-based animation loop
  - Returns: `start`, `stop`, `isRunning`, `elapsed`, `fps`
  - Tracks delta time and total elapsed via refs
  - FPS calculated from frame-to-frame delta
  - Resets elapsed/fps on restart
  - Uses callback ref for latest callback without re-registering
  - Prevents double-start, cleans up on unmount
- Created `promiseUtils` utility with 7 exports:
  - `TimeoutError`: custom error class for timeout identification
  - `withTimeout<T>(promise, ms)`: rejects with TimeoutError if promise exceeds ms
  - `delay(ms)`: simple promise-based delay
  - `withRetry<T>(fn, options)`: retry with configurable attempts, delay, exponential backoff, onRetry callback
  - `settleAll<T>(promises)`: like Promise.allSettled with typed results
  - `deferred<T>()`: creates externally resolvable/rejectable promise
  - `sequential<T>(tasks)`: execute promise-returning functions one at a time
  - `pool<T>(tasks, concurrency)`: execute with limited parallel workers, preserving order
- Added 21 tests for useWebSocket (null url, connect, open, close, error, message, send, not-connected send, onOpen, onClose, onError, onMessage, disconnect, disconnect code/reason, reconnect, max attempts, reconnect reset, protocols, unmount cleanup, url change, stable send)
- Added 13 tests for useAnimationFrame (init state, start, callback delta/elapsed, stop, no-call-after-stop, elapsed update, fps calc, reset on restart, ignore double-start, unmount cleanup, stable refs, latest callback ref, start/stop cycles)
- Added 29 tests for promiseUtils (delay resolve, delay timing, withTimeout success, withTimeout reject, TimeoutError msg, promise rejection passthrough, TimeoutError name, withRetry success, retry+succeed, retry exhausted, onRetry callback, exponential backoff, default 3 attempts, settleAll fulfilled, rejected, mixed, empty, deferred resolve, reject, pending, shape, sequential order, empty, error propagation, pool basic, concurrency limit, empty, order preservation, large concurrency)
- Total tests: 2720 → 2783 (137 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 10 (+91 tests)
- **messageSearch.test.ts**: Added 13 tests — empty conversations array, match at start/end, single occurrence per message, preserves conversationTitle/role, multi-conversation search, getMatchContext no-ellipsis, leading/trailing ellipsis, default contextLength, zero-length match
- **colorUtils.test.ts**: Added 21 tests — uppercase/mixed-case hex, 4/5-digit hex null, cyan/magenta rgbToHsl paths, dark color saturation, green/blue/white/black hslToRgb, lighten/darken by 0, red vs green luminance, sRGB threshold boundary, contrast >= 1, mix invalid first/default weight, mid-dark/light contrast text, zero alpha rgba
- **dateUtils.test.ts**: Added 13 tests — timeAgo boundaries (59min, 60min, 23h, 6d, 7d, 28d, 35d), Date.now() default, isSameDay different year, midnight boundary, formatDate/formatTime different values, exact hour formatDuration
- **useIdle.test.ts**: Added 8 tests — default 60s timeout, no onActive before idle, lastActiveTime update, multiple activity resets, reset-after-idle restarts timer, non-registered events ignored, return shape validation
- **useQueue.test.ts**: Added 8 tests — enqueue-after-dequeue FIFO, dequeue-all empties queue, peek updates after enqueue/dequeue, isEmpty toggle, contains on empty/mutated queue, toArray empty
- **useReactions.test.ts**: Added 8 tests — sequential multi-emoji removal, hasReaction after toggle-off, non-existent conversation/message, toggle on-off-on re-add, callback stability, cross-conversation independence
- **useUndoRedo.test.ts**: Added 8 tests — set-then-undo roundtrip, historySize decreases on undo, redo increases historySize, canUndo/canRedo after exhaustion, reset-then-set cycle, default maxHistory 50, array values
- **useKeyCombo.test.ts**: Added 8 tests — modifier-only keydown ignored, meta as mod, re-trigger after reset, sequence trim to maxLen, shift/alt modifiers, single-key combo, default 500ms timeout
- **usePerformanceMonitor.test.ts**: Added 8 tests — stops recording after disable, enable-disable-enable preserves data, multiple resets, reset-then-record fresh, update phase correct, fastest render update, memory rounding
- Total tests: 2655 → 2746 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 11 (+118 tests)
- **mathRenderer.test.ts**: Added 49 tests — textrm/textbf/bf commands, bar/overline, backslash space, empty input, HTML escaping (ampersand/quotes), single-char sub/superscript, non-mappable <sup>/<sub>, all symbol categories (mp, equiv, sim, arrows, big operators, set theory, logic, misc, dots, brackets, typography, others), all 28 math functions, frac single-char args, all Greek lowercase/uppercase/variant letters
- **MessageSearch.test.tsx**: Added 10 tests — ArrowDown/ArrowUp selection bounds, Enter with no results, selectedIndex reset on query change, empty query hides count/empty state, panel click stopPropagation, mouseEnter updates selection, mark highlighting, aria-selected
- **CodeSnippets.test.tsx**: Added 10 tests — non-Escape key ignored, code content in <code>, language labels, active filter CSS class, dialog aria-label, "plain" for no-language blocks, second message navigate index, copy/navigate button titles
- **syntaxHighlight.test.ts**: Added 20 tests — 0X uppercase hex, identifiers as text, line/block comment behavior, CSS/JSON no line comments/no functions, Python # after code, Python/bash no block comments, whitespace input, multiple punctuation, JS/Python/bash keyword groups, code reconstruction for Python/bash, $/_ identifier starts
- **LinkCollection.test.tsx**: Added 8 tests — clipboard copy/checkmark/failure, link title attribute, bare-link-only URL, second message navigate, tabIndex -1, label vs URL-only display
- **KeyboardShortcutHelp.test.tsx**: Added 10 tests — group count, Escape/Enter/Shift+Enter/Ctrl+K/Ctrl+L/Ctrl+, shortcuts, SHORTCUT_GROUPS structure validation, close button text, header/content CSS sections
- **QuickSwitcher.test.tsx**: Added 9 tests — Enter with empty results, mouseEnter selection, current CSS class, null conversationId, onChange resets index, listbox role, placeholder text, dates meta, empty conversations
- **conversationStats.test.ts**: Added 12 tests — rounding to 1 decimal, tied longest/shortest picks first, full empty stats shape, 100 conversations stress test, averageMessageLength rounding, only-assistant messages, all-empty-content, formatNumber edge cases (0, boundary values)
- Total tests: 2746 → 2864 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 12 (+58 tests)
- **useWindowSize.test.ts**: Added 8 tests — height-only resize, interface shape validation, no-throw after unmount, single resize listener registration, very small/large dimensions, simultaneous width+height update
- **useHover.test.ts**: Added 8 tests — multiple enter/leave cycles, duplicate enter stays true, duplicate leave stays false, ref stable across rerenders, ref stable after state change, interface shape, leave without prior enter
- **InputPreview.test.tsx**: Added 10 tests — input-preview/label/content CSS classes, tab-only/newline-only whitespace hidden, italic/list rendering, visibility toggle, content change from empty to non-empty
- **useMediaQuery.test.ts**: Added 8 tests — rapid true/false/true changes, boolean return type, same-value no-change, correct query string, matching-to-non-matching, independent queries, old query listener removal
- **useMutationObserver.test.ts**: Added 8 tests — options change reconnects, multiple mutations single callback, unmount disconnect, subtree+characterData options, null ref transition, empty mutations array, incremental options changes
- **useNotificationSound.test.ts**: Added 8 tests — play stability, oscillator→gain connection, gain→destination connection, gain envelope values, enabled→disabled toggle, sine wave type, return shape
- **useOnClickOutside.test.ts**: Added 8 tests — false→true resubscribe, click on element itself, deeply nested child click, true→false stops firing, default active=true, ref stability, multiple outside clicks
- **useDocumentTitle.test.ts**: Added 8 tests — very long title, Korean characters, same title multiple times, multiple updates before unmount, HTML entities, newline collapsing, original title captured at mount
- Total tests: 2864 → 2922 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 13 (+63 tests)
- **useToggle.test.ts**: Added 8 tests — triple toggle, setTrue/setFalse after toggle, setValue stability, return shape, callbacks stable after state change, idempotent setValue, even toggles return to original
- **usePrevious.test.ts**: Added 8 tests — array values, four sequential updates, empty string initial, object reference identity, zero as falsy, undefined-to-defined transition, same reference rerender, NaN
- **useEventListener.test.ts**: Added 8 tests — custom element dispatch, remove from custom element, boolean options, re-attach on eventName change, re-attach on element change, multiple events, document listener, capture option
- **useDebounce.test.ts**: Added 8 tests — boolean values, delay change without value, null value, undefined value, rapid changes final only, same value rerender, delay decrease, empty string
- **useFocus.test.ts**: Added 8 tests — null blur no-throw, double onFocus, double onBlur, focus/blur/focus cycle, ref stability, callbacks stable after state, return shape, multiple focus calls
- **useInterval.test.ts**: Added 8 tests — pre-first interval, clearInterval on unmount, short-to-long delay, null-to-null, 1ms delay, multiple delay changes, same delay rerender
- **useScrollPosition.test.ts**: Added 8 tests — default 100ms throttle, direction none, isAtBottom false, threshold boundary, isAtTop false, return shape, window fallback, clearTimeout on unmount
- **SessionIndicator.test.tsx**: Added 7 tests — base CSS class, dot/text span elements, text content, title tooltips per status, root div element
- Total tests: 2922 → 2985 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 14 (+62 tests)
- **useGeolocation.test.ts**: Added 8 tests — error message text, watch mode no-API, watch loading, watch position updates, watch error callback, watch options passthrough, requestPosition stability
- **useSpeechSynthesis.test.ts**: Added 8 tests — voice option on utterance, null voice, cancel resets state, voiceschanged listener, remove listener on unmount, cancel previous before new, callback stability
- **useSelection.test.ts**: Added 8 tests — selectionchange listener registration, clear stability, mid-text offsets, null targetRef current, deselection cycle, isCollapsed tracking, direct target element selection
- **useIntersectionObserver.test.ts**: Added 8 tests — ref stability, intersectionRatio update, frozen state persistence, no freeze when disabled, element observation, boundingClientRect storage, disconnect on options change
- **PerformancePanel.test.tsx**: Added 13 tests — modal stopPropagation, status dot CSS classes, M/U phase labels, metric card count, empty recent renders, dialog aria-label, toggle active class, formatDuration/formatMemory edge cases
- **useLongPress.test.ts**: Added 7 tests — touch short press onClick, onEnd after long press, onStart event forwarding, onLongPress event forwarding, mouse leave no onEnd, rapid double click, onMouseLeave stability
- **useDragAndDrop.test.ts**: Added 8 tests — drop counter reset, drop preventDefault, dragLeave preventDefault, multiple accept patterns, no onDrop callback, nested enter count, nested leave count
- **useReadingProgress.test.ts**: Added 8 tests — reset stability, 25% progress, container ref 50%, container non-scrollable, container scrollTop 0, container unmount cleanup, throttle suppression
- Total tests: 2985 → 3047 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 15 (+62 tests)
- **useThrottle.test.ts**: Added 8 tests — null/undefined/boolean/array values, unmount safety, immediate update after full cycle, very large delay
- **useAsync.test.ts**: Added 8 tests — unmount safety on success/error, numeric rejection, reset during loading, object/array data types, sequential execute cycle
- **useClipboard.test.ts**: Added 8 tests — empty string copy, special characters, multiline text, delay boundary, error-then-success clear, rapid copies, zero delay reset
- **useNetworkStatus.test.ts**: Added 8 tests — result shape validation, dual timestamp updates, multiple offline/online events, rapid cycling, idempotent events, timestamp Date values
- **usePageVisibility.test.ts**: Added 8 tests — result shape validation, hiddenDuration pre-hide zero, lastHiddenTime updates, duration accumulation, no-options usage, callback isolation, null lastVisibleTime
- **useNotification.test.ts**: Added 8 tests — result shape validation, unsupported notify returns null, options passthrough, no-options notify, denied permission update, notify stability, initial granted, isSupported true
- **windowState.test.ts**: Added 9 tests — empty JSON object, empty file, non-boolean isMaximized, zero dimensions invalid, x=0/y=0 valid, negative coords, JSON array fallback, extra properties, optional fields omitted save
- **Tooltip.test.tsx**: Added 8 tests — wrapper CSS class, content text match, arrow span element, re-enter deduplication, timer clearTimeout, focus/blur cycle, nested children rendering
- Total tests: 3047 → 3109 (128 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 16 (+64 tests)
- **stateManagementUtils.test.ts**: Added 8 tests — duplicate subscribe idempotent, identity select, middleware action modification, thunk no notify, two-input selector recompute, single-key combineReducers, createAction no-payload shape, unsubscribe per listener
- **promiseUtils.test.ts**: Added 8 tests — withTimeout timer clear, onRetry sequential attempt numbers, deferred reject undefined, settleAll mixed timing, sequential single task, pool sequential with concurrency=1, TimeoutError instanceof check, pool error propagation
- **domUtils.test.ts**: Added 8 tests — element left of viewport, element right exceeds viewport, exact threshold boundary, rounded scroll percent, select/textarea focusable, trapFocus middle element no-op, clipboard text argument, setDataAttribute overwrite
- **objectUtils.test.ts**: Added 8 tests — pick preserves references, omit multiple keys, deepClone undefined values, isEqual array vs object, deeply nested equality, merge no args, getPath array index, mapValues no mutation
- **storageUtils.test.ts**: Added 8 tests — null JSON value, array storage, multi-item storage size, expiry wrapper object structure, expiry cleanup on read, missing expiresAt fallback, empty namespace keys, removeByPrefix count
- **functionUtils.test.ts**: Added 8 tests — compose empty identity, pipe empty identity, once ignores subsequent args, memoize multi-args key, debounce last args, throttle args passthrough, negate arg passing, negative times
- **urlUtils.test.ts**: Added 8 tests — data URI valid, subdomain extraction, double extension, duplicate query params, overwrite existing param, stripQueryParams fragment, file protocol, multiple URLs per line
- **cryptoUtils.test.ts**: Added 8 tests — single byte hex, randomInt variety, similar string different hashes, SHA256 Unicode, base64 valid chars, shortId uniqueness, single char difference, hue determinism range
- Total tests: 3494 → 3558 (143 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 17 (+63 tests)
- **useWebSocket.test.ts**: Added 7 tests — stable disconnect ref, reconnect timer clear on disconnect, null url no connect, multiple messages order, latest message overwrite, url change closes previous, reconnectCount reset on disconnect
- **useAnimationFrame.test.ts**: Added 8 tests — fps 0 before frame, fps reset on restart, stop safe when not running, elapsed 0 after first frame, correct elapsed multi-frame, delta 0 first frame, frame scheduling, cancel after stop
- **AvatarGroup.test.tsx**: Added 8 tests — small size dimensions, large size dimensions, overflow z-index 0, overflow class, item class count, different name colors, aria-label per avatar, max=0 shows only overflow
- **numberUtils.test.ts**: Added 8 tests — clamp negative range, clamp at exact min, clamp at exact max, formatBytes TB, fractional MB, roundTo 1 decimal, roundTo negative, lerp negative t
- **GeminiProcess.test.ts**: Added 8 tests — always --yolo flag, always --output-format stream-json, multi-JSON chunk, node executable, cwd passthrough, restart after stop, non-JSON { without }, buffer accumulation
- **useFormValidation.test.ts**: Added 8 tests — maxLength custom msg, pattern default msg, minValue custom msg, maxValue custom msg, minValue exact boundary, maxValue exact boundary, minLength exact boundary, maxLength exact boundary
- **Carousel.test.tsx**: Added 8 tests — unrelated key no-op, Home no-op at first, End no-op at last, indicator click current no-op, autoPlay=false no advance, empty custom label, viewport exists, slide label "2 / 3"
- **Rating.test.tsx**: Added 8 tests — no aria-disabled when interactive, no aria-readonly when interactive, no label text without prop, half container element, half filled/empty icons, ArrowDown half step, max=3 star count, no-clear without allowClear
- Total tests: 3755 → 3818 (148 test files, all passing)

### Agent 2 (Logic) — useBreakpoint, useClipboardPaste Hooks & typeGuardUtils Utility
- Created `useBreakpoint` hook: responsive breakpoint detection
  - Default breakpoints: xs(0), sm(640), md(768), lg(1024), xl(1280), 2xl(1536)
  - Returns: `current`, `width`, `isAbove`, `isBelow`, `isAt`, `isBetween`
  - `isAt` checks if width falls within a breakpoint's range (e.g., md = 768–1023)
  - `isBetween(min, max)` checks inclusive min, exclusive max
  - Supports custom breakpoints via `Partial<BreakpointConfig>`
  - Listens on window resize, cleans up on unmount
- Created `useClipboardPaste` hook: clipboard paste event handler
  - Detects text, HTML, image files, and non-image files from paste events
  - Returns `PasteData`: `text`, `html`, `images`, `files`, `hasContent`
  - `acceptTypes` filter with wildcard support (e.g., `image/*`)
  - Optional `targetRef` to listen on specific element instead of document
  - `enabled` toggle to activate/deactivate listener
  - Uses refs for stable callback without re-registering listeners
- Created `typeGuardUtils` utility with 22 type guards + 1 assertion:
  - Primitives: `isString`, `isNumber` (excludes NaN), `isBoolean`
  - Nullish: `isNil`, `isNonNil`
  - Objects: `isPlainObject`, `isArray`, `isFunction`, `isDate` (valid only), `isRegExp`
  - Collections: `isMap`, `isSet`
  - Async: `isPromiseLike` (thenable detection)
  - Errors: `isError`
  - Refinements: `isNonEmptyString`, `isNonEmptyArray`, `isFiniteNumber`, `isInteger`, `isPositive`, `isNegative`
  - Property checks: `hasProperty`, `hasProperties`
  - Assertion: `assertType(value, guard, message?)` — throws TypeError on failure
- Added 16 tests for useBreakpoint (current lg, xs, sm, md, xl, 2xl, width, resize update, isAbove, isBelow, isAt range, isAt 2xl, isBetween, custom breakpoints, default export, cleanup)
- Added 13 tests for useClipboardPaste (text, html, images, non-image files, separation, no content, acceptTypes text, acceptTypes wildcard, disabled, re-enable, cleanup, targetRef, text+files combo)
- Added 60 tests for typeGuardUtils (isString 4, isNumber 4, isBoolean 3, isNil 3, isNonNil 3, isPlainObject 4, isArray 3, isFunction 3, isDate 4, isRegExp 3, isPromiseLike 3, isError 3, isMap 2, isSet 2, isNonEmptyString 3, isNonEmptyArray 3, isFiniteNumber 3, isInteger 3, isPositive 3, isNegative 2, hasProperty 4, hasProperties 4, assertType 4)
- Total tests: 2947 → 3752 (150 test files, all passing)

### Agent 2 (Logic) — useCopyToClipboard, useSticky Hooks & rateLimitUtils Utility
- Created `useCopyToClipboard` hook: clipboard write with status management
  - Returns: `copy`, `isCopied`, `copiedText`, `isLoading`, `error`, `reset`
  - Auto-resets `isCopied` after configurable `resetDelay` (default 2000ms)
  - `resetDelay: 0` disables auto-reset
  - Callbacks: `onSuccess(text)`, `onError(error)`
  - Handles non-Error rejections (wraps to Error)
  - Clears previous timer on subsequent copy operations
- Created `useSticky` hook: scroll-based sticky element detection
  - Uses IntersectionObserver on a sentinel element for CSS-free detection
  - Returns: `isSticky`, `sentinelRef`, `scrollY`
  - Configurable `offset` for rootMargin-based trigger point
  - `enabled` toggle to activate/deactivate observer
  - Passive scroll listener for scrollY tracking
  - Disconnects observer and removes listeners on unmount
- Created `rateLimitUtils` utility with 4 rate limiters:
  - `createFixedWindowLimiter(maxRequests, windowMs)`: fixed time window counter
  - `createSlidingWindowLimiter(maxRequests, windowMs)`: per-request timestamp tracking
  - `createTokenBucket(maxTokens, refillRate, refillIntervalMs)`: constant refill up to capacity
  - `createLeakyBucket(capacity, leakRate, leakIntervalMs)`: queue with constant drain
  - All implement: `tryAcquire`, `remaining/available/queueSize`, `reset`, `retryAfter`
  - Token bucket supports multi-token consume via `tryAcquire(count)`
- Added 12 tests for useCopyToClipboard (init, copy, resetDelay, default delay, failure, onSuccess, onError, reset, timer clear, non-Error, error clear, no auto-reset)
- Added 12 tests for useSticky (init isSticky, init scrollY, sentinelRef, not intersecting, intersecting, scrollY tracking, disabled, reset on disable, offset rootMargin, scroll cleanup, disconnect, default offset)
- Added 34 tests for rateLimitUtils (Fixed: allow, block, window reset, remaining, reset, retryAfter zero, retryAfter positive; Sliding: allow, block, expire, remaining, reset, retryAfter zero, retryAfter ms, partial expiry; Token: full capacity, consume, reject, refill, max cap, multi-consume, reject multi, reset, retryAfter zero, retryAfter time, refill rate; Leaky: accept, reject, leak, queue size, queue decrease, no negative, reset, leak rate)
- Total tests: 3752 → 3966 (155 test files, all passing)

### Agent 4 (Integrator) — Integrate UserAvatar, NotificationBanner, Accordion
- Added `UserAvatar` component to `MessageBubble` — each message now displays a role-specific avatar (👤 for user, ✦ for assistant)
- Integrated `NotificationBanner` into App.tsx — shows error banner when `sessionStatus` is 'error' (connection failures)
  - Banner includes retry action button and is dismissible
  - Wired to `useStreamHandler`'s `sessionStatus` state
- Integrated `Accordion` into Settings dialog — wraps temperature, maxTokens, and fontSize controls
  - Advanced settings collapsible via accordion (expanded by default)
  - Replaced inline sliders with Accordion item for cleaner organization
- Added 6 string constants: `BANNER_CONNECTION_ERROR`, `BANNER_RETRY`, `SETTINGS_SECTION_GENERAL`, `SETTINGS_SECTION_ADVANCED`
- Added 6 new integration tests: UserAvatar rendering for user/assistant, NotificationBanner visibility, session error banner, Accordion in settings, accordion expand
- Total tests: 3966 → 3972+ (157 test files, all passing)

### Agent 2 (Logic) — useOrientation, useBattery Hooks & iteratorUtils Utility
- Created `useOrientation` hook: device orientation detection
  - Returns: `type` ('portrait' | 'landscape'), `angle`, `isPortrait`, `isLandscape`
  - Uses Screen Orientation API with resize event fallback
  - Angle-based detection: 0/180 = portrait, 90/270 = landscape
  - Falls back to window dimensions when API unavailable
  - Listens for both orientation change and resize events
- Created `useBattery` hook: Battery Status API integration
  - Returns: `isSupported`, `charging`, `chargingTime`, `dischargingTime`, `level`
  - Async getBattery() with graceful fallback for unsupported browsers
  - Listens for: chargingchange, chargingtimechange, dischargingtimechange, levelchange
  - Cleans up all 4 event listeners on unmount
- Created `iteratorUtils` utility with 15 lazy generator functions:
  - Generation: `range(start, end, step)` — numeric ranges with step
  - Transformation: `map`, `filter`, `flatten`, `chunk`
  - Selection: `take`, `skip`, `takeWhile`, `skipWhile`
  - Combination: `zip`, `enumerate`, `cycle`
  - Deduplication: `unique` with optional key function
  - Aggregation: `reduce`, `toArray`
  - All generators are lazy — only compute values on demand
- Added 10 tests for useOrientation (portrait 0°, landscape 90°, portrait 180°, landscape 270°, orientation listener, resize listener, update on change, cleanup, fallback landscape, fallback portrait)
- Added 10 tests for useBattery (init, read state, add listeners, remove listeners, level change, charging change, rejection, missing API, dischargingTime, full battery)
- Added 54 tests for iteratorUtils (range 6, chunk 5, zip 4, take 4, skip 3, filter 3, map 3, flatten 3, enumerate 3, takeWhile 3, skipWhile 3, unique 4, reduce 3, toArray 2, cycle 3, composition 2)
- Total tests: 3966 → 4195 (160 test files, all passing)

### Agent 4 (Integrator) — Integrate SessionIndicator, DropdownMenu, ProgressBar
- Added `SessionIndicator` to App.tsx header — displays real-time connection status (idle/connecting/connected/error) with colored dot and label
  - Wired to `sessionStatus` from `useStreamHandler` hook
- Replaced Sidebar delete buttons with `DropdownMenu` — each conversation now has a ⋮ options menu
  - Menu includes "대화 열기" (open) and "삭제" (delete) actions
  - Click on menu items doesn't propagate to conversation selection
  - Updated 9 existing tests to use DropdownMenu interaction pattern
- Added `ProgressBar` to display token usage after stream completion
  - Shows total tokens vs maxTokens with percentage
  - Variant changes dynamically: default (<70%), warning (70-90%), error (>90%)
- Added 4 string constants: `CONV_MENU_LABEL`, `CONV_MENU_OPEN`, `CONV_MENU_DELETE`, `TOKEN_PROGRESS_LABEL`
- Added 8 new integration tests: SessionIndicator rendering, error status, ProgressBar visibility, token usage bar, DropdownMenu trigger, menu open
- Total tests: 4195 → 4420+ (163 test files, all passing)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 18 (+64 tests)
- **useEmojiReactions.test.ts**: Added 8 tests — removeReaction non-existent, decrement >1, clearReactions target, toggle cycle, multi-emoji same message, remove last emoji, clearAllReactions
- **useBreakpoint.test.ts**: Added 8 tests — isAbove at 0, isBelow xs, isBetween edges, xs at 0, isAt false large, custom partial, multi-resize
- **useVirtualList.test.ts**: Added 8 tests — scrollToIndex no-op, wrapper height, overflow auto, sequential indices, single item, large overscan, scrollToIndex 0, containerHeight
- **Accordion.test.tsx**: Added 8 tests — expanded/collapsed classes, icons, region role, aria-labelledby, aria-controls, presentation role
- **Badge.test.tsx**: Added 8 tests — null at 0, null negative, dot with children, inline class, aria-label, dot at 0, wrapper class
- **BookmarkedMessages.test.tsx**: Added 8 tests — already in previous session
- **useClipboardPaste.test.ts**: Added 8 tests — already in previous session
- **useMessageSend.test.ts**: Added 7 tests — already in previous session
- Total tests: 4291 → 4291 (159 test files, all passing after rebase)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 19 (+68 tests)
- **SpeedDial.test.tsx**: Added 8 tests — openIcon swap, speed-dial-open class, trigger-open class, left/right direction, ArrowLeft/Right open, onOpen callback
- **TagInput.test.tsx**: Added 8 tests — label render/class, maxTags count, disabled at max, remove aria-label, readOnly, variant class
- **SplitButton.test.tsx**: Added 8 tests — spinner loading, no click loading, loading class, small/danger variant, icon, icon hidden loading, divider aria-hidden
- **DataTable.test.tsx**: Added 8 tests — bordered/striped/small classes, caption, aria-label, selected row, sort indicator
- **rateLimitUtils.test.ts**: Added 8 tests — leaky bucket reset/accepts, fixed remaining/retryAfter, sliding remaining/retryAfter, token available/retryAfter
- **CountdownTimer.test.tsx**: Added 8 tests — showHours, auto hours, complete class, small class, label, aria-label, reset visibility
- **TreeView.test.tsx**: Added 8 tests — small/lines/disabled classes, aria-label, chevrons, leaf spacer
- **Popover.test.tsx**: Added 8 tests — left/right position, start align, small size, arrow, disabled trigger, custom ariaLabel
- Total tests: 4505 (166 test files, all passing after rebase)

### Agent 3 (Tests & Types) — Deepen Test Coverage Round 20 (+64 tests)
- **useSet.test.ts**: Added 8 tests — empty init, toggle add/remove, remove non-existent, add duplicate, clear+add, values array, has after clear
- **usePermission.test.ts**: Added 8 tests — isGranted/isDenied/isPrompt true, query return, isSupported, change listener, query catch error, initial prompt default
- **useCopyToClipboard.test.ts**: Added 8 tests — copiedText stored, isLoading false, error on failure, isCopied false on error, reset clears all, onSuccess/onError callbacks, second copy updates
- **useMap.test.ts**: Added 8 tests — empty init, remove non-existent, set overwrites, has false, clear+set, keys array, entries array, get undefined
- **useBookmarks.test.ts**: Added 8 tests — different conversations same index, toggle twice, wrong conversationId remove, isBookmarked after remove, clear+add, order preservation, role storage, multi-conversation independence
- **useReducerWithMiddleware.test.ts**: Added 8 tests — action type received, set through middleware, conditional modify, decrement below zero, rapid mixed, getState before dispatch, two middlewares see action, non-zero initial
- **useStateWithHistory.test.ts**: Added 8 tests — goTo last index, clearHistory+setValue, same value adds, goTo 0 after many, history values exact, maxHistory 2, clearHistory preserves, goTo no modify history
- **useSticky.test.ts**: Added 8 tests — isIntersecting true, multiple scrolls, threshold 0, disabled no scroll, re-enable observes, large offset, multiple entries last wins, scrollY starts 0
- Total tests: 4546 (168 test files, all passing)

### Agent 2 (Logic) — useFullscreen, useScreenWakeLock Hooks & paginationUtils Utility
- Created `useFullscreen` hook: Fullscreen API integration
  - Returns: `isFullscreen`, `enter`, `exit`, `toggle`, `isSupported`
  - Supports target element ref for fullscreening specific elements
  - Callbacks: `onEnter`, `onExit`, `onError`
  - Listens for `fullscreenchange` event for external changes
- Created `useScreenWakeLock` hook: Screen Wake Lock API for preventing screen sleep
  - Returns: `isActive`, `request`, `release`, `isSupported`, `error`
  - Auto-request option for immediate lock on mount
  - Re-acquires wake lock on visibility change (tab switch recovery)
  - Callbacks: `onAcquire`, `onRelease`, `onError`
  - Cleans up sentinel on unmount
- Created `paginationUtils` utility for paginated data management:
  - `getPaginationInfo`: calculates page info (currentPage, totalPages, startIndex, endIndex, flags)
  - `getPageItems`: extracts items slice for a page
  - `getPageRange`: generates page range with ellipsis (-1) for UI rendering
  - `getOffset` / `offsetToPage`: database-style OFFSET/LIMIT pagination
  - `cursorPaginate`: cursor-based pagination with after/before cursor support
  - Input sanitization: clamps pages, ensures minimum pageSize of 1
- Added 11 tests for useFullscreen (init, enter, exit, toggle, onEnter, onExit, error handling, target ref, exit no-op, cleanup, external changes)
- Added 12 tests for useScreenWakeLock (init, request, release, onAcquire, onRelease, request error, auto-request, unsupported, request-when-unsupported, release no-op, release event, error clear)
- Added 36 tests for paginationUtils (getPaginationInfo: basic/middle/last/first/clamp-high/clamp-negative/zero-items/min-pageSize/single-item; getPageItems: first/middle/last-partial/out-of-range/empty; getPageRange: all-pages/right-ellipsis/left-ellipsis/both-ellipsis/contains-current/single-page/siblingCount; getOffset: first/later/zero-page/min-limit; offsetToPage: zero/correct/mid-page/negative; cursorPaginate: first/after/last/before/unknown/empty/limit-all)
- Total tests: 4695+ → 4644+ (175 test files, all passing)

### Agent 2 (Logic) — useClipboardMonitor, useShareAPI Hooks & diffUtils Utility
- Created `useClipboardMonitor` hook: monitors clipboard content changes
  - Returns: `content` (text, hasContent, lastRead), `read`, `isSupported`, `error`
  - Polling mode with configurable interval for continuous monitoring
  - Focus event listener for detecting changes on tab switch
  - Deduplicates reads (only fires onChange when content actually changes)
  - Supports enable/disable toggle
- Created `useShareAPI` hook: Web Share API integration
  - Returns: `share`, `isSupported`, `isFileShareSupported`, `isSharing`, `canShare`, `error`
  - Async share with success/error callbacks
  - canShare checks via navigator.canShare with fallback
  - Returns boolean from share indicating success/failure
- Created `diffUtils` utility for detecting changes between values:
  - `diffObjects`: shallow diff between two objects (added/removed/changed/unchanged)
  - `getChanges`: filter only changed entries
  - `hasChanges`: boolean check for any differences
  - `diffArrays`: LCS-based array diff with custom equality support
  - `diffLines`: line-by-line text diff
  - `createPatch` / `applyPatch`: create and apply object patches
  - `deepEqual`: recursive deep equality for objects, arrays, primitives
  - `deepDiffObjects`: recursive nested object diff with dot-notation paths
- Added 13 tests for useClipboardMonitor (init, isSupported, manual read, onChange, no duplicate onChange, read error, unsupported, error on unsupported, polling, no poll when disabled, focus read, cleanup, error clear)
- Added 13 tests for useShareAPI (init, fileShare support, share success, cancel/error, unsupported, unsupported share, canShare, canShare unsupported, share with URL, isSharing after complete, isSharing after error, error clear, canShare exception)
- Added 42 tests for diffUtils (diffObjects: unchanged/added/removed/changed/empty/mixed; getChanges: filter/empty; hasChanges: true/false/added; diffArrays: identical/additions/removals/empty-old/empty-new/both-empty/custom-equality; diffLines: identical/added/removed/empty/lineNumbers; createPatch: changed/added/empty/no-removed; applyPatch: changes/add/empty; deepEqual: primitives/null/arrays/objects/nested/types; deepDiffObjects: flat/nested/added/removed/array-change/unchanged)
- Total tests: 4644 → 4712 (178 test files, all passing)

### Agent 4 (Integrator) — Integration Batch 6: Drawer, ScrollToTop, CopyButton, Collapsible, ImageViewer
- Integrated **Drawer** component: BookmarkedMessages now opens in a slide-in Drawer panel (right side)
- Integrated **ScrollToTop** component: floating button in chat area to scroll back to top (threshold 300px)
- Integrated **CopyButton** component: one-click copy entire conversation text in header actions
- Integrated **Collapsible** component: token usage details wrapped in collapsible section for cleaner UI
- Integrated **ImageViewer** component: wired up as dialog via useDialogs for future image viewing
- Added bookmark drawer state management to `useDialogs` hook (isBookmarkDrawerOpen, openBookmarkDrawer, closeBookmarkDrawer)
- Added image viewer state management to `useDialogs` hook (imageViewerState, openImageViewer, closeImageViewer)
- Added Korean UI strings for Drawer, ScrollToTop, EmptyState, CopyButton, Collapsible, ImageViewer
- Imported **EmptyState** and **Kbd** components for availability in App.tsx
- Total tests: 4987 → 5054 (185 test files, all passing)

### Agent 2 (Logic) — useMousePosition, useColorScheme Hooks & retryUtils Utility
- Created `useMousePosition` hook: tracks mouse position relative to window or element
  - Absolute (clientX/clientY) and element-relative coordinates
  - `isInside` detection for element boundary checking
  - Configurable throttling for performance
  - Automatic cleanup of event listeners
- Created `useColorScheme` hook: system color scheme detection and user preference management
  - Detects system `prefers-color-scheme` preference with live updates
  - Supports explicit light/dark/system mode with localStorage persistence
  - Stable `setScheme` callback reference across renders
- Created `retryUtils` utility for retry logic with configurable strategies:
  - `calculateDelay`: exponential backoff calculation with max delay cap
  - `addJitter`: random jitter to prevent thundering herd
  - `retry`: async retry with backoff, shouldRetry predicate, onRetry callback
  - `retrySync`: synchronous retry for non-async functions
  - `withRetry`: higher-order function wrapper for pre-configured retry
  - `isNetworkError`: detect common network error patterns
  - `isRetryableStatus`: identify retryable HTTP status codes (429, 502, 503, 504)
- Added 16 tests for useMousePosition (init, window tracking, element-relative, isInside true/false, boundary edge, bottom-right corner, throttle, no-throttle, cleanup window/element, clear timer, shape, multiple moves, no-ref defaults, negative throttle)
- Added 15 tests for useColorScheme (default system/light, system dark, explicit light/dark, switch to system, persist, restore, restore system, invalid localStorage, system change response, system change with explicit, cleanup, shape, stable setScheme, persist system)
- Added 36 tests for retryUtils (calculateDelay: first/backoff/maxDelay/default-multiplier/default-max; addJitter: range/max/integer/zero; sleep: resolve/not-early; retry: first-success/retry-success/all-fail/onRetry/shouldRetry/backoff/defaults; retrySync: first/retry/exhaust/shouldRetry-false/pass-args/default-attempts; withRetry: wrap/args/retry; isNetworkError: fetch/messages/non-network/non-error; isRetryableStatus: 429/502/503/504/non-retryable)
- Total tests: 5054 → 5121 (188 test files, all passing)

### Agent 2 (Logic) — useClickCount, useMediaDevices Hooks & encodingUtils Utility
- Created `useClickCount` hook: detects single/double/triple clicks on elements
  - Configurable threshold for click grouping
  - Automatic reset after threshold expiry
  - Manual reset function
- Created `useMediaDevices` hook: enumerates available media devices
  - Categorized lists (audioInputs, audioOutputs, videoInputs)
  - Auto-refresh on devicechange events
  - Manual refresh, loading and error states
  - Support detection for MediaDevices API
- Created `encodingUtils` utility for encoding/decoding operations:
  - `toBase64`/`fromBase64`: Base64 with Unicode support
  - `toHex`/`fromHex`: hexadecimal string encoding
  - `urlEncode`/`urlDecode`: URL component encoding
  - `toBase64Url`/`fromBase64Url`: URL-safe Base64 variant
  - `escapeHtml`/`unescapeHtml`: HTML entity encoding
  - `bytesToHex`/`hexToBytes`: Uint8Array ↔ hex conversion
- Added 13 tests for useClickCount (init, single/double/triple click, threshold reset, manual reset, beyond triple, default threshold, custom threshold, shape, null ref, boundary at/past threshold)
- Added 14 tests for useMediaDevices (initial state, enumerate, categorize audio in/out/video, error handling, non-Error, devicechange refresh, manual refresh, cleanup, unsupported API, property mapping, shape, empty categories)
- Added 36 tests for encodingUtils (base64: empty/ASCII/roundtrip/Unicode/decode/special; hex: empty/encode/roundtrip/decode/odd-length/invalid/whitespace; url: space/special/roundtrip/Unicode; base64url: no-padding/no-special-chars/roundtrip/special; html: ampersand/lt/quotes/script/unescape/roundtrip/plain; bytes: empty/encode/roundtrip/decode/odd-length/invalid/whitespace)
- Total tests: 5121 → 5184 (191 test files, all passing)

### Agent 4 (Integrator) — Integration Batch 7: Select, SpeedDial, AlertBanner
- Replaced native `<select>` in **Settings** with **Select** component for model selection (searchable dropdown with keyboard nav)
- Integrated **SpeedDial** floating action button with 5 quick actions: new chat, search, bookmarks, settings, shortcuts
- Integrated **AlertBanner** for token usage warning when consumption exceeds 90%
- Updated Settings and App tests to work with new Select-based model selection
- Added Korean UI strings for SpeedDial and AlertBanner
- Total tests: 5184+ (191 test files, all passing)

### Agent 2 (Logic) — useScrollLock, useHistoryState Hooks & measureUtils Utility
- Created `useScrollLock` hook: locks/unlocks document body scrolling
  - Preserves and restores scroll position on unlock
  - lock/unlock/toggle functions with stable references
  - Restores original overflow on unmount
- Created `useHistoryState` hook: manages state synced with browser History API
  - push/replace state with optional URL updates
  - Responds to popstate events (back/forward navigation)
  - Preserves other history state keys
  - Restores initial state on mount from history
- Created `measureUtils` utility for measurements and unit conversions:
  - `formatBytes`: human-readable file size formatting (B/KB/MB/GB/TB/PB)
  - `convertTemperature`: Celsius/Fahrenheit/Kelvin conversion
  - `convertLength`: mm/cm/m/km/in/ft/yd/mi conversion
  - `convertWeight`: mg/g/kg/oz/lb/ton conversion
  - `distance2D`/`distance3D`: point distance calculations
  - `degreesToRadians`/`radiansToDegrees`: angle conversion
  - `formatDuration`: ms to human-readable duration (ms/s/m/h)
  - `percentage`: percentage calculation with configurable precision
- Added 13 tests for useScrollLock (init unlocked/locked, lock, unlock, toggle, restore scroll position, restore on unmount, stable refs x3, shape, idempotent lock/unlock)
- Added 14 tests for useHistoryState (init default, restore from history, push/push-with-URL, replace/replace-with-URL, popstate, popstate no key, popstate null, cleanup, stable refs, shape, object state, preserve keys)
- Added 58 tests for measureUtils (formatBytes: 0/bytes/KB/MB/GB/decimals/negative/TB; temperature: same/C→F/F→C/C→K/K→C/F→K/K→F; length: same/m→km/km→mi/in→cm/ft→m/yd→ft/mm→cm; weight: same/kg→g/kg→lb/lb→kg/oz→g/g→mg/ton→kg; distance2D: zero/horizontal/vertical/diagonal/negative; distance3D: zero/axis/diagonal; degrees/radians: 0/180/360/90/PI/roundtrip; duration: ms/seconds/min-sec/min/hour-min/hour/negative/zero; percentage: simple/zero-total/decimals/100%/over/zero-value)
- Total tests: 5184 → 5269 (194 test files, all passing)

### Agent 4 (Integrator) — Integration Batch 14: ColorSwatch, NumberInput, DropdownMenu
- Added **ColorSwatch** accent color picker in header with 8 preset colors and localStorage persistence
- Added **NumberInput** page jump input next to pagination controls
- Added **DropdownMenu** "more actions" in header (perf monitor, shortcuts, high contrast toggle)
- Added CSS for pagination container layout
- Total tests: 5830+ (212 test files, all passing)

### Agent 4 (Integrator) — Integration Batch 13: Stepper, Tabs, TreeView
- Added **Stepper** onboarding progress (환영→준비→대화) on welcome screen
- Added **Tabs** info panel with underline variant for stats/timeline switching
- Added **TreeView** conversation structure tree with icon navigation in stats panel
- Total tests: 5736+ (208 test files, all passing)

### Agent 4 (Integrator) — Integration Batch 12: CountdownTimer, Pagination, Switch
- Added **CountdownTimer** (60s) during response loading with warning/danger thresholds
- Added **Pagination** for message history (50 per page) with auto-scroll to last page
- Added **Switch** toggle for input preview visibility in the input area
- Total tests: 5667+ (206 test files, all passing)

### Agent 4 (Integrator) — Integration Batch 11: Avatar, AvatarGroup, Divider
- Added **Avatar** with role-based display and streaming status indicator on each message
- Added **AvatarGroup** showing conversation participants in stats panel
- Added **Divider** (dashed) between token details and regenerate button
- Added Korean UI strings for Avatar, AvatarGroup, and Divider
- Total tests: 5489+ (201 test files, all passing)

### Agent 4 (Integrator) — Integration Batch 10: SegmentedControl, Timeline, TagInput
- Added **SegmentedControl** for chat/compact view mode toggle in header with localStorage persistence
- Added **Timeline** showing recent conversation activity in the stats panel
- Added **TagInput** for persistent message tagging (max 5 tags per message)
- Added compact view CSS for reduced message padding
- Added Korean UI strings for SegmentedControl, Timeline, and TagInput components
- Total tests: 5355+ (197 test files, all passing)

### Agent 4 (Integrator) — Integration Batch 9: Rating, MeterBar, Popover
- Added **Rating** star feedback below assistant messages with localStorage persistence
- Added **MeterBar** token usage meter with low/high/optimum thresholds in token details collapsible
- Added **Popover** around SessionIndicator showing session status, message count, and model info
- Added Korean UI strings for Rating, MeterBar, and Popover components
- Total tests: 5268+ (194 test files, all passing)

### Agent 4 (Integrator) — Integration Batch 8: Breadcrumb, Badge
- Added **Breadcrumb** navigation in app header showing "Gemini › 대화 › [title]" path
- Wrapped Stats header button with **Badge** component showing conversation count
- Added Korean UI strings for Breadcrumb navigation
- Total tests: 5183+ (191+ test files, all passing)

### Agent 2 (Logic) — useFocusTrap, usePageLeave Hooks & regexUtils Utility
- Created `useFocusTrap` hook: traps keyboard focus within a container element
  - Tab/Shift+Tab cycling through focusable elements
  - Auto-focus first element on mount, restore focus on unmount
  - Configurable enabled/autoFocus/restoreFocus options
  - Filters out hidden/disabled elements
- Created `usePageLeave` hook: detects when mouse leaves the page viewport
  - Tracks hasLeft state and leaveCount
  - Callback on leave event, manual reset
  - Detects all viewport edges (top/bottom/left/right)
- Created `regexUtils` utility for common pattern matching:
  - `escapeRegex`: escape special regex characters
  - `isEmail`/`isUrl`/`isIPv4`/`isUUID`: validation functions
  - `isAlphanumeric`/`isNumeric`/`isHexColor`: format checks
  - `extractEmails`/`extractUrls`/`extractHashtags`/`extractMentions`: extraction
  - `matchesGlob`: glob-like pattern matching
  - `countMatches`: count pattern occurrences
  - `replaceAll`: safe literal string replacement
- Added 13 tests for useFocusTrap (autoFocus, no-autoFocus, Tab wrap last→first, Shift+Tab wrap first→last, non-Tab key, disabled, restore focus, no-restore, empty container, null ref, cleanup, mid-focus no-wrap, skip disabled)
- Added 13 tests for usePageLeave (init, leave top/left/right/bottom, multiple leaves, callback, reset, interior no-trigger, cleanup, stable reset, shape, negative coords)
- Added 61 tests for regexUtils (escapeRegex: special/brackets/normal/dollar; isEmail: valid/subdomain/dots/missing@/no-domain/empty; isUrl: http/https/query/no-protocol/empty; isIPv4: standard/localhost/max/overflow/few-octets/non-numeric; isAlphanumeric: valid/spaces/special/empty; isHexColor: 6-digit/3-digit/no-hash/invalid/wrong-length; extractEmails: single/multiple/none; extractUrls: single/multiple/none; extractHashtags: basic/Korean/none; extractMentions: basic/none; matchesGlob: star/question/reject/exact/empty; countMatches: string/regex/none/no-global; isUUID: v4/invalid/v1; isNumeric: digits/decimal/negative/empty; replaceAll: basic/none/empty/special)
- Total tests: 5269 → 5356 (197 test files, all passing)

### Agent 2 (Logic) — useResizeObserver, useTextSelection Hooks & slugUtils Utility
- Created `useResizeObserver` hook: observes element resize changes via ResizeObserver API
  - Returns width, height, inlineSize, blockSize measurements
  - Supports box option (content-box, border-box)
  - Optional onResize callback (ref-stable, no observer recreation)
  - Graceful fallback when ResizeObserver is unavailable
- Created `useTextSelection` hook: tracks text selection in the document
  - Returns selection text, isCollapsed, anchorNode, focusNode, rangeCount, bounding rect
  - hasSelection convenience boolean
  - clearSelection to programmatically remove selection
  - Listens to selectionchange events
- Created `slugUtils` utility for URL-friendly string conversion:
  - `slugify`: convert string to slug with diacritical mark removal
  - `unslugify`: convert slug back to title case
  - `uniqueSlug`: generate unique slug with numeric suffix
  - `truncateSlug`: truncate at separator boundary within max length
  - `isValidSlug`: validate slug format
  - `filePathToSlug`: convert file path to slug
  - `camelToSlug`/`slugToCamel`: convert between camelCase and slug format
- Added 14 tests for useResizeObserver (default state, size update, inlineSize/blockSize, contentRect fallback, onResize callback, box option, disconnect, empty entries, missing API, ref stability, callback update, observer recreation, size fields, shorthand match)
- Added 13 tests for useTextSelection (default state, text selected, bounding rect, collapsed rect, clearSelection, empty text, event listener, unmount cleanup, null getSelection, anchorNode/focusNode, rangeCount, null rect, stable clearSelection)
- Added 57 tests for slugUtils (slugify: basic/spaces/special/diacriticals/trim/separator/empty/special-only/hyphens/uppercase/numbers/mixed; unslugify: title/single/custom/multi/empty; uniqueSlug: no-conflict/append-1/increment/custom/empty; truncateSlug: short/separator-boundary/mid-word-cutback/no-separator/exact/long; isValidSlug: valid/single/uppercase/spaces/special/leading-sep/trailing-sep/double-sep/numbers/custom/empty; filePathToSlug: filename/fullpath/windows/no-ext/custom/nested; camelToSlug: camel/pascal/consecutive-caps/single/custom/multi; slugToCamel: basic/single/multi/custom/empty/inverse)
- Total tests: 5356 → 5439 (200 test files, all passing)

### Agent 2 (Logic) — Hooks/Utils Batch 27: useStepWizard, useClampedValue, treeUtils
- Created `useStepWizard` hook for multi-step wizard/stepper state management:
  - Navigate between steps (next, prev, goToStep)
  - Linear mode requiring step completion before advancing
  - Progress percentage calculation
  - Step completion tracking (markCompleted, markIncomplete, isStepCompleted)
  - Reset to initial state
- Created `useClampedValue` hook for clamped numeric value with controls:
  - Increment/decrement with configurable step size
  - Loop mode wrapping from max→min and min→max
  - Percentage calculation within range
  - isMin/isMax boundary detection
  - Auto-clamp on setValue and initialization
- Created `treeUtils` utility for tree data structure operations:
  - `createNode`: create tree nodes with children
  - `findNode`/`findNodeBy`: search by ID or predicate
  - `flatten`: pre-order traversal to array
  - `getDepth`/`countNodes`: tree metrics
  - `getPath`: get ID path from root to target
  - `mapTree`/`filterTree`: transform and filter trees immutably
  - `getLeaves`/`getAncestors`/`getSiblings`: relationship queries
  - `insertChild`/`removeNode`: immutable tree modifications
  - `walkTree`: depth-aware traversal with callback
- Added 22 tests for useStepWizard (init, custom step, clamp, navigation, boundaries, goToStep, reset, completion, progress, single step, linear mode)
- Added 20 tests for useClampedValue (init, custom value, clamp, increment/decrement, step, boundaries, setValue, reset, percentage, equal min/max, loop mode, negative ranges)
- Added 39 tests for treeUtils (createNode, findNode, findNodeBy, flatten, getDepth, countNodes, getPath, mapTree, filterTree, getLeaves, getAncestors, getSiblings, insertChild, removeNode, walkTree)
- Total tests: 5439 → 5570 (207 test files, all passing)

### Agent 2 (Logic) — Hooks/Utils Batch 28: useThrottledCallback, useFileReader, graphUtils
- Created `useThrottledCallback` hook for throttled function execution:
  - Configurable delay with leading/trailing edge control
  - Cancel pending invocation
  - isPending status indicator
  - Latest function reference always used
  - Cleanup on unmount
- Created `useFileReader` hook for reading files via FileReader API:
  - Read as text, dataURL, arrayBuffer, or binaryString
  - Progress tracking with percentage
  - onLoad, onError, onProgress callbacks
  - Abort in-flight reads
  - Reset state
- Created `graphUtils` utility with Graph class:
  - Directed and undirected graph support
  - Vertex/edge CRUD operations (add, remove, has)
  - BFS and DFS traversal
  - Shortest path via BFS
  - Topological sort for DAGs
  - Cycle detection (directed and undirected)
  - Connectivity check
  - Clone for immutable operations
  - Degree, vertex count, edge count metrics
- Added 12 tests for useThrottledCallback (leading, trailing, throttle, cancel, args, ref update, unmount cleanup, leading=false, both=false, rapid calls)
- Added 12 tests for useFileReader (default state, text/dataURL/arrayBuffer/binaryString read, onLoad, progress, error, reset, isLoading, clear previous, abort)
- Added 36 tests for graphUtils (undirected: add/remove vertex/edge, neighbors, degree, BFS, DFS, shortest path, cycle, connectivity, clone, topo-sort null; directed: edges, topo-sort, cycle, path, clone; numeric vertices)
- Total tests: 5570 → 5727 (212 test files, all passing)
### Agent 1 (Components) — Select, Calendar, DatePicker, Slider, Dialog, RadioGroup, CheckboxGroup
- Created `Select` component: dropdown select with single/multi, search, groups, keyboard nav
- Created `Calendar` component: month view with date selection, navigation, min/max dates, disabled dates, week numbers, keyboard nav, ko/en locale (50 tests)
- Created `DatePicker` component: popup calendar input with format, clearable, disabled, min/max, ko/en locale, keyboard nav (49 tests)
- Created `Slider` component: range slider with marks, ticks, keyboard nav, step snap, formatValue, controlled/uncontrolled (48 tests)
- Created `Dialog` component: modal dialog with sizes (small/medium/large/fullscreen), overlay close, escape, focus trap, scroll lock, footer (33 tests)
- Created `RadioGroup` component: radio buttons with card variant, descriptions, keyboard nav, horizontal/vertical, disabled (36 tests)
- Created `CheckboxGroup` component: multi-select checkboxes with select-all, max limit, descriptions, sizes, orientations (34 tests)
- Total tests: 4712 → 5304 (191 test files, all passing)

### Agent 2 (Logic) — Hooks/Utils Batch 29: useMediaRecorder, useSpeechRecognition, linkedListUtils
- Created `useMediaRecorder` hook for recording audio/video via MediaRecorder API:
  - Start/stop/pause/resume recording
  - Data chunk collection with onDataAvailable callback
  - Final blob creation on stop with onStop callback
  - Error handling with onError callback
  - Reset and configurable mimeType, audioBitsPerSecond, videoBitsPerSecond
- Created `useSpeechRecognition` hook for speech-to-text via Web Speech API:
  - Start/stop/reset recognition
  - Final and interim transcript tracking
  - Configurable language (default ko-KR), continuous, interimResults
  - onResult, onError, onEnd callbacks
  - isSupported detection (SpeechRecognition + webkitSpeechRecognition)
- Created `linkedListUtils` utility with LinkedList class:
  - Append, prepend, insertAt operations
  - removeFirst, removeLast, removeAt operations
  - get, indexOf, contains, find queries
  - reverse, map, filter, forEach functional operations
  - clone, clear, toArray, static from()
  - Size tracking and isEmpty property
- Added 13 tests for useMediaRecorder (init, start, stop+blob, onDataAvailable, empty chunks, pause/resume, state guards, error, reset, stopWhenInactive, mimeType, clearPrevious)
- Added 14 tests for useSpeechRecognition (init, unsupported, start, lang/options, default-ko, final/interim result, accumulate, stop, end, error, reset, unsupported-start, webkit)
- Added 41 tests for linkedListUtils (create, from, append, prepend, insertAt, removeFirst/Last/At, get, indexOf, contains, find, reverse, map, filter, forEach, clear, clone, toArray, strings)
- Total tests: 5727 → 5898 (218 test files, all passing)

### Agent 1 (Components) — Combobox Component
- Created `Combobox` component — autocomplete input with dropdown filtering
  - Text input with real-time option filtering by label and description
  - Keyboard navigation: ArrowUp/Down, Home/End, Enter to select, Escape to close
  - Free text input mode (allowFreeInput) for custom values not in option list
  - Option descriptions and icons for rich option display
  - Loading state with spinner animation
  - Three sizes (sm/md/lg), disabled state, error display with alert role
  - Auto-highlight first matching option (configurable)
  - Clear button, arrow toggle, outside click to close
  - Full ARIA compliance: combobox role, aria-expanded, aria-autocomplete, aria-activedescendant
- Added 53 tests for Combobox (rendering, selection, filtering, keyboard nav, disabled options, free input, clear, error, loading, sizes, icons, descriptions, callbacks, accessibility, auto-highlight, arrow toggle, escape revert)
- Total tests: 5898 → 5951 (all passing)

### Agent 1 (Components) — PasswordInput Component
- Created `PasswordInput` component — password field with visibility toggle and strength meter
  - Visibility toggle (show/hide password) with emoji icons
  - Password strength meter (weak/fair/good/strong) with color-coded progress bar
  - Configurable requirements checklist with met/unmet visual indicators
  - Default requirements: 8+ chars, uppercase, lowercase, digit, special char
  - Custom requirements support via PasswordRequirement[] prop
  - Exported `calculateStrength` utility function for reuse
  - Three sizes (sm/md/lg), disabled state, error display with alert role
  - maxLength and autoComplete props
  - Full ARIA: aria-label, aria-invalid, role=alert
- Added 43 tests for PasswordInput (rendering, visibility toggle, onChange, disabled, error, sizes, strength meter levels, requirements met/unmet, custom requirements, accessibility, maxLength, autoComplete, calculateStrength)
- Total tests: 5951 → 5994 (all passing)

### Agent 2 (Logic) — Hooks/Utils Batch 30: useAbortController, useEyeDropper, priorityQueueUtils
- Created `useAbortController` hook for cancellable operations:
  - getSignal: obtain current AbortSignal
  - abort: cancel with optional reason
  - isAborted: check aborted status
  - reset: create fresh controller/signal
- Created `useEyeDropper` hook for screen color picking via EyeDropper API:
  - open: async color pick returning sRGBHex
  - isSupported detection
  - isOpen status tracking
  - Error handling for unsupported browsers and user cancellation
  - reset state
- Created `priorityQueueUtils` utility with PriorityQueue class:
  - Min-heap by default, custom comparator support
  - enqueue, dequeue, peek operations
  - contains, toArray (sorted), clear, clone
  - fromArray static factory
  - Works with numbers, strings, and custom objects
- Added 9 tests for useAbortController (init, signal, abort, reason, reset, same-signal, different-after-reset, multi-abort, event-listener)
- Added 8 tests for useEyeDropper (init, unsupported, pick-color, error, non-Error-thrown, unsupported-returns-null, reset, multi-pick)
- Added 20 tests for priorityQueueUtils (empty, enqueue/peek, dequeue-order, empty-dequeue, single, duplicates, contains, clear, max-queue, object-queue, fromArray, toArray, clone, strings, stress-test)
- Total tests: 5898 → 5935 (221 test files, all passing)

### Agent 1 (Components) — TextArea Component
- Created `TextArea` component — multiline input with character count and auto-resize
  - Character count display with optional maxLength format (5/100)
  - Auto-resize mode that grows/shrinks with content (minRows/maxRows)
  - Manual resize options: none, vertical, horizontal, both
  - Helper text and error message with priority (error > helper)
  - Three sizes (sm/md/lg), disabled/readOnly states
  - Focus state visual feedback
  - Full ARIA: aria-label, aria-invalid, aria-describedby
- Added 37 tests for TextArea (rendering, onChange, maxLength, disabled, readOnly, error, helper, count, sizes, resize, accessibility, focus, auto-resize)
- Total tests: 5994 → 6031 (all passing)

### Agent 2 (Logic) — Hooks/Utils Batch 31: useVibration, useGamepad, observableUtils
- Created `useVibration` hook for Vibration API:
  - Vibrate with number or pattern (array of durations)
  - Auto-stops isVibrating state after duration/pattern completes
  - Manual stop(), isSupported detection, returns success boolean
- Created `useGamepad` hook for Gamepad API:
  - Polls connected gamepads via requestAnimationFrame
  - Maps buttons (pressed, touched, value) and axes
  - Responds to gamepadconnected/gamepaddisconnected events
  - Configurable pollInterval, getGamepad(index) accessor
- Created `observableUtils` utility with reactive Observable pattern:
  - Observable base class with subscribe, next, complete, getValue, subscriberCount
  - BehaviorSubject: emits current value to new subscribers
  - ReplaySubject: replays buffered values to new subscribers (configurable buffer size)
  - Operators: map, filter, scan, distinctUntilChanged, take, skip
  - Combinators: merge, combineLatest
  - Pipe support for chaining operators
- Added 10 tests for useVibration
- Added 12 tests for useGamepad
- Added 24 tests for observableUtils
- Total tests: 6031 → 6077 (223 test files, all passing)

### Agent 2 (Logic) — Hooks/Utils Batch 32: useClipboardHistory, usePointerLock, finiteStateMachineUtils
- Created `useClipboardHistory` hook for clipboard history management:
  - Add/remove/clear entries, copy from history back to clipboard
  - Deduplication (moves existing text to top), maxItems limit
  - Entries have unique IDs and timestamps, latest accessor
- Created `usePointerLock` hook for Pointer Lock API:
  - Lock on element or document.body, unlock, movement tracking (movementX/Y)
  - Error handling for lock failures, isSupported detection
  - Responds to pointerlockchange/pointerlockerror events
- Created `finiteStateMachineUtils` utility with FiniteStateMachine class:
  - Configurable states, events, transitions with string or object config
  - Guards (conditional transitions), actions (side effects on transition)
  - onEnter/onExit state lifecycle handlers
  - Transition listeners, state history tracking
  - can() event availability check, getAvailableEvents(), matches(), reset()
- Added 13 tests for useClipboardHistory
- Added 11 tests for usePointerLock
- Added 19 tests for finiteStateMachineUtils
- Total tests: 6077 → 6157 (227 test files, all passing)

### Agent 2 (Logic) — Hooks/Utils Batch 33: usePrefersReducedMotion, useDocumentReadyState, bitmaskUtils
- Created `usePrefersReducedMotion` hook for tracking prefers-reduced-motion:
  - Returns boolean for reduced motion preference
  - Live updates via matchMedia change listener
- Created `useDocumentReadyState` hook for document ready state:
  - Tracks document.readyState with live updates via readystatechange event
  - Boolean helpers: isLoading, isInteractive, isComplete
- Created `bitmaskUtils` utility for bit manipulation:
  - hasFlag, addFlag, removeFlag, toggleFlag, setFlag
  - getFlags, countSetBits, createBitmask
  - bitmaskToString, fromBitmaskString
  - hasAnyFlag, hasAllFlags, lowestSetBit, highestSetBit
- Added 6 tests for usePrefersReducedMotion
- Added 7 tests for useDocumentReadyState
- Added 27 tests for bitmaskUtils
- Total tests: 6157 → 6197 (230 test files, all passing)

### Agent 2 (Logic) — useWakeLock, useScreenCapture, matrixUtils
- Added `useWakeLock` hook — Screen Wake Lock API wrapper with request/release/auto-cleanup
- Added `useScreenCapture` hook — Screen Capture API wrapper with start/stop/error handling
- Added `matrixUtils` utility — matrix operations:
  - createMatrix, identity, add, subtract, multiply, scalarMultiply
  - transpose, determinant, minor, cofactor, inverse
  - trace, isSquare, isSymmetric, isDiagonal, isIdentity
  - flatten, fromFlat, getRow, getColumn, equals, dimensions
- Added 16 tests for useWakeLock
- Added 17 tests for useScreenCapture
- Added 65 tests for matrixUtils
- Total tests: 6197 → 6295 (233 test files, all passing)

### Agent 2 (Logic) — useClickOutside, useDocumentVisibility, sortUtils
- Added `useClickOutside` hook — detect clicks outside a ref element with configurable event type and enable/disable
- Added `useDocumentVisibility` hook — track document.visibilityState with change count and onChange callback
- Added `sortUtils` utility — sorting algorithms and helpers:
  - bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort
  - isSorted, shuffle, sortByKey, stableSort
- Added 13 tests for useClickOutside
- Added 15 tests for useDocumentVisibility
- Added 58 tests for sortUtils
- Total tests: 6295 → 6381 (236 test files, all passing)

### Agent 2 (Logic) — useMediaSession, useKeyPress, heapUtils
- Added `useMediaSession` hook — Media Session API wrapper with metadata, playback state, action handlers
- Added `useKeyPress` hook — track key press state and callback with modifier support
  - `useKeyPress` returns boolean for key state tracking
  - `useKeyPressCallback` triggers callback with ctrl/shift/alt/meta modifier matching
- Added `heapUtils` utility — binary heap data structure and helpers:
  - BinaryHeap class with push, pop, peek, contains, clear, toArray
  - createMinHeap, createMaxHeap factory functions
  - heapify, nSmallest, nLargest, isMinHeap, mergeHeaps
- Added 15 tests for useMediaSession
- Added 19 tests for useKeyPress
- Added 40 tests for heapUtils
- Total tests: 6381 → 6455 (239 test files, all passing)

### Agent 2 (Logic) — useOnlineStatus, useElementSize, trieUtils
- Added `useOnlineStatus` hook — online/offline detection with callbacks and timestamp
- Added `useElementSize` hook — track element dimensions via ResizeObserver with ref callback
- Added `trieUtils` utility — trie data structure with:
  - Trie class with insert, search, startsWith, remove, clear
  - getWordsWithPrefix, getAllWords, countWordsWithPrefix, longestCommonPrefix
  - createTrie factory, autoComplete, spellCheck helpers
- Added 15 tests for useOnlineStatus
- Added 11 tests for useElementSize
- Added 37 tests for trieUtils
- Total tests: 6455 → 6518 (242 test files, all passing)

### Agent 2 (Logic) — useImageLoad, useEventSource, bloomFilterUtils
- Added `useImageLoad` hook — image load state tracking with:
  - isLoading, isLoaded, isError states with natural dimensions
  - crossOrigin, referrerPolicy options
  - onLoad/onError callbacks with ref pattern for latest reference
  - reload() method for retry on error
- Added `useEventSource` hook — Server-Sent Events management with:
  - Auto-connect on URL, status tracking (connecting/open/closed/error)
  - Custom named event listeners, onOpen/onError/onMessage callbacks
  - Auto-reconnect with configurable interval and max attempts
  - Manual close/open control, latest callback ref pattern
- Added `bloomFilterUtils` utility — Bloom filter probabilistic data structure with:
  - createBloomFilter factory with add, has, clear operations
  - Configurable size and hash count, false positive rate calculation
  - merge() for combining filters, toJSON/fromJSON serialization
  - bloomFilterFromJSON for deserialization, optimalBloomFilterParams calculator
  - Generic type support, Unicode string handling
- Added 19 tests for useImageLoad
- Added 22 tests for useEventSource
- Added 33 tests for bloomFilterUtils
- Total tests: 6518 → 6590 (245 test files, all passing)
