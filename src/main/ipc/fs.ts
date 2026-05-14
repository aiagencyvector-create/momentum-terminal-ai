import { ipcMain, dialog, BrowserWindow } from 'electron';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { DirEntry, OpenedFile } from '../../shared/types';

const IGNORED_NAMES = new Set([
  'node_modules',
  '.git',
  '.next',
  '.turbo',
  'dist',
  'out',
  'build',
  'release',
  '.cache',
  '.parcel-cache',
  '.vite',
  '.electron-vite',
]);

export function registerFsIpc(): void {
  ipcMain.handle('fs:openDirectoryDialog', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const result = win
      ? await dialog.showOpenDialog(win, {
          properties: ['openDirectory'],
          title: 'Abrir pasta como workspace',
        })
      : await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('fs:readDir', async (_event, dirPath: string): Promise<DirEntry[]> => {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((e) => !IGNORED_NAMES.has(e.name))
      .map((e) => ({
        name: e.name,
        path: join(dirPath, e.name),
        isDirectory: e.isDirectory(),
      }))
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
      });
  });

  ipcMain.handle('fs:readFile', async (_event, filePath: string): Promise<OpenedFile> => {
    const buf = await fs.readFile(filePath);
    return { path: filePath, content: buf.toString('utf8') };
  });

  ipcMain.handle(
    'fs:writeFile',
    async (_event, payload: { path: string; content: string }): Promise<void> => {
      await fs.writeFile(payload.path, payload.content, 'utf8');
    },
  );
}
