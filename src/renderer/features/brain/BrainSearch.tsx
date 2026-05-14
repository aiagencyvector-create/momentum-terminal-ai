import { useState } from 'react';
import { useAuthStore } from '../../stores/auth';
import type { BrainSearchResult } from '../../../shared/brain-types';

export function BrainSearch(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BrainSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(): Promise<void> {
    if (!user || !query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await window.api.brain.search({
        userId: user.id,
        query: query.trim(),
        threshold: 0.4,
        limit: 8,
      });
      setResults(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runSearch();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar no Brain por semântica..."
          className="flex-1 rounded border border-border bg-bg px-2 py-1.5 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded bg-accent px-3 py-1.5 text-xs uppercase tracking-wider text-accent-fg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {results.length === 0 && !loading && (
          <div className="flex h-full items-center justify-center text-xs text-text-subtle">
            Resultados aparecem aqui
          </div>
        )}
        {results.map((r) => (
          <div
            key={r.id}
            className="mb-2 rounded border border-border bg-bg-panel p-3 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium text-text">{r.title}</div>
              <span className="shrink-0 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] text-text-muted">
                {(r.similarity * 100).toFixed(0)}%
              </span>
            </div>
            {r.source_path && (
              <div className="mt-0.5 truncate text-[11px] text-text-subtle">{r.source_path}</div>
            )}
            <div className="mt-2 line-clamp-3 text-xs text-text-muted">{r.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
