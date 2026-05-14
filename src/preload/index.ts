import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { DirEntry, OpenedFile, PtyOptions, PtySpawnResult } from '../shared/types';
import type { DetectedPort } from '../shared/port-patterns';
import type {
  AppSettings,
  BrainDocument,
  BrainEdge,
  BrainSearchResult,
  IngestPayload,
} from '../shared/brain-types';
import type { StudioDesign, StudioDesignData } from '../shared/studio-types';
import type { PackageScript, TestRunUpdate } from '../shared/testlab-types';
import type { CapturedError } from '../shared/debug-types';

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
  ports: {
    list: (): Promise<DetectedPort[]> => ipcRenderer.invoke('ports:list'),
    clear: (): Promise<void> => ipcRenderer.invoke('ports:clear'),
    dismiss: (url: string): Promise<void> => ipcRenderer.invoke('ports:dismiss', url),
    openExternal: (url: string): Promise<void> => ipcRenderer.invoke('ports:openExternal', url),
    onDetected: (handler: (port: DetectedPort) => void): Unsubscribe => {
      const listener = (_e: IpcRendererEvent, port: DetectedPort) => handler(port);
      ipcRenderer.on('ports:detected', listener);
      return () => ipcRenderer.off('ports:detected', listener);
    },
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    setPublic: (payload: { url: string; anonKey: string }): Promise<void> =>
      ipcRenderer.invoke('settings:setPublic', payload),
    setSupabaseServiceKey: (key: string): Promise<void> =>
      ipcRenderer.invoke('settings:setSupabaseServiceKey', key),
    setOpenAiKey: (key: string): Promise<void> =>
      ipcRenderer.invoke('settings:setOpenAiKey', key),
  },
  brain: {
    ingest: (payload: IngestPayload & { userId: string }): Promise<BrainDocument> =>
      ipcRenderer.invoke('brain:ingest', payload),
    list: (userId: string): Promise<BrainDocument[]> =>
      ipcRenderer.invoke('brain:list', { userId }),
    delete: (userId: string, id: string): Promise<void> =>
      ipcRenderer.invoke('brain:delete', { userId, id }),
    search: (payload: {
      userId: string;
      query: string;
      threshold?: number;
      limit?: number;
    }): Promise<BrainSearchResult[]> => ipcRenderer.invoke('brain:search', payload),
    listEdges: (userId: string): Promise<BrainEdge[]> =>
      ipcRenderer.invoke('brain:listEdges', { userId }),
    addEdge: (payload: {
      userId: string;
      fromId: string;
      toId: string;
      relation?: string;
    }): Promise<BrainEdge> => ipcRenderer.invoke('brain:addEdge', payload),
  },
  studio: {
    list: (userId: string): Promise<StudioDesign[]> =>
      ipcRenderer.invoke('studio:list', { userId }),
    save: (payload: {
      userId: string;
      name: string;
      data: StudioDesignData;
    }): Promise<StudioDesign> => ipcRenderer.invoke('studio:save', payload),
    delete: (userId: string, id: string): Promise<void> =>
      ipcRenderer.invoke('studio:delete', { userId, id }),
  },
  testlab: {
    listScripts: (workspacePath: string): Promise<PackageScript[]> =>
      ipcRenderer.invoke('testlab:listScripts', workspacePath),
    run: (payload: { workspacePath: string; script: string }): Promise<{ runId: string }> =>
      ipcRenderer.invoke('testlab:run', payload),
    cancel: (runId: string): Promise<void> => ipcRenderer.invoke('testlab:cancel', runId),
    onUpdate: (handler: (update: TestRunUpdate) => void): Unsubscribe => {
      const listener = (_e: IpcRendererEvent, update: TestRunUpdate) => handler(update);
      ipcRenderer.on('testlab:update', listener);
      return () => ipcRenderer.off('testlab:update', listener);
    },
  },
  debug: {
    list: (): Promise<CapturedError[]> => ipcRenderer.invoke('debug:list'),
    clear: (): Promise<void> => ipcRenderer.invoke('debug:clear'),
    dismiss: (id: string): Promise<void> => ipcRenderer.invoke('debug:dismiss', id),
    explain: (stack: string): Promise<string> =>
      ipcRenderer.invoke('debug:explain', { stack }),
    onError: (handler: (err: CapturedError) => void): Unsubscribe => {
      const listener = (_e: IpcRendererEvent, err: CapturedError) => handler(err);
      ipcRenderer.on('debug:error', listener);
      return () => ipcRenderer.off('debug:error', listener);
    },
  },
} as const;

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
