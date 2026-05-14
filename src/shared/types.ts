export type DirEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
};

export type OpenedFile = {
  path: string;
  content: string;
};

export type PtyOptions = {
  shell?: string;
  cwd?: string;
  cols?: number;
  rows?: number;
  env?: Record<string, string>;
};

export type PtySpawnResult = {
  id: string;
  pid: number;
  shell: string;
};
