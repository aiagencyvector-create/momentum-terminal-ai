import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/auth';
import { useSettingsStore } from '../../stores/settings';
import { BrainGraph } from '../../features/brain/BrainGraph';
import { BrainSearch } from '../../features/brain/BrainSearch';
import { AddCurrentFileToBrain } from '../../features/brain/AddCurrentFileToBrain';
import type { BrainDocument, BrainEdge } from '../../../shared/brain-types';

export function BrainView(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const [documents, setDocuments] = useState<BrainDocument[]>([]);
  const [edges, setEdges] = useState<BrainEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [docs, edgs] = await Promise.all([
        window.api.brain.list(user.id),
        window.api.brain.listEdges(user.id),
      ]);
      setDocuments(docs);
      setEdges(edgs);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-text-muted">
        Entre na sua conta para acessar o Brain.
      </div>
    );
  }

  if (!settings?.hasOpenAiKey || !settings?.hasSupabaseServiceKey) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <div className="text-text">Configuração incompleta</div>
          <p className="mt-2 text-sm text-text-muted">
            Para usar o Brain você precisa configurar a Service Role Key do Supabase e a API Key da
            OpenAI em <span className="text-text">Configurações</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_320px] gap-2 p-2">
      <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-bg-panel">
        <header className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
          <span className="text-[11px] uppercase tracking-wider text-text-subtle">
            Brain · {documents.length} documento{documents.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded border border-border px-2 py-0.5 text-[10px] uppercase text-text-muted hover:bg-bg-subtle hover:text-text"
          >
            ↻ Atualizar
          </button>
        </header>
        <div className="relative flex-1">
          {loading && (
            <div className="absolute right-3 top-3 z-10 rounded bg-bg/90 px-2 py-0.5 text-[10px] uppercase text-text-muted">
              carregando…
            </div>
          )}
          {documents.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-text-muted">
              Brain vazio. Abra um arquivo no Workspace e clique em <br />
              <span className="text-text">"Adicionar ao Brain"</span> aqui ao lado.
            </div>
          ) : (
            <BrainGraph documents={documents} edges={edges} />
          )}
        </div>
      </section>

      <aside className="flex h-full min-h-0 flex-col gap-3 rounded-md border border-border bg-bg-panel p-3">
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-wider text-text-subtle">
            Adicionar ao Brain
          </div>
          <AddCurrentFileToBrain onAdded={() => void refresh()} />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="mb-2 text-[11px] uppercase tracking-wider text-text-subtle">
            Busca semântica
          </div>
          <div className="flex-1 min-h-0">
            <BrainSearch />
          </div>
        </div>
        {error && (
          <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
            {error}
          </div>
        )}
      </aside>
    </div>
  );
}
