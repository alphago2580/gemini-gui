import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { GeminiProcess } from './GeminiProcess';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

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
