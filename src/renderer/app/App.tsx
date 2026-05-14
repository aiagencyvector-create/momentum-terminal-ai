import { useEffect, useState } from 'react';
import { Sidebar, type Section } from './layout/Sidebar';
import { StatusBar } from './layout/StatusBar';
import { WorkspaceView } from './routes/WorkspaceView';
import { BrainView } from './routes/BrainView';
import { StudioView } from './routes/StudioView';
import { DebugView } from './routes/DebugView';
import { TestLabView } from './routes/TestLabView';

export function App(): JSX.Element {
  const [section, setSection] = useState<Section>('workspace');
  const [version, setVersion] = useState<string>('—');
  const [platform, setPlatform] = useState<string>('—');

  useEffect(() => {
    window.api.app.getVersion().then(setVersion).catch(() => undefined);
    window.api.app.getPlatform().then(setPlatform).catch(() => undefined);
  }, []);

  return (
    <div className="flex h-full flex-col bg-bg text-text">
      <div className="titlebar-drag flex h-9 shrink-0 items-center justify-center border-b border-border bg-bg-panel text-xs text-text-muted">
        Momentum Terminal AI · v{version} · {platform}
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
    </div>
  );
}
