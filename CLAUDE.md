# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing two related projects:

1. **gemini-cli**: A clone of the official Gemini CLI (https://github.com/google-gemini/gemini-cli) - an AI agent that provides terminal access to Google's Gemini models
2. **gemini-gui**: An Electron-based desktop GUI wrapper around the Gemini CLI, providing a user-friendly chat interface

The GUI app wraps the CLI by spawning it as a child process and communicating via IPC, parsing its `stream-json` output format to provide real-time streaming responses in a desktop application.

## Common Development Commands

### Gemini CLI (gemini-cli/)

```bash
# Build the CLI
npm run build

# Run all quality checks (build, test, typecheck, lint)
npm run preflight

# Run tests
npm test

# Run the CLI
node bundle/gemini.js
```

### Gemini GUI (gemini-gui/)

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Run in development mode
npm run dev

# Create Windows installer
npm run dist
```

## Architecture

### Gemini CLI Integration

The GUI app integrates with Gemini CLI using a **CLI wrapper approach**:

- **Location**: `gemini-gui/src/main/index.ts`
- **CLI Path**: `../gemini-cli/bundle/gemini.js` (relative to main process)
- **Execution**: Spawns CLI as child process with `--output-format stream-json --yolo` flags
- **Communication**: Parses newline-delimited JSON from stdout in real-time
- **Key JSON types**:
  - `{"type":"init", "session_id":"..."}` - Session initialization
  - `{"type":"message", "role":"assistant", "content":"...", "delta":true}` - Streaming content
  - `{"type":"result", "status":"success"}` - Completion signal

### Electron Architecture

**Three-Process Model**:

1. **Main Process** (`src/main/index.ts`):
   - Manages Electron app lifecycle and windows
   - Spawns and manages Gemini CLI child process
   - Handles IPC communication with renderer
   - Manages temporary file storage for attachments
   - Key IPC handlers: `send-message`, `stop-gemini`, `save-temp-file`, `cleanup-temp-files`

2. **Preload Script** (`src/preload/index.ts`):
   - Provides secure IPC bridge using `contextBridge`
   - Exposes `window.electron` API to renderer
   - Maintains security through context isolation

3. **Renderer Process** (`src/renderer/`):
   - React-based UI with TypeScript
   - Components: App, Sidebar, Settings, FileAttachment
   - State management: React hooks (useState, useEffect, useRef)
   - Data persistence: localStorage for conversations and settings

### State Management

- **Conversations**: Stored in localStorage with unique timestamp-based IDs
- **Auto-title generation**: First user message (truncated to 50 chars)
- **Session tracking**: CLI session IDs captured for potential --resume functionality
- **Settings**: Model selection, temperature, max tokens persisted to localStorage

### Build System

- **Bundler**: esbuild for fast compilation
- **Build script**: `build.js` compiles three separate bundles (main, preload, renderer)
- **Output**: `dist/` directory with separate folders for each process
- **CSS**: Bundled inline via esbuild's CSS loader

## Important Implementation Details

### Process Lifecycle

**Current State** (as of latest code):
- Process is spawned per conversation session
- Uses stdin pipe for interactive communication
- Session resumption prepared but requires PTY (pseudo-terminal) for full functionality

**Known Limitation**:
- CLI may not support full interactive mode without TTY
- Future improvement: Use `node-pty` for true terminal emulation to support:
  - Slash commands (/help, /mcp, etc.)
  - MCP server management
  - Better context preservation

### Streaming Response Handling

Located in `src/main/index.ts`:
```typescript
// Buffer incomplete JSON lines
let processBuffer = '';
geminiProcess.stdout?.on('data', (data) => {
  processBuffer += data.toString();
  const lines = processBuffer.split('\n');
  processBuffer = lines.pop() || ''; // Keep incomplete line

  lines.forEach(line => {
    const json = JSON.parse(line);
    mainWindow?.webContents.send('stream-data', json);
  });
});
```

### File Attachment Flow

1. Renderer: User drags/drops file → calls `window.electron.saveTempFile(buffer, filename)`
2. Main: Saves to `%TEMP%/gemini-gui/` → returns absolute path
3. Renderer: Includes path in message sent to CLI
4. CLI: Reads file and processes with multimodal capabilities
5. Cleanup: Temporary files removed on app quit

## Code Style and Patterns

### React Components (from gemini-cli/GEMINI.md)

- **Functional components only** with hooks (no class components)
- **Pure render functions**: No side effects in component body
- **useEffect sparingly**: Only for synchronization with external state, never set state inside useEffect
- **Avoid premature optimization**: Don't use useMemo/useCallback/React.memo unless React Compiler isn't enabled
- **Event handlers over effects**: User interactions should trigger logic in handlers, not useEffect

### TypeScript

- **Prefer plain objects over classes** with interface/type definitions
- **Use `unknown` instead of `any`** for type-safe handling of uncertain types
- **Avoid type assertions** except when absolutely necessary
- **Module-based encapsulation**: Use import/export for public APIs, not class visibility modifiers
- **Exhaustive switch checking**: Use `checkExhaustive()` helper in default clause

### Testing (gemini-cli conventions)

- **Framework**: Vitest (`describe`, `it`, `expect`, `vi`)
- **Co-located tests**: `*.test.ts` files next to source files
- **Mock with `vi.mock()`**: Place at top of file for module-level mocks
- **Clean up**: `vi.resetAllMocks()` in beforeEach, `vi.restoreAllMocks()` in afterEach

### General Style

- Use **hyphens in flag names** (e.g., `--my-flag` not `--my_flag`)
- Write **high-value comments only**, avoid obvious/redundant comments
- Use **array operators** (.map, .filter, .reduce) for immutability and readability
- **One-way data flow**: Pass data via props, lift state to common parents

## Known Issues and TODOs

### Pending Improvements

From `REBOOT_TODO.md` and `PROGRESS_RESUME.md`:

1. **PTY Integration** (highest priority)
   - Install `node-pty` after system reboot
   - Replace stdin pipe with PTY for full terminal emulation
   - Enable slash commands and interactive features

2. **Process Management**
   - Pre-start CLI on app launch for faster first message
   - Auto-restart on errors
   - Proper cleanup on exit

3. **UI Enhancements**
   - Markdown rendering with code highlighting (react-markdown + react-syntax-highlighter)
   - Image preview for attachments
   - Conversation search
   - Export conversations (PDF, TXT, JSON)

4. **CLI Path Configuration**
   - Make CLI path configurable in settings
   - Auto-detection of installed CLI

### Current Limitations

- Hardcoded relative path to CLI: `../../../gemini-cli/bundle/gemini.js`
- No markdown rendering (plain text only)
- Requires Gemini CLI to be pre-authenticated
- Process spawned per session (slow first message)

## Security Considerations

- **Context isolation**: Enabled in BrowserWindow
- **Preload script**: Uses contextBridge for safe IPC
- **No node integration**: Renderer process has no direct Node.js access
- **Temporary files**: Stored in OS temp directory, cleaned up on exit
- **Local storage only**: All data stays on user's machine (no server)

## Build and Deployment

### Development Workflow

1. Make changes to source files
2. Run `npm run build` to compile with esbuild
3. Run `npm run dev` to test in Electron
4. For CLI changes: `cd gemini-cli && npm run preflight`

### Production Build

```bash
cd gemini-gui
npm run dist
```

Outputs Windows installer (.exe) to `release/` directory using electron-builder.

### Package Configuration

- **electron-builder** config in `package.json` under `"build"` key
- Bundles `dist/**/*` and `public/**/*`
- AppId: `com.gemini.gui`
- Target: NSIS installer for Windows

## Documentation Files

- **README_FIRST.txt**: Quick completion summary
- **WORK_SUMMARY.md**: Detailed development report (3 hours of work)
- **PROGRESS_RESUME.md**: Current state and next steps
- **REBOOT_TODO.md**: Post-reboot checklist for PTY integration
- **gemini-gui/README.md**: User-facing documentation
- **gemini-cli/README.md**: Official Gemini CLI documentation
