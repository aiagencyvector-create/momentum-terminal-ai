import type { WebContents } from 'electron';
import { findPortsInChunk, type DetectedPort } from '../../shared/port-patterns';

type Listener = (port: DetectedPort) => void;

const knownByWebContents = new Map<number, Map<string, DetectedPort>>();
const listenersByWebContents = new Map<number, Set<Listener>>();

const buffersByTerminal = new Map<string, string>();
const MAX_BUFFER = 16 * 1024;

function pushKnown(wcId: number, port: DetectedPort): boolean {
  let map = knownByWebContents.get(wcId);
  if (!map) {
    map = new Map();
    knownByWebContents.set(wcId, map);
  }
  if (map.has(port.url)) return false;
  map.set(port.url, port);
  return true;
}

export function feedTerminalChunk(
  webContents: WebContents,
  terminalId: string,
  chunk: string,
): void {
  const prev = buffersByTerminal.get(terminalId) ?? '';
  const combined = prev + chunk;
  const tail = combined.length > MAX_BUFFER ? combined.slice(combined.length - MAX_BUFFER) : combined;
  buffersByTerminal.set(terminalId, tail);

  const matches = findPortsInChunk(tail);
  if (matches.length === 0) return;

  for (const m of matches) {
    const detected: DetectedPort = {
      ...m,
      source: 'terminal',
      terminalId,
      detectedAt: Date.now(),
    };
    if (pushKnown(webContents.id, detected)) {
      webContents.send('ports:detected', detected);
      const set = listenersByWebContents.get(webContents.id);
      if (set) for (const l of set) l(detected);
    }
  }

  if (matches.length > 0) {
    buffersByTerminal.set(terminalId, '');
  }
}

export function listPorts(webContentsId: number): DetectedPort[] {
  const m = knownByWebContents.get(webContentsId);
  return m ? [...m.values()].sort((a, b) => b.detectedAt - a.detectedAt) : [];
}

export function clearPorts(webContentsId: number): void {
  knownByWebContents.delete(webContentsId);
}

export function dismissPort(webContentsId: number, url: string): void {
  const m = knownByWebContents.get(webContentsId);
  if (m) m.delete(url);
}

export function cleanupTerminal(terminalId: string): void {
  buffersByTerminal.delete(terminalId);
}
