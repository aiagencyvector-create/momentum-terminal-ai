import { useCallback, useEffect, useState } from 'react';
import type { DirEntry } from '../../../shared/types';
import { useWorkspaceStore } from '../../stores/workspace';

function iconFor(entry: DirEntry): string {
  if (entry.isDirectory) return '▸';
  const name = entry.name.toLowerCase();
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'TS';
  if (name.endsWith('.js') || name.endsWith('.jsx')) return 'JS';
  if (name.endsWith('.json')) return '{}';
  if (name.endsWith('.md')) return 'MD';
  if (name.endsWith('.css')) return '#';
  if (name.endsWith('.html')) return '<>';
  return '·';
}

function TreeNode({ entry, depth }: { entry: DirEntry; depth: number }): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<DirEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openTab = useWorkspaceStore((s) => s.openTab);
  const activeTabPath = useWorkspaceStore((s) => s.activeTabPath);

  const toggle = useCallback(async () => {
    if (entry.isDirectory) {
      const next = !expanded;
      setExpanded(next);
      if (next && children === null) {
        setLoading(true);
        try {
          const list = await window.api.fs.readDir(entry.path);
          setChildren(list);
        } catch (err) {
          setError(String(err));
        } finally {
          setLoading(false);
        }
      }
    } else {
      try {
        const file = await window.api.fs.readFile(entry.path);
        openTab(file.path, file.content);
      } catch (err) {
        setError(String(err));
      }
    }
  }, [entry, expanded, children, openTab]);

  const isActive = !entry.isDirectory && activeTabPath === entry.path;

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className={[
          'flex w-full items-center gap-1 px-1 py-0.5 text-left text-xs hover:bg-bg-subtle',
          isActive ? 'bg-accent/15 text-text' : 'text-text-muted',
        ].join(' ')}
        style={{ paddingLeft: 4 + depth * 12 }}
      >
        <span className="w-3 shrink-0 text-center text-[10px] text-text-subtle">
          {entry.isDirectory ? (expanded ? '▾' : '▸') : ''}
        </span>
        <span className="w-5 shrink-0 text-center text-[10px] font-mono text-accent">
          {iconFor(entry)}
        </span>
        <span className="truncate">{entry.name}</span>
      </button>
      {expanded && entry.isDirectory && (
        <div>
          {loading && (
            <div className="px-2 py-1 text-[11px] text-text-subtle" style={{ paddingLeft: 16 + depth * 12 }}>
              carregando…
            </div>
          )}
          {error && (
            <div className="px-2 py-1 text-[11px] text-red-400" style={{ paddingLeft: 16 + depth * 12 }}>
              {error}
            </div>
          )}
          {children?.map((c) => <TreeNode key={c.path} entry={c} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export function FileTree(): JSX.Element {
  const rootPath = useWorkspaceStore((s) => s.rootPath);
  const setRoot = useWorkspaceStore((s) => s.setRoot);
  const [entries, setEntries] = useState<DirEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rootPath) {
      setEntries(null);
      return;
    }
    setLoading(true);
    setError(null);
    window.api.fs
      .readDir(rootPath)
      .then((list) => setEntries(list))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [rootPath]);

  const pickFolder = useCallback(async () => {
    const picked = await window.api.fs.openDirectoryDialog();
    if (picked) setRoot(picked);
  }, [setRoot]);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-bg-panel">
      <header className="flex h-8 shrink-0 items-center justify-between border-b border-border px-2">
        <span className="truncate text-[10px] uppercase tracking-wider text-text-subtle">
          {rootPath ?? 'Explorer'}
        </span>
        <button
          type="button"
          onClick={pickFolder}
          className="rounded border border-border px-2 py-0.5 text-[10px] uppercase text-text-muted hover:bg-bg-subtle hover:text-text"
        >
          Abrir pasta
        </button>
      </header>
      <div className="flex-1 overflow-auto py-1">
        {!rootPath && (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-text-muted">
            Nenhuma pasta aberta. Clique em <span className="mx-1 font-semibold">Abrir pasta</span> para começar.
          </div>
        )}
        {loading && <div className="px-3 py-1 text-xs text-text-subtle">carregando…</div>}
        {error && <div className="px-3 py-1 text-xs text-red-400">{error}</div>}
        {entries?.map((e) => <TreeNode key={e.path} entry={e} depth={0} />)}
      </div>
    </section>
  );
}
