import { useEffect } from 'react';
import { useTestLabStore } from '../../stores/testlab';
import { useWorkspaceStore } from '../../stores/workspace';
import { stripAnsi } from '../../../shared/port-patterns';

function statusBadge(status: 'pass' | 'fail' | 'skip' | 'running'): JSX.Element {
  const colors: Record<typeof status, string> = {
    pass: 'text-lime-400',
    fail: 'text-red-400',
    skip: 'text-text-subtle',
    running: 'text-yellow-400',
  };
  const symbols: Record<typeof status, string> = {
    pass: '✓',
    fail: '✗',
    skip: '○',
    running: '·',
  };
  return <span className={`shrink-0 ${colors[status]}`}>{symbols[status]}</span>;
}

export function TestLabView(): JSX.Element {
  const rootPath = useWorkspaceStore((s) => s.rootPath);
  const scripts = useTestLabStore((s) => s.scripts);
  const loadingScripts = useTestLabStore((s) => s.loadingScripts);
  const currentRunId = useTestLabStore((s) => s.currentRunId);
  const output = useTestLabStore((s) => s.output);
  const results = useTestLabStore((s) => s.results);
  const summary = useTestLabStore((s) => s.summary);
  const exitCode = useTestLabStore((s) => s.exitCode);
  const loadScripts = useTestLabStore((s) => s.loadScripts);
  const startRun = useTestLabStore((s) => s.startRun);
  const handleUpdate = useTestLabStore((s) => s.handleUpdate);
  const cancel = useTestLabStore((s) => s.cancel);

  useEffect(() => {
    if (rootPath) void loadScripts(rootPath);
  }, [rootPath, loadScripts]);

  useEffect(() => {
    const off = window.api.testlab.onUpdate((u) => handleUpdate(u));
    return off;
  }, [handleUpdate]);

  if (!rootPath) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-text-muted">
        Abra uma pasta no Workspace primeiro.
      </div>
    );
  }

  const testScripts = scripts.filter((s) => s.isTest);
  const otherScripts = scripts.filter((s) => !s.isTest);

  return (
    <div className="grid h-full min-h-0 grid-cols-[260px_1fr] gap-2 p-2">
      <aside className="flex flex-col overflow-auto rounded-md border border-border bg-bg-panel">
        <header className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
          <span className="text-[11px] uppercase tracking-wider text-text-subtle">Scripts</span>
          <button
            type="button"
            onClick={() => void loadScripts(rootPath)}
            className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-text-muted hover:bg-bg-subtle hover:text-text"
          >
            ↻
          </button>
        </header>
        <div className="p-2">
          {loadingScripts && (
            <div className="px-1 py-1 text-[11px] text-text-subtle">carregando…</div>
          )}
          {testScripts.length > 0 && (
            <>
              <div className="mb-1 px-1 text-[10px] uppercase tracking-wider text-text-subtle">
                Testes
              </div>
              {testScripts.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => void startRun(rootPath, s.name)}
                  disabled={currentRunId !== null}
                  className="mb-1 w-full rounded border border-border bg-bg px-2 py-1.5 text-left text-xs text-text hover:border-accent/40 hover:bg-bg-subtle disabled:opacity-40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-accent">▶</span>
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-text-subtle">{s.command}</div>
                </button>
              ))}
            </>
          )}
          {otherScripts.length > 0 && (
            <>
              <div className="mb-1 mt-3 px-1 text-[10px] uppercase tracking-wider text-text-subtle">
                Outros
              </div>
              {otherScripts.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => void startRun(rootPath, s.name)}
                  disabled={currentRunId !== null}
                  className="mb-1 w-full rounded border border-border/50 bg-bg px-2 py-1 text-left text-xs text-text-muted hover:border-border hover:text-text disabled:opacity-40"
                >
                  <span>{s.name}</span>
                  <div className="mt-0.5 truncate text-[10px] text-text-subtle">{s.command}</div>
                </button>
              ))}
            </>
          )}
          {scripts.length === 0 && !loadingScripts && (
            <div className="px-1 py-2 text-[11px] text-text-subtle">
              Nenhum script encontrado em package.json
            </div>
          )}
        </div>
      </aside>

      <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-bg-panel">
        <header className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
          <span className="text-[11px] uppercase tracking-wider text-text-subtle">
            Resultados {currentRunId ? '· rodando…' : exitCode !== null ? `· exit ${exitCode}` : ''}
          </span>
          <div className="flex items-center gap-2 text-xs">
            {summary && (
              <>
                <span className="text-lime-400">{summary.pass} ok</span>
                <span className="text-red-400">{summary.fail} fail</span>
                <span className="text-text-subtle">{summary.skip} skip</span>
              </>
            )}
            {currentRunId && (
              <button
                type="button"
                onClick={() => void cancel()}
                className="rounded border border-border px-2 py-0.5 text-[10px] uppercase text-text-muted hover:bg-bg-subtle hover:text-text"
              >
                Cancelar
              </button>
            )}
          </div>
        </header>

        <div className="grid flex-1 min-h-0 grid-rows-[1fr_1fr]">
          <div className="overflow-auto border-b border-border p-2">
            {results.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-text-subtle">
                Resultados aparecem aqui em tempo real
              </div>
            ) : (
              results.map((r, i) => (
                <div key={i} className="flex items-start gap-2 px-1 py-0.5 text-xs">
                  {statusBadge(r.status)}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-text">{r.name}</div>
                    {r.file && (
                      <div className="truncate text-[11px] text-text-subtle">{r.file}</div>
                    )}
                  </div>
                  {r.duration !== undefined && (
                    <span className="shrink-0 text-[11px] text-text-subtle">{r.duration}ms</span>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="overflow-auto bg-bg p-2 font-mono text-[11px] text-text-muted">
            <pre className="whitespace-pre-wrap">{stripAnsi(output) || '(sem output ainda)'}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}
