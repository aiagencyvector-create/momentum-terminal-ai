import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { DirEntry, OpenedFile, PtyOptions, PtySpawnResult } from '../shared/types';

type Unsubscribe = () => void;

const api = {
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
    getPlatform: (): Promise<NodeJS.Platform> => ipcRenderer.invoke('app:platform'),
  },
  fs: {
    openDirectoryDialog: (): Promise<string | null> =>
      ipcRenderer.invoke('fs:openDirectoryDialog'),
    readDir: (path: string): Promise<DirEntry[]> => ipcRenderer.invoke('fs:readDir', path),
    readFile: (path: string): Promise<OpenedFile> => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path: string, content: string): Promise<void> =>
      ipcRenderer.invoke('fs:writeFile', { path, content }),
  },
  terminal: {
    spawn: (opts?: PtyOptions): Promise<PtySpawnResult> =>
      ipcRenderer.invoke('terminal:spawn', opts ?? {}),
    write: (id: string, data: string): Promise<void> =>
      ipcRenderer.invoke('terminal:write', { id, data }),
    resize: (id: string, cols: number, rows: number): Promise<void> =>
      ipcRenderer.invoke('terminal:resize', { id, cols, rows }),
    kill: (id: string): Promise<void> => ipcRenderer.invoke('terminal:kill', { id }),
    onData: (handler: (payload: { id: string; data: string }) => void): Unsubscribe => {
      const listener = (_e: IpcRendererEvent, payload: { id: string; data: string }) =>
        handler(payload);
      ipcRenderer.on('terminal:data', listener);
      return () => ipcRenderer.off('terminal:data', listener);
    },
    onExit: (
      handler: (payload: { id: string; exitCode: number; signal: number | null }) => void,
    ): Unsubscribe => {
      const listener = (
        _e: IpcRendererEvent,
        payload: { id: string; exitCode: number; signal: number | null },
      ) => handler(payload);
      ipcRenderer.on('terminal:exit', listener);
      return () => ipcRenderer.off('terminal:exit', listener);
    },
  },
} as const;

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
