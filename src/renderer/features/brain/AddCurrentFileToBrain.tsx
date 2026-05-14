import { useState } from 'react';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';

type Props = {
  onAdded?: () => void;
};

function basename(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] ?? path;
}

export function AddCurrentFileToBrain({ onAdded }: Props): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const tabs = useWorkspaceStore((s) => s.tabs);
  const activeTabPath = useWorkspaceStore((s) => s.activeTabPath);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeTab = tabs.find((t) => t.path === activeTabPath);

  async function ingest(): Promise<void> {
    if (!user || !activeTab) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await window.api.brain.ingest({
        userId: user.id,
        title: basename(activeTab.path),
        content: activeTab.content,
        sourcePath: activeTab.path,
        tags: [],
      });
      setSuccess('Adicionado ao Brain');
      onAdded?.();
      setTimeout(() => setSuccess(null), 2500);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!activeTab) {
    return (
      <div className="text-[11px] text-text-subtle">
        Abra um arquivo no Workspace para enviar ao Brain.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={ingest}
        disabled={busy}
        className="rounded border border-border bg-bg-panel px-3 py-1.5 text-xs text-text hover:bg-bg-subtle disabled:opacity-50"
      >
        {busy ? 'Indexando…' : `Adicionar ao Brain: ${basename(activeTab.path)}`}
      </button>
      {success && <div className="text-[11px] text-accent">{success}</div>}
      {error && <div className="text-[11px] text-red-300">{error}</div>}
    </div>
  );
}
