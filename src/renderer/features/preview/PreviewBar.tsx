import { useCallback, useState, useEffect } from 'react';
import { usePortsStore } from '../../stores/ports';

type Props = {
  onReload: () => void;
  webviewUrl: string | null;
};

export function PreviewBar({ onReload, webviewUrl }: Props): JSX.Element {
  const ports = usePortsStore((s) => s.ports);
  const activeUrl = usePortsStore((s) => s.activeUrl);
  const mode = usePortsStore((s) => s.mode);
  const productionUrl = usePortsStore((s) => s.productionUrl);
  const setActiveUrl = usePortsStore((s) => s.setActiveUrl);
  const setMode = usePortsStore((s) => s.setMode);
  const setProductionUrl = usePortsStore((s) => s.setProductionUrl);
  const removePort = usePortsStore((s) => s.removePort);

  const [prodInput, setProdInput] = useState(productionUrl);
  useEffect(() => setProdInput(productionUrl), [productionUrl]);

  const targetUrl = mode === 'production' ? productionUrl : activeUrl;

  const openExternal = useCallback(() => {
    if (webviewUrl) void window.api.ports.openExternal(webviewUrl);
  }, [webviewUrl]);

  return (
    <header className="flex h-9 shrink-0 flex-col gap-1 border-b border-border bg-bg-subtle px-2 py-1">
      <div className="flex items-center gap-1">
        <div className="flex shrink-0 overflow-hidden rounded border border-border">
          <button
            type="button"
            onClick={() => setMode('local')}
            className={[
              'px-2 py-0.5 text-[10px] uppercase tracking-wider',
              mode === 'local' ? 'bg-accent/20 text-text' : 'text-text-muted hover:bg-bg/40',
            ].join(' ')}
          >
            Local
          </button>
          <button
            type="button"
            onClick={() => setMode('production')}
            className={[
              'border-l border-border px-2 py-0.5 text-[10px] uppercase tracking-wider',
              mode === 'production' ? 'bg-accent/20 text-text' : 'text-text-muted hover:bg-bg/40',
            ].join(' ')}
          >
            Produção
          </button>
        </div>

        {mode === 'local' ? (
          <select
            value={activeUrl ?? ''}
            onChange={(e) => setActiveUrl(e.target.value || null)}
            className="min-w-0 flex-1 rounded border border-border bg-bg px-2 py-0.5 text-xs text-text"
          >
            <option value="">
              {ports.length === 0 ? 'Nenhuma porta detectada' : 'Selecione uma porta…'}
            </option>
            {ports.map((p) => (
              <option key={p.url} value={p.url}>
                :{p.port} — {p.url}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={prodInput}
            onChange={(e) => setProdInput(e.target.value)}
            onBlur={() => setProductionUrl(prodInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setProductionUrl(prodInput);
            }}
            placeholder="https://app.exemplo.com.br"
            className="min-w-0 flex-1 rounded border border-border bg-bg px-2 py-0.5 text-xs text-text placeholder:text-text-subtle"
          />
        )}

        <button
          type="button"
          onClick={onReload}
          disabled={!targetUrl}
          title="Recarregar"
          className="rounded border border-border px-2 py-0.5 text-[10px] uppercase text-text-muted hover:bg-bg-subtle hover:text-text disabled:opacity-50"
        >
          ↻
        </button>
        <button
          type="button"
          onClick={openExternal}
          disabled={!webviewUrl}
          title="Abrir no navegador externo"
          className="rounded border border-border px-2 py-0.5 text-[10px] uppercase text-text-muted hover:bg-bg-subtle hover:text-text disabled:opacity-50"
        >
          ↗
        </button>
        {mode === 'local' && activeUrl && (
          <button
            type="button"
            onClick={() => removePort(activeUrl)}
            title="Dispensar porta"
            className="rounded border border-border px-2 py-0.5 text-[10px] uppercase text-text-muted hover:bg-bg-subtle hover:text-text"
          >
            ×
          </button>
        )}
      </div>
    </header>
  );
}
