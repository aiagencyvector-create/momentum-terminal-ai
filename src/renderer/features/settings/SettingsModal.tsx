import { useCallback, useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/settings';

type Props = {
  open: boolean;
  onClose: () => void;
};

function Field({
  label,
  hint,
  ...inputProps
}: {
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-text-subtle">{label}</span>
      <input
        {...inputProps}
        className="rounded border border-border bg-bg px-2 py-1.5 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-accent"
      />
      {hint && <span className="text-[11px] text-text-subtle">{hint}</span>}
    </label>
  );
}

export function SettingsModal({ open, onClose }: Props): JSX.Element | null {
  const settings = useSettingsStore((s) => s.settings);
  const reload = useSettingsStore((s) => s.reload);

  const [url, setUrl] = useState('');
  const [anon, setAnon] = useState('');
  const [serviceKey, setServiceKey] = useState('');
  const [openAiKey, setOpenAiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setUrl(settings.supabaseUrl);
      setAnon(settings.supabaseAnonKey);
      setServiceKey('');
      setOpenAiKey('');
    }
  }, [settings, open]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await window.api.settings.setPublic({ url, anonKey: anon });
      if (serviceKey.trim()) {
        await window.api.settings.setSupabaseServiceKey(serviceKey);
      }
      if (openAiKey.trim()) {
        await window.api.settings.setOpenAiKey(openAiKey);
      }
      await reload();
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }, [url, anon, serviceKey, openAiKey, reload, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-md border border-border bg-bg-panel p-5 shadow-2xl">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg text-text">Configurações</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-0.5 text-text-muted hover:bg-bg-subtle hover:text-text"
          >
            ×
          </button>
        </header>

        <div className="flex flex-col gap-3">
          <Field
            label="Supabase URL"
            placeholder="https://xxxx.supabase.co"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            hint="Em Supabase → Project Settings → Data API"
          />
          <Field
            label="Supabase Anon Key"
            placeholder="eyJhbGciOi..."
            value={anon}
            onChange={(e) => setAnon(e.target.value)}
            hint="Mesma página, copie o 'anon public' key"
          />
          <Field
            label="Supabase Service Role Key"
            placeholder={
              settings?.hasSupabaseServiceKey ? '••••• (configurado) ·  trocar' : 'eyJhbGciOi...'
            }
            type="password"
            value={serviceKey}
            onChange={(e) => setServiceKey(e.target.value)}
            hint="Service role · usado só no main process para escrever no Brain (nunca exposto ao renderer)"
          />
          <Field
            label="OpenAI API Key"
            placeholder={settings?.hasOpenAiKey ? '••••• (configurado) · trocar' : 'sk-...'}
            type="password"
            value={openAiKey}
            onChange={(e) => setOpenAiKey(e.target.value)}
            hint="Usado para gerar embeddings (text-embedding-3-small)"
          />
        </div>

        {error && (
          <div className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <footer className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border px-3 py-1.5 text-xs uppercase tracking-wider text-text-muted hover:bg-bg-subtle hover:text-text"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded bg-accent px-3 py-1.5 text-xs uppercase tracking-wider text-accent-fg hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </footer>
      </div>
    </div>
  );
}
