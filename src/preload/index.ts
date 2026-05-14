import { contextBridge, ipcRenderer } from 'electron';

const api = {
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
    getPlatform: (): Promise<NodeJS.Platform> => ipcRenderer.invoke('app:platform'),
  },
} as const;

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
