import type { TestResult } from '../../shared/testlab-types';
import { stripAnsi } from '../../shared/port-patterns';

const VITEST_RESULT = /^(?:\s*)(✓|✗|×|✘|⏭|skip)\s+(.+?)(?:\s+(\d+)ms)?$/;
const JEST_RESULT = /^(?:\s*)(✓|✗|×|✘|○)\s+(.+?)(?:\s+\((\d+)\s*ms\))?$/;
const SUMMARY_PASS = /(\d+)\s+passed/i;
const SUMMARY_FAIL = /(\d+)\s+failed/i;
const SUMMARY_SKIP = /(\d+)\s+(?:skipped|todo)/i;
const FILE_HEAD = /^(?:\s*)(?:PASS|FAIL|RUNS|✓|✗)\s+([^\s]+\.(?:test|spec)\.[jt]sx?)/;

type Parser = {
  feed: (chunk: string) => Array<{ result: TestResult } | { summary: { pass: number; fail: number; skip: number } }>;
};

export function createTestParser(): Parser {
  let buffer = '';
  let currentFile: string | undefined;

  return {
    feed(chunk: string) {
      const text = stripAnsi(buffer + chunk);
      const lines = text.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      const emitted: ReturnType<Parser['feed']> = [];

      for (const line of lines) {
        const fileMatch = line.match(FILE_HEAD);
        if (fileMatch && fileMatch[1]) {
          currentFile = fileMatch[1];
        }

        const vit = line.match(VITEST_RESULT) ?? line.match(JEST_RESULT);
        if (vit) {
          const symbol = vit[1] ?? '';
          const name = (vit[2] ?? '').trim();
          const ms = vit[3] ? Number.parseInt(vit[3], 10) : undefined;
          let status: TestResult['status'] = 'pass';
          if (symbol === '✗' || symbol === '×' || symbol === '✘') status = 'fail';
          else if (symbol === '⏭' || symbol === '○' || symbol.toLowerCase() === 'skip')
            status = 'skip';
          emitted.push({
            result: {
              name,
              file: currentFile,
              status,
              duration: ms,
            },
          });
          continue;
        }

        const pass = line.match(SUMMARY_PASS);
        const fail = line.match(SUMMARY_FAIL);
        const skip = line.match(SUMMARY_SKIP);
        if (pass || fail || skip) {
          emitted.push({
            summary: {
              pass: pass ? Number.parseInt(pass[1] ?? '0', 10) : 0,
              fail: fail ? Number.parseInt(fail[1] ?? '0', 10) : 0,
              skip: skip ? Number.parseInt(skip[1] ?? '0', 10) : 0,
            },
          });
        }
      }

      return emitted;
    },
  };
}
