import { spawn, type IPty } from '@lydell/node-pty';
import { randomUUID } from 'node:crypto';
import type { WebContents } from 'electron';
import type { PtyOptions, PtySpawnResult } from '../../shared/types';

type Session = {
  id: string;
  pty: IPty;
  shell: string;
  webContentsId: number;
};

const sessions = new Map<string, Session>();

function defaultShell(): string {
  if (process.platform === 'win32') {
    return process.env['COMSPEC'] ?? 'powershell.exe';
  }
  return process.env['SHELL'] ?? '/bin/bash';
}

export function spawnPty(webContents: WebContents, opts: PtyOptions = {}): PtySpawnResult {
  const id = randomUUID();
  const shell = opts.shell ?? defaultShell();
  const cwd = opts.cwd ?? process.env['USERPROFILE'] ?? process.cwd();
  const cols = opts.cols ?? 80;
  const rows = opts.rows ?? 24;

  const isPwsh = /powershell|pwsh/i.test(shell);
  const args = isPwsh ? ['-NoLogo'] : [];

  const pty = spawn(shell, args, {
    name: 'xterm-256color',
    cols,
    rows,
    cwd,
    env: { ...process.env, ...opts.env } as Record<string, string>,
  });

  const session: Session = { id, pty, shell, webContentsId: webContents.id };
  sessions.set(id, session);

  pty.onData((data) => {
    if (!webContents.isDestroyed()) {
      webContents.send('terminal:data', { id, data });
    }
  });

  pty.onExit(({ exitCode, signal }) => {
    if (!webContents.isDestroyed()) {
      webContents.send('terminal:exit', { id, exitCode, signal: signal ?? null });
    }
    sessions.delete(id);
  });

  return { id, pid: pty.pid, shell };
}

export function writePty(id: string, data: string): void {
  const s = sessions.get(id);
  if (s) s.pty.write(data);
}

export function resizePty(id: string, cols: number, rows: number): void {
  const s = sessions.get(id);
  if (s) s.pty.resize(Math.max(cols, 1), Math.max(rows, 1));
}

export function killPty(id: string): void {
  const s = sessions.get(id);
  if (s) {
    s.pty.kill();
    sessions.delete(id);
  }
}

export function killAllPtysForWebContents(webContentsId: number): void {
  for (const [id, s] of sessions) {
    if (s.webContentsId === webContentsId) {
      try {
        s.pty.kill();
      } catch {
        // ignore
      }
      sessions.delete(id);
    }
  }
}
