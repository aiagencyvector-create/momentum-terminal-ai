import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/auth';
import { useSettingsStore } from '../../stores/settings';
import { useStudioStore } from '../../stores/studio';
import { StudioCanvas } from '../../features/studio/StudioCanvas';
import { NodePalette } from '../../features/studio/NodePalette';
import { NodeInspector } from '../../features/studio/NodeInspector';
import { buildPromptPreview } from '../../features/studio/useVibeCode';

export function StudioView(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const settings = useSettingsStore((s) => s.settings);
  const designs = useStudioStore((s) => s.designs);
  const currentName = useStudioStore((s) => s.currentName);
  const currentData = useStudioStore((s) => s.currentData);
  const dirty = useStudioStore((s) => s.dirty);
  const setDesigns = useStudioStore((s) => s.setDesigns);
  const loadDesign = useStudioStore((s) => s.loadDesign);
  const newDesign = useStudioStore((s) => s.newDesign);
  const markClean = useStudioStore((s) => s.markClean);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const list = await window.api.studio.list(user.id);
      setDesigns(list);
    } catch (e) {
      setError(String(e));
    }
  }, [user, setDesigns]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await window.api.studio.save({
        userId: user.id,
        name: currentName.trim() || 'Untitled',
        data: currentData,
      });
      markClean();
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }, [user, currentName, currentData, markClean, refresh]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-text-muted">
        Entre na sua conta para usar o Project Studio.
      </div>
    );
  }

  if (!settings?.hasSupabaseServiceKey) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-text-muted">
        Configure a Service Role Key do Supabase em Configurações para salvar designs.
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[200px_1fr_320px] gap-2 p-2">
      <aside className="flex flex-col gap-2 overflow-auto rounded-md border border-border bg-bg-panel">
        <NodePalette />
        <div className="border-t border-border p-2">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-text-subtle">Designs</div>
          <button
            type="button"
            onClick={() => newDesign(`Design ${designs.length + 1}`)}
            className="mb-1 w-full rounded border border-border bg-bg px-2 py-1 text-left text-xs text-text-muted hover:bg-bg-subtle hover:text-text"
          >
            + Novo
          </button>
          <div className="flex flex-col gap-0.5">
            {designs.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => loadDesign(d)}
                className={[
                  'truncate rounded px-2 py-1 text-left text-xs',
                  d.name === currentName
                    ? 'bg-accent/20 text-text'
                    : 'text-text-muted hover:bg-bg-subtle hover:text-text',
                ].join(' ')}
                title={d.name}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-bg-panel">
        <header className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-2">
          <input
            type="text"
            value={currentName}
            onChange={(e) => useStudioStore.setState({ currentName: e.target.value, dirty: true })}
            className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 py-0.5 text-sm text-text hover:border-border focus:border-accent focus:outline-none"
          />
          {dirty && <span className="text-accent">●</span>}
          <button
            type="button"
            onClick={() => setShowPrompt((v) => !v)}
            className="rounded border border-border px-2 py-0.5 text-[10px] uppercase text-text-muted hover:bg-bg-subtle hover:text-text"
          >
            Vibe code
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded bg-accent px-2 py-0.5 text-[10px] uppercase text-accent-fg hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </header>
        <div className="relative flex-1">
          <StudioCanvas />
          {showPrompt && (
            <div className="absolute bottom-2 left-2 right-2 max-h-[50%] overflow-auto rounded-md border border-border bg-bg-panel p-3 text-xs shadow-2xl">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-text-subtle">
                  Prompt gerado · copie no terminal com `claude "..."` ou `codex "..."`
                </span>
                <button
                  type="button"
                  onClick={() => setShowPrompt(false)}
                  className="text-text-muted hover:text-text"
                >
                  ×
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-text-muted">
                {buildPromptPreview()}
              </pre>
            </div>
          )}
        </div>
      </section>

      <aside className="flex h-full min-h-0 flex-col overflow-auto rounded-md border border-border bg-bg-panel">
        <NodeInspector />
        {error && (
          <div className="m-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
            {error}
          </div>
        )}
      </aside>
    </div>
  );
}
