import { useEffect, useRef, useState } from 'react';
import { usePortsStore } from '../../stores/ports';
import { PreviewBar } from './PreviewBar';

type WebviewElement = HTMLElement & {
  src: string;
  reload: () => void;
  getURL: () => string;
};

export function LivePreview(): JSX.Element {
  const ports = usePortsStore((s) => s.ports);
  const activeUrl = usePortsStore((s) => s.activeUrl);
  const mode = usePortsStore((s) => s.mode);
  const productionUrl = usePortsStore((s) => s.productionUrl);
  const setPorts = usePortsStore((s) => s.setPorts);
  const addPort = usePortsStore((s) => s.addPort);

  const webviewRef = useRef<WebviewElement | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetUrl = mode === 'production' ? (productionUrl || null) : activeUrl;

  useEffect(() => {
    void window.api.ports.list().then((p) => setPorts(p));
    const off = window.api.ports.onDetected((port) => addPort(port));
    return off;
  }, [setPorts, addPort]);

  useEffect(() => {
    const wv = webviewRef.current;
    if (!wv) return;
    const onStart = () => {
      setLoading(true);
      setError(null);
    };
    const onStop = () => setLoading(false);
    const onFail = (e: Event) => {
      const detail = e as unknown as { errorDescription?: string; errorCode?: number };
      if (detail.errorCode && detail.errorCode <= -100) {
        setError(detail.errorDescription ?? 'Falha ao carregar');
      }
      setLoading(false);
    };
    const onNav = () => {
      try {
        setCurrentUrl(wv.getURL());
      } catch {
        // ignore
      }
    };
    wv.addEventListener('did-start-loading', onStart);
    wv.addEventListener('did-stop-loading', onStop);
    wv.addEventListener('did-fail-load', onFail);
    wv.addEventListener('did-navigate', onNav);
    wv.addEventListener('did-navigate-in-page', onNav);
    return () => {
      wv.removeEventListener('did-start-loading', onStart);
      wv.removeEventListener('did-stop-loading', onStop);
      wv.removeEventListener('did-fail-load', onFail);
      wv.removeEventListener('did-navigate', onNav);
      wv.removeEventListener('did-navigate-in-page', onNav);
    };
  }, [targetUrl]);

  useEffect(() => {
    if (!targetUrl) {
      setCurrentUrl(null);
      return;
    }
    const wv = webviewRef.current;
    if (wv && wv.src !== targetUrl) {
      wv.src = targetUrl;
    }
  }, [targetUrl]);

  const reload = () => {
    const wv = webviewRef.current;
    if (wv) wv.reload();
  };

  return (
    <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-bg-panel">
      <PreviewBar onReload={reload} webviewUrl={currentUrl} />
      <div className="relative flex-1 overflow-hidden bg-white">
        {!targetUrl ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-bg p-6 text-center text-sm text-text-muted">
            <div className="text-text">Live Preview</div>
            <div>
              {mode === 'local'
                ? ports.length === 0
                  ? 'Inicie um servidor (ex: pnpm dev) no terminal. A porta será detectada automaticamente.'
                  : 'Selecione uma porta detectada na barra acima.'
                : 'Configure a URL de produção na barra acima.'}
            </div>
          </div>
        ) : (
          <>
            <webview
              ref={webviewRef as unknown as React.LegacyRef<HTMLWebViewElement>}
              src={targetUrl}
              partition="persist:preview"
              style={{ width: '100%', height: '100%' }}
            />
            {loading && (
              <div className="absolute right-2 top-2 rounded bg-bg/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-muted backdrop-blur">
                carregando…
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-bg/95 p-6 text-center text-sm text-red-400">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
