import { useCallback, useEffect, useState } from 'react';
import { Terminal } from './Terminal';
import { useWorkspaceStore } from '../../stores/workspace';

type Tab = {
  id: string;
  label: string;
  shell: string;
};

export function TerminalTabs(): JSX.Element {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const rootPath = useWorkspaceStore((s) => s.rootPath);

  const newTerminal = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await window.api.terminal.spawn({ cwd: rootPath ?? undefined });
      const tab: Tab = {
        id: result.id,
        label: `${result.shell.split(/[\\/]/).pop() ?? 'shell'} · ${result.pid}`,
        shell: result.shell,
      };
      setTabs((prev) => [...prev, tab]);
      setActiveId(result.id);
    } catch (err) {
      console.error('Falha ao spawnar terminal:', err);
    } finally {
      setBusy(false);
    }
  }, [busy, rootPath]);

  const closeTab = useCallback((id: string) => {
    void window.api.terminal.kill(id);
    setTabs((prev) => prev.filter((t) => t.id !== id));
    setActiveId((curr) => {
      if (curr !== id) return curr;
      const remaining = tabs.filter((t) => t.id !== id);
      return remaining[remaining.length - 1]?.id ?? null;
    });
  }, [tabs]);

  useEffect(() => {
    const off = window.api.terminal.onExit(({ id }) => {
      setTabs((prev) => prev.filter((t) => t.id !== id));
      setActiveId((curr) => (curr === id ? null : curr));
    });
    return off;
  }, []);

  useEffect(() => {
    if (tabs.length === 0) {
      void newTerminal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-bg-panel">
      <header className="flex h-8 shrink-0 items-center gap-1 overflow-x-auto border-b border-border bg-bg-subtle px-1">
        {tabs.map((t) => {
          const isActive = t.id === activeId;
          return (
            <div
              key={t.id}
              className={[
                'flex shrink-0 items-center gap-1 rounded-t-md border-x border-t px-2 py-1 text-xs',
                isActive
                  ? 'border-border bg-bg-panel text-text'
                  : 'border-transparent text-text-muted hover:bg-bg/40',
              ].join(' ')}
            >
              <button type="button" onClick={() => setActiveId(t.id)} className="max-w-[180px] truncate">
                {t.label}
              </button>
              <button
                type="button"
                onClick={() => closeTab(t.id)}
                className="rounded px-1 text-text-subtle hover:bg-bg-subtle hover:text-text"
                title="Fechar terminal"
              >
                ×
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => void newTerminal()}
          disabled={busy}
          className="ml-1 rounded border border-border px-2 py-0.5 text-[10px] uppercase text-text-muted hover:bg-bg-subtle hover:text-text disabled:opacity-50"
        >
          + Novo
        </button>
      </header>
      <div className="relative flex-1 overflow-hidden bg-bg p-1">
        {tabs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            Iniciando shell…
          </div>
        ) : (
          tabs.map((t) => (
            <div
              key={t.id}
              className="absolute inset-1"
              style={{ display: t.id === activeId ? 'block' : 'none' }}
            >
              <Terminal ptyId={t.id} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
