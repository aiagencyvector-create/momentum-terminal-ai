export type DetectedPort = {
  port: number;
  url: string;
  host: string;
  protocol: 'http' | 'https';
  source: 'terminal';
  terminalId: string;
  detectedAt: number;
};

const ANSI_REGEX = /\x1b\[[0-9;?]*[ -/]*[@-~]/g;

export function stripAnsi(input: string): string {
  return input.replace(ANSI_REGEX, '');
}

const URL_PATTERN =
  /\b(?<protocol>https?):\/\/(?<host>localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]):(?<port>\d{2,5})(?:\/\S*)?/gi;

const PORT_KEYWORD_PATTERNS: readonly RegExp[] = [
  /\b(?:ready on|listening on|local:|server (?:started|listening|running)(?: at| on)?|started server on|app running at)\s*:?\s*\S*?:(\d{2,5})/i,
  /\bport[:\s]+(\d{2,5})\b/i,
  /\blistening on\s+(?:port\s+)?(\d{2,5})/i,
];

const IGNORED_PORTS = new Set([0, 22, 25, 80, 443, 3306, 5432, 6379, 27017]);

function normalizeHost(host: string): string {
  if (host === '0.0.0.0' || host === '[::1]') return 'localhost';
  return host;
}

export function findPortsInChunk(chunk: string): Array<Omit<DetectedPort, 'source' | 'terminalId' | 'detectedAt'>> {
  const text = stripAnsi(chunk);
  const found = new Map<string, Omit<DetectedPort, 'source' | 'terminalId' | 'detectedAt'>>();

  for (const match of text.matchAll(URL_PATTERN)) {
    const groups = match.groups;
    if (!groups) continue;
    const port = Number.parseInt(groups['port'] ?? '', 10);
    if (!Number.isInteger(port) || port < 10 || port > 65535) continue;
    if (IGNORED_PORTS.has(port)) continue;
    const protocol = (groups['protocol']?.toLowerCase() === 'https' ? 'https' : 'http') as 'http' | 'https';
    const host = normalizeHost(groups['host'] ?? 'localhost');
    const url = `${protocol}://${host}:${port}`;
    if (!found.has(url)) found.set(url, { port, url, host, protocol });
  }

  if (found.size === 0) {
    for (const pattern of PORT_KEYWORD_PATTERNS) {
      const m = text.match(pattern);
      if (m && m[1]) {
        const port = Number.parseInt(m[1], 10);
        if (Number.isInteger(port) && port >= 10 && port <= 65535 && !IGNORED_PORTS.has(port)) {
          const url = `http://localhost:${port}`;
          if (!found.has(url)) {
            found.set(url, { port, url, host: 'localhost', protocol: 'http' });
          }
        }
      }
    }
  }

  return [...found.values()];
}
