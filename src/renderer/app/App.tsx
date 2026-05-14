import { useEffect, useState } from 'react';
import { Sidebar, type Section } from './layout/Sidebar';
import { StatusBar } from './layout/StatusBar';
import { WorkspaceView } from './routes/WorkspaceView';
import { BrainView } from './routes/BrainView';
import { StudioView } from './routes/StudioView';
import { DebugView } from './routes/DebugView';
import { TestLabView } from './routes/TestLabView';
import { LoginScreen } from '../features/auth/LoginScreen';
import { SettingsModal } from '../features/settings/SettingsModal';
import { useAuthStore } from '../stores/auth';
import { useSettingsStore } from '../stores/settings';

export function App(): JSX.Element {
  const [section, setSection] = useState<Section>('workspace');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settings = useSettingsStore((s) => s.settings);
  const loadSettings = useSettingsStore((s) => s.load);
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings?.supabaseUrl && settings.supabaseAnonKey) {
      void initialize(settings.supabaseUrl, settings.supabaseAnonKey);
    }
  }, [settings?.supabaseUrl, settings?.supabaseAnonKey, initialize]);

  const authReady = Boolean(settings?.supabaseUrl && settings?.supabaseAnonKey);

  if (!authReady || (initialized && !user)) {
    return (
      <>
        <LoginScreen onOpenSettings={() => setSettingsOpen(true)} />
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </>
    );
  }

  return (
    <div className="flex h-full flex-col bg-bg text-text">
      <div className="titlebar-drag flex h-9 shrink-0 items-center justify-between border-b border-border bg-bg-panel px-3 text-xs text-text-muted">
        <span>Momentum Terminal AI</span>
        <span className="titlebar-nodrag flex items-center gap-2">
          <span className="text-text-subtle">{user?.email}</span>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded border border-border px-2 py-0.5 text-[10px] uppercase hover:bg-bg-subtle hover:text-text"
          >
            Settings
          </button>
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <Sidebar active={section} onChange={setSection} />
        <main className="flex min-w-0 flex-1 flex-col">
          {section === 'workspace' && <WorkspaceView />}
          {section === 'brain' && <BrainView />}
          {section === 'studio' && <StudioView />}
          {section === 'debug' && <DebugView />}
          {section === 'testlab' && <TestLabView />}
        </main>
      </div>
      <StatusBar section={section} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
