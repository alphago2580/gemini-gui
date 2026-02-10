import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { GeminiProcess } from './GeminiProcess';
import { loadWindowState, saveWindowState } from './windowState';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

const WINDOW_STATE_FILE = 'window-state.json';

function getWindowStatePath(): string {
  return path.join(app.getPath('userData'), WINDOW_STATE_FILE);
}

let mainWindow: BrowserWindow | null = null;
let gemini: GeminiProcess = new GeminiProcess();
let currentSessionId: string | null = null;

function saveCurrentWindowState(): void {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  saveWindowState(getWindowStatePath(), {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: mainWindow.isMaximized(),
  });
}

function createWindow() {
  const statePath = getWindowStatePath();
  const windowState = loadWindowState(statePath);

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Save window state on resize/move
  mainWindow.on('resize', () => {
    if (mainWindow && !mainWindow.isMaximized()) {
      saveCurrentWindowState();
    }
  });
  mainWindow.on('move', () => {
    if (mainWindow && !mainWindow.isMaximized()) {
      saveCurrentWindowState();
    }
  });
  mainWindow.on('maximize', () => {
    saveCurrentWindowState();
  });
  mainWindow.on('unmaximize', () => {
    saveCurrentWindowState();
  });

  // Load index.html
  mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    gemini.stop();
  });
}

function buildAppMenu(): void {
  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const },
      ],
    }] : []),
    {
      label: '파일',
      submenu: [
        {
          label: '새 대화',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu-action', 'new-chat'),
        },
        { type: 'separator' },
        {
          label: 'Markdown으로 내보내기',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => mainWindow?.webContents.send('menu-action', 'export-md'),
        },
        {
          label: 'PDF로 내보내기',
          click: () => mainWindow?.webContents.send('menu-action', 'export-pdf'),
        },
        { type: 'separator' },
        ...(isMac ? [] : [{ role: 'quit' as const, label: '종료' }]),
      ],
    },
    {
      label: '편집',
      submenu: [
        { role: 'undo', label: '실행 취소' },
        { role: 'redo', label: '다시 실행' },
        { type: 'separator' as const },
        { role: 'cut', label: '잘라내기' },
        { role: 'copy', label: '복사' },
        { role: 'paste', label: '붙여넣기' },
        { role: 'selectAll', label: '전체 선택' },
      ],
    },
    {
      label: '보기',
      submenu: [
        {
          label: '설정',
          accelerator: 'CmdOrCtrl+,',
          click: () => mainWindow?.webContents.send('menu-action', 'settings'),
        },
        {
          label: '명령 팔레트',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => mainWindow?.webContents.send('menu-action', 'command-palette'),
        },
        { type: 'separator' },
        {
          label: '사이드바 토글',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow?.webContents.send('menu-action', 'toggle-sidebar'),
        },
        { type: 'separator' },
        { role: 'reload', label: '새로고침' },
        { role: 'toggleDevTools', label: '개발자 도구' },
        { type: 'separator' },
        { role: 'resetZoom', label: '확대/축소 초기화' },
        { role: 'zoomIn', label: '확대' },
        { role: 'zoomOut', label: '축소' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '전체 화면' },
      ],
    },
    {
      label: '도움말',
      submenu: [
        {
          label: '키보드 단축키',
          accelerator: 'CmdOrCtrl+/',
          click: () => mainWindow?.webContents.send('menu-action', 'shortcut-help'),
        },
        { type: 'separator' },
        {
          label: 'Gemini CLI GitHub',
          click: () => shell.openExternal('https://github.com/anthropics/claude-code'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  buildAppMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function startGeminiProcess(systemPrompt?: string, model?: string) {
  const cliPath = process.env.GEMINI_CLI_PATH || path.join(__dirname, '../../../gemini-cli/bundle/gemini.js');
  const cliDir = process.env.GEMINI_CLI_PATH
    ? path.dirname(process.env.GEMINI_CLI_PATH)
    : path.join(__dirname, '../../../gemini-cli');

  gemini.removeAllListeners('json');
  gemini.on('json', (jsonData: Record<string, unknown>) => {
    console.log(`[JSON parsed] type: ${jsonData.type}, role: ${jsonData.role}`);

    if (jsonData.type === 'init' && jsonData.session_id) {
      currentSessionId = jsonData.session_id as string;
      console.log(`[Session] Session ID: ${currentSessionId}`);
    }

    if (jsonData.type) {
      mainWindow?.webContents.send('stream-data', jsonData);
    }

    if (jsonData.type === 'result') {
      mainWindow?.webContents.send('stream-complete', {
        code: 0,
        success: jsonData.status === 'success'
      });
    }
  });

  gemini.removeAllListeners('exit');
  gemini.on('exit', (code: number) => {
    console.log(`[Process] Gemini CLI closed with code: ${code}`);
    currentSessionId = null;
  });

  gemini.removeAllListeners('error');
  gemini.on('error', (error: Error) => {
    console.error(`[Process] Error:`, error);
  });

  gemini.start(cliPath, cliDir, undefined, systemPrompt, model);
}

ipcMain.handle('send-message', async (event, message: string, systemPrompt?: string, model?: string) => {
  return new Promise((resolve, reject) => {
    try {
      startGeminiProcess(systemPrompt, model);
      gemini.send(message);
      resolve({ success: true, output: '', error: null });
    } catch (error) {
      const errorMsg = `예외 발생: ${getErrorMessage(error)}`;
      reject({ success: false, output: '', error: errorMsg });
    }
  });
});

ipcMain.handle('stop-gemini', async () => {
  gemini.stop();
  return { success: true };
});

ipcMain.handle('new-conversation', async () => {
  console.log('[Session] Reset - starting new conversation');
  gemini.stop();
  currentSessionId = null;
  return { success: true };
});

ipcMain.handle('save-temp-file', async (event, fileName: string, fileData: ArrayBuffer) => {
  try {
    const tempDir = path.join(os.tmpdir(), 'gemini-gui');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const filePath = path.join(tempDir, fileName);
    const buffer = Buffer.from(fileData);
    fs.writeFileSync(filePath, buffer);
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
});

ipcMain.handle('cleanup-temp-files', async () => {
  try {
    const tempDir = path.join(os.tmpdir(), 'gemini-gui');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
});

ipcMain.handle('export-pdf', async (_event, htmlContent: string, defaultFileName: string) => {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Export Conversation as PDF',
      defaultPath: defaultFileName,
      filters: [
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    // Create hidden BrowserWindow to render HTML and print to PDF
    const pdfWindow = new BrowserWindow({
      show: false,
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    try {
      // Write HTML to temp file and load it
      const tempHtmlPath = path.join(os.tmpdir(), 'gemini-gui-export.html');
      fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');
      await pdfWindow.loadFile(tempHtmlPath);

      const pdfData = await pdfWindow.webContents.printToPDF({
        printBackground: true,
        margins: { marginType: 'default' },
      });

      fs.writeFileSync(result.filePath, pdfData);

      // Clean up temp HTML file
      try { fs.unlinkSync(tempHtmlPath); } catch { /* ignore */ }

      return { success: true, path: result.filePath };
    } finally {
      pdfWindow.destroy();
    }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
});

ipcMain.handle('export-markdown', async (_event, content: string, defaultFileName: string) => {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Export Conversation as Markdown',
      defaultPath: defaultFileName,
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    fs.writeFileSync(result.filePath, content, 'utf-8');
    return { success: true, path: result.filePath };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
});
