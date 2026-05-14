import { ipcMain, shell } from 'electron';
import { listPorts, clearPorts, dismissPort } from '../services/port-detector';

export function registerPortsIpc(): void {
  ipcMain.handle('ports:list', (event) => {
    return listPorts(event.sender.id);
  });

  ipcMain.handle('ports:clear', (event) => {
    clearPorts(event.sender.id);
  });

  ipcMain.handle('ports:dismiss', (event, url: string) => {
    dismissPort(event.sender.id, url);
  });

  ipcMain.handle('ports:openExternal', async (_event, url: string) => {
    await shell.openExternal(url);
  });
}
