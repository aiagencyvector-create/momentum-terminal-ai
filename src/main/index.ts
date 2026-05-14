import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { join } from 'node:path';
import { registerTerminalIpc } from './ipc/terminal';
import { registerFsIpc } from './ipc/fs';
import { registerPortsIpc } from './ipc/ports';
import { registerSettingsIpc } from './ipc/settings';
import { registerBrainIpc } from './ipc/brain';
import { killAllPtysForWebContents } from './services/pty-manager';
import { clearPorts } from './services/port-detector';

const isDev = !app.isPackaged;

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0b0d12',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true,
      spellcheck: false,
    },
  });

  win.on('ready-to-show', () => {
    win.show();
    if (isDev) win.webContents.openDevTools({ mode: 'detach' });
  });

  win.webContents.on('destroyed', () => {
    killAllPtysForWebContents(win.webContents.id);
    clearPorts(win.webContents.id);
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return win;
}

app.whenReady().then(() => {
  ipcMain.handle('app:version', () => app.getVersion());
  ipcMain.handle('app:platform', () => process.platform);

  registerTerminalIpc();
  registerFsIpc();
  registerPortsIpc();
  registerSettingsIpc();
  registerBrainIpc();

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
