import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { GeminiProcess } from './GeminiProcess';

let mainWindow: BrowserWindow | null = null;
let gemini: GeminiProcess = new GeminiProcess();
let currentSessionId: string | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
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

app.whenReady().then(() => {
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

function startGeminiProcess() {
  const cliPath = process.env.GEMINI_CLI_PATH || path.join(__dirname, '../../../gemini-cli/bundle/gemini.js');
  const cliDir = process.env.GEMINI_CLI_PATH
    ? path.dirname(process.env.GEMINI_CLI_PATH)
    : path.join(__dirname, '../../../gemini-cli');

  gemini.removeAllListeners('json');
  gemini.on('json', (jsonData: any) => {
    console.log(`[JSON parsed] type: ${jsonData.type}, role: ${jsonData.role}`);

    if (jsonData.type === 'init' && jsonData.session_id) {
      currentSessionId = jsonData.session_id;
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

  gemini.start(cliPath, cliDir);
}

ipcMain.handle('send-message', async (event, message: string) => {
  return new Promise((resolve, reject) => {
    try {
      startGeminiProcess();
      gemini.send(message);
      resolve({ success: true, output: '', error: null });
    } catch (error: any) {
      const errorMsg = `예외 발생: ${error.message}`;
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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('cleanup-temp-files', async () => {
  try {
    const tempDir = path.join(os.tmpdir(), 'gemini-gui');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
