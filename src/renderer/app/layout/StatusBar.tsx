import type { Section } from './Sidebar';

const LABEL: Record<Section, string> = {
  workspace: 'Workspace',
  brain: 'Main Brain',
  studio: 'Project Studio',
  debug: 'Debug Center',
  testlab: 'Test Lab',
};

export function StatusBar({ section }: { section: Section }): JSX.Element {
  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-border bg-bg-panel px-3 text-[11px] text-text-subtle">
      <span>{LABEL[section]}</span>
      <span>pronto</span>
    </footer>
  );
}
