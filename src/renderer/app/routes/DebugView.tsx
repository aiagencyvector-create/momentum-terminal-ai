import { useCallback, useEffect, useState } from 'react';
import type { CapturedError } from '../../../shared/debug-types';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s atrás`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}min atrás`;
  return `${Math.floor(diff / 3_600_000)}h atrás`;
}

export function DebugView(): JSX.Element {
  const [errors, setErrors] = useState<CapturedError[]>([]);
  const [selected, setSelected] = useState<CapturedError | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  useEffect(() => {
    void window.api.debug.list().then((list) => setErrors(list));
    const off = window.api.debug.onError((err) => {
      setErrors((prev) => [err, ...prev.filter((e) => e.id !== err.id)].slice(0, 50));
    });
    return off;
  }, []);

  const explain = useCallback(async () => {
    if (!selected) return;
    setExplainLoading(true);
    setExplainError(null);
    setExplanation(null);
    try {
      const text = await window.api.debug.explain(selected.stack);
      setExplanation(text);
    } catch (e) {
      setExplainError(String(e));
    } finally {
      setExplainLoading(false);
    }
  }, [selected]);

  const dismiss = useCallback(
    async (id: string) => {
      await window.api.debug.dismiss(id);
      setErrors((prev) => prev.filter((e) => e.id !== id));
      if (selected?.id === id) setSelected(null);
    },
    [selected],
  );

  const clearAll = useCallback(async () => {
    await window.api.debug.clear();
    setErrors([]);
    setSelected(null);
    setExplanation(null);
  }, []);

  return (
    <div className="grid h-full min-h-0 grid-cols-[320px_1fr] gap-2 p-2">
      <aside className="flex flex-col overflow-hidden rounded-md border border-border bg-bg-panel">
        <header className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
          <span className="text-[11px] uppercase tracking-wider text-text-subtle">
            Erros capturados · {errors.length}
          </span>
          <button
            type="button"
            onClick={() => void clearAll()}
            disabled={errors.length === 0}
            className="rounded border border-border px-2 py-0.5 text-[10px] uppercase text-text-muted hover:bg-bg-subtle hover:text-text disabled:opacity-40"
          >
            Limpar
          </button>
        </header>
        <div className="flex-1 overflow-auto">
          {errors.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs text-text-subtle">
              Rode algo no terminal. Erros (Error, TypeError, etc.) aparecem aqui automaticamente.
            </div>
          ) : (
            errors.map((err) => {
              const isActive = selected?.id === err.id;
              return (
                <button
                  key={err.id}
                  type="button"
                  onClick={() => {
                    setSelected(err);
                    setExplanation(null);
                  }}
                  className={[
                    'group flex w-full items-start gap-2 border-b border-border/50 px-3 py-2 text-left text-xs',
                    isActive ? 'bg-accent/15 text-text' : 'text-text-muted hover:bg-bg-subtle',
                  ].join(' ')}
                >
                  <span className="shrink-0 text-red-400">✗</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{err.message}</div>
                    <div className="mt-0.5 text-[10px] text-text-subtle">{timeAgo(err.detectedAt)}</div>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      void dismiss(err.id);
                    }}
                    className="opacity-0 hover:text-text group-hover:opacity-100"
                  >
                    ×
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-bg-panel">
        <header className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
          <span className="text-[11px] uppercase tracking-wider text-text-subtle">
            Stack trace
          </span>
          {selected && (
            <button
              type="button"
              onClick={() => void explain()}
              disabled={explainLoading}
              className="rounded bg-accent px-3 py-1 text-[10px] uppercase tracking-wider text-accent-fg hover:opacity-90 disabled:opacity-50"
            >
              {explainLoading ? 'Analisando…' : 'Explain with AI'}
            </button>
          )}
        </header>
        <div className="flex-1 overflow-auto">
          {!selected ? (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              Selecione um erro à esquerda
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-3">
              {explainError && (
                <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
                  {explainError}
                </div>
              )}
              {explanation && (
                <div className="rounded border border-accent/30 bg-accent/10 p-3 text-sm text-text">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-accent">
                    Análise (gpt-4o-mini)
                  </div>
                  <div className="whitespace-pre-wrap">{explanation}</div>
                </div>
              )}
              <pre className="whitespace-pre-wrap rounded bg-bg p-3 font-mono text-[11px] text-text-muted">
                {selected.stack}
              </pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
