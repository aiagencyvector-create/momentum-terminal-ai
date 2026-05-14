import { randomUUID } from 'node:crypto';
import type { WebContents } from 'electron';
import { stripAnsi } from '../../shared/port-patterns';
import type { CapturedError } from '../../shared/debug-types';

const ERROR_HEAD =
  /^(?:\s*)(?:Uncaught\s+)?(?:Error|TypeError|RangeError|ReferenceError|SyntaxError|AssertionError|Failed|FATAL)[^\n]*$/m;
const STACK_FRAME = /^\s+at\s+/;

const buffers = new Map<string, string[]>();
const knownByWebContents = new Map<number, CapturedError[]>();
const MAX_PER_WC = 50;

export function feedErrorChunk(
  webContents: WebContents,
  terminalId: string,
  chunk: string,
): void {
  const cleaned = stripAnsi(chunk);
  const lines = cleaned.split(/\r?\n/);
  const lineBuf = buffers.get(terminalId) ?? [];

  for (const line of lines) {
    if (ERROR_HEAD.test(line)) {
      // start of new error — emit any pending one
      flush(webContents, terminalId);
      lineBuf.push(line);
    } else if (STACK_FRAME.test(line) && lineBuf.length > 0) {
      lineBuf.push(line);
    } else if (lineBuf.length > 0 && line.trim() === '') {
      flush(webContents, terminalId);
    } else if (lineBuf.length > 0 && lineBuf.length < 50) {
      lineBuf.push(line);
    }
  }

  buffers.set(terminalId, lineBuf);
}

function flush(webContents: WebContents, terminalId: string): void {
  const buf = buffers.get(terminalId);
  if (!buf || buf.length === 0) return;
  const message = buf[0] ?? '';
  const stack = buf.join('\n');
  const captured: CapturedError = {
    id: randomUUID(),
    terminalId,
    message,
    stack,
    detectedAt: Date.now(),
  };
  const list = knownByWebContents.get(webContents.id) ?? [];
  list.unshift(captured);
  if (list.length > MAX_PER_WC) list.length = MAX_PER_WC;
  knownByWebContents.set(webContents.id, list);
  if (!webContents.isDestroyed()) {
    webContents.send('debug:error', captured);
  }
  buffers.set(terminalId, []);
}

export function listErrors(webContentsId: number): CapturedError[] {
  return knownByWebContents.get(webContentsId) ?? [];
}

export function clearErrors(webContentsId: number): void {
  knownByWebContents.delete(webContentsId);
}

export function dismissError(webContentsId: number, id: string): void {
  const list = knownByWebContents.get(webContentsId);
  if (!list) return;
  knownByWebContents.set(
    webContentsId,
    list.filter((e) => e.id !== id),
  );
}

export function cleanupErrorTerminal(terminalId: string): void {
  buffers.delete(terminalId);
}
