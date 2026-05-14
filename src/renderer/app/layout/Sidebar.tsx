export type Section = 'workspace' | 'brain' | 'studio' | 'debug' | 'testlab';

type Item = {
  id: Section;
  label: string;
  hint: string;
  icon: string;
};

const ITEMS: readonly Item[] = [
  { id: 'workspace', label: 'Workspace', hint: 'Explorer · Editor · Terminais · Preview', icon: '▣' },
  { id: 'brain', label: 'Main Brain', hint: 'Graph dos arquivos da LLM', icon: '◉' },
  { id: 'studio', label: 'Project Studio', hint: 'System design · Vibe coding', icon: '◈' },
  { id: 'debug', label: 'Debug Center', hint: 'Console · Network · Elements', icon: '◐' },
  { id: 'testlab', label: 'Test Lab', hint: 'Runner · Report · Coverage', icon: '◎' },
] as const;

type Props = {
  active: Section;
  onChange: (s: Section) => void;
};

export function Sidebar({ active, onChange }: Props): JSX.Element {
  return (
    <nav className="flex w-60 shrink-0 flex-col border-r border-border bg-bg-panel">
      <div className="px-4 py-4 text-[11px] uppercase tracking-widest text-text-subtle">
        Navegação
      </div>
      <ul className="flex flex-1 flex-col gap-1 px-2">
        {ITEMS.map((it) => {
          const isActive = it.id === active;
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => onChange(it.id)}
                className={[
                  'titlebar-nodrag w-full rounded-md px-3 py-2 text-left transition',
                  isActive
                    ? 'bg-accent/15 text-text ring-1 ring-accent/40'
                    : 'text-text-muted hover:bg-bg-subtle hover:text-text',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-accent">{it.icon}</span>
                  <span className="text-sm font-medium">{it.label}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-text-subtle">{it.hint}</div>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-border px-4 py-3 text-[11px] text-text-subtle">
        MVP em desenvolvimento · M0
      </div>
    </nav>
  );
}
