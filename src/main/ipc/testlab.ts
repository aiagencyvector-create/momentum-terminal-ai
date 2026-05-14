import { ipcMain, type WebContents } from 'electron';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { spawn, type IPty } from '@lydell/node-pty';
import { randomUUID } from 'node:crypto';
import { createTestParser } from '../services/test-parser';
import type { PackageScript, TestRunUpdate } from '../../shared/testlab-types';

const TEST_SCRIPT_NAMES = new Set([
  'test',
  'tests',
  'test:unit',
  'test:integration',
  'test:e2e',
  'test:watch',
  'test:run',
  'vitest',
  'jest',
]);

const runs = new Map<string, { pty: IPty; webContentsId: number }>();

async function readPackageScripts(workspacePath: string): Promise<PackageScript[]> {
  const pkgPath = join(workspacePath, 'package.json');
  try {
    const content = await fs.readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(content) as { scripts?: Record<string, string> };
    const scripts = pkg.scripts ?? {};
    return Object.entries(scripts).map(([name, command]) => ({
      name,
      command,
      isTest:
        TEST_SCRIPT_NAMES.has(name) ||
        name.startsWith('test') ||
        /vitest|jest|playwright|cypress/i.test(command),
    }));
  } catch {
    return [];
  }
}

function spawnRun(
  webContents: WebContents,
  workspacePath: string,
  script: string,
): { runId: string } {
  const runId = randomUUID();
  const shell = process.platform === 'win32' ? 'powershell.exe' : (process.env['SHELL'] ?? '/bin/bash');
  const isPwsh = /powershell|pwsh/i.test(shell);
  const cmd = isPwsh ? `pnpm run ${script}` : `pnpm run ${script}`;
  const args = isPwsh ? ['-NoLogo', '-NoProfile', '-Command', cmd] : ['-c', cmd];

  const pty = spawn(shell, args, {
    name: 'xterm-256color',
    cols: 120,
    rows: 30,
    cwd: workspacePath,
    env: { ...process.env, CI: 'true', FORCE_COLOR: '0' } as Record<string, string>,
  });

  const parser = createTestParser();
  runs.set(runId, { pty, webContentsId: webContents.id });

  const send = (update: TestRunUpdate) => {
    if (!webContents.isDestroyed()) webContents.send('testlab:update', update);
  };

  pty.onData((data) => {
    send({ runId, type: 'data', chunk: data });
    for (const event of parser.feed(data)) {
      if ('result' in event) send({ runId, type: 'result', result: event.result });
      else send({ runId, type: 'summary', ...event.summary });
    }
  });

  pty.onExit(({ exitCode }) => {
    send({ runId, type: 'exit', exitCode: exitCode ?? 0 });
    runs.delete(runId);
  });

  return { runId };
}

export function registerTestLabIpc(): void {
  ipcMain.handle(
    'testlab:listScripts',
    async (_event, workspacePath: string): Promise<PackageScript[]> => {
      if (!workspacePath) return [];
      return readPackageScripts(workspacePath);
    },
  );

  ipcMain.handle(
    'testlab:run',
    (event, payload: { workspacePath: string; script: string }): { runId: string } => {
      return spawnRun(event.sender, payload.workspacePath, payload.script);
    },
  );

  ipcMain.handle('testlab:cancel', (_event, runId: string) => {
    const r = runs.get(runId);
    if (r) {
      try {
        r.pty.kill();
      } catch {
        // ignore
      }
      runs.delete(runId);
    }
  });
}

export function killAllTestRunsForWebContents(webContentsId: number): void {
  for (const [id, r] of runs) {
    if (r.webContentsId === webContentsId) {
      try {
        r.pty.kill();
      } catch {
        // ignore
      }
      runs.delete(id);
    }
  }
}
