import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import { spawnPty, writePty, resizePty, killPty } from '../services/pty-manager';
import type { PtyOptions, PtySpawnResult } from '../../shared/types';

export function registerTerminalIpc(): void {
  ipcMain.handle(
    'terminal:spawn',
    (event: IpcMainInvokeEvent, opts: PtyOptions = {}): PtySpawnResult => {
      return spawnPty(event.sender, opts);
    },
  );

  ipcMain.handle('terminal:write', (_event, payload: { id: string; data: string }) => {
    writePty(payload.id, payload.data);
  });

  ipcMain.handle(
    'terminal:resize',
    (_event, payload: { id: string; cols: number; rows: number }) => {
      resizePty(payload.id, payload.cols, payload.rows);
    },
  );

  ipcMain.handle('terminal:kill', (_event, payload: { id: string }) => {
    killPty(payload.id);
  });
}
