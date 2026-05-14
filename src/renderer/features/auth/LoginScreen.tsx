import { useState } from 'react';
import { useAuthStore } from '../../stores/auth';
import { useSettingsStore } from '../../stores/settings';

type Props = {
  onOpenSettings: () => void;
};

export function LoginScreen({ onOpenSettings }: Props): JSX.Element {
  const signInWithOtp = useAuthStore((s) => s.signInWithOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const loading = useAuthStore((s) => s.loading);
  const settings = useSettingsStore((s) => s.settings);

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const needsConfig = !settings?.supabaseUrl || !settings?.supabaseAnonKey;

  async function sendCode(): Promise<void> {
    setError(null);
    setMessage(null);
    try {
      await signInWithOtp(email.trim());
      setStage('code');
      setMessage('Código enviado pro seu email. Cole abaixo.');
    } catch (e) {
      setError(String(e));
    }
  }

  async function confirmCode(): Promise<void> {
    setError(null);
    try {
      await verifyOtp(email.trim(), token.trim());
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-bg p-6">
      <div className="w-full max-w-sm rounded-md border border-border bg-bg-panel p-6">
        <div className="mb-6 text-center">
          <div className="text-xl text-text">Momentum Terminal AI</div>
          <div className="mt-1 text-xs text-text-muted">Entre para acessar o Main Brain</div>
        </div>

        {needsConfig ? (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm text-text-muted">
              Antes de fazer login, configure as credenciais do Supabase em Configurações.
            </p>
            <button
              type="button"
              onClick={onOpenSettings}
              className="rounded bg-accent px-3 py-2 text-xs uppercase tracking-wider text-accent-fg hover:opacity-90"
            >
              Abrir Configurações
            </button>
          </div>
        ) : stage === 'email' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendCode();
            }}
            className="flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-text-subtle">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com"
                className="rounded border border-border bg-bg px-2 py-1.5 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
            <button
              type="submit"
              disabled={loading || !email}
              className="rounded bg-accent px-3 py-2 text-xs uppercase tracking-wider text-accent-fg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Enviando…' : 'Enviar código por email'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void confirmCode();
            }}
            className="flex flex-col gap-3"
          >
            <div className="text-xs text-text-muted">
              Enviei o código para <span className="text-text">{email}</span>.
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-text-subtle">Código</span>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="6 dígitos"
                inputMode="numeric"
                className="rounded border border-border bg-bg px-2 py-1.5 text-center font-mono text-lg tracking-widest text-text focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
            <button
              type="submit"
              disabled={loading || token.length < 6}
              className="rounded bg-accent px-3 py-2 text-xs uppercase tracking-wider text-accent-fg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Verificando…' : 'Entrar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStage('email');
                setToken('');
                setError(null);
              }}
              className="text-xs text-text-muted hover:text-text"
            >
              ← Trocar email
            </button>
          </form>
        )}

        {message && <div className="mt-3 text-center text-xs text-accent">{message}</div>}
        {error && (
          <div className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-center text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[11px] text-text-subtle hover:text-text-muted"
          >
            Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
