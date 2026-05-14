import { useCallback, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useWorkspaceStore } from '../../stores/workspace';

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === 'json') return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });

function languageFromPath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'javascript';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.scss')) return 'scss';
  if (lower.endsWith('.html')) return 'html';
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.go')) return 'go';
  if (lower.endsWith('.rs')) return 'rust';
  if (lower.endsWith('.sh')) return 'shell';
  if (lower.endsWith('.sql')) return 'sql';
  return 'plaintext';
}

function basename(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] ?? path;
}

export function MonacoPane(): JSX.Element {
  const tabs = useWorkspaceStore((s) => s.tabs);
  const activeTabPath = useWorkspaceStore((s) => s.activeTabPath);
  const closeTab = useWorkspaceStore((s) => s.closeTab);
  const setActiveTab = useWorkspaceStore((s) => s.setActiveTab);
  const updateTabContent = useWorkspaceStore((s) => s.updateTabContent);
  const markTabClean = useWorkspaceStore((s) => s.markTabClean);

  const activeTab = tabs.find((t) => t.path === activeTabPath) ?? null;

  const saveActive = useCallback(async () => {
    if (!activeTab) return;
    await window.api.fs.writeFile(activeTab.path, activeTab.content);
    markTabClean(activeTab.path);
  }, [activeTab, markTabClean]);

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveActive();
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [saveActive]);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-bg-panel">
      <header className="flex h-8 shrink-0 items-center gap-1 overflow-x-auto border-b border-border bg-bg-subtle px-1">
        {tabs.length === 0 && (
          <span className="px-2 text-[11px] uppercase tracking-wider text-text-subtle">
            Editor
          </span>
        )}
        {tabs.map((t) => {
          const isActive = t.path === activeTabPath;
          return (
            <div
              key={t.path}
              className={[
                'group flex shrink-0 items-center gap-1 rounded-t-md border-x border-t px-2 py-1 text-xs',
                isActive
                  ? 'border-border bg-bg-panel text-text'
                  : 'border-transparent text-text-muted hover:bg-bg/40',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => setActiveTab(t.path)}
                className="max-w-[180px] truncate"
                title={t.path}
              >
                {basename(t.path)}
                {t.dirty && <span className="ml-1 text-accent">●</span>}
              </button>
              <button
                type="button"
                onClick={() => closeTab(t.path)}
                className="rounded px-1 text-text-subtle hover:bg-bg-subtle hover:text-text"
                title="Fechar aba"
              >
                ×
              </button>
            </div>
          );
        })}
      </header>
      <div className="flex-1">
        {!activeTab ? (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            Nenhum arquivo aberto. Clique num arquivo no Explorer.
          </div>
        ) : (
          <Editor
            key={activeTab.path}
            theme="vs-dark"
            language={languageFromPath(activeTab.path)}
            path={activeTab.path}
            value={activeTab.content}
            onChange={(value) => updateTabContent(activeTab.path, value ?? '')}
            options={{
              fontSize: 13,
              fontFamily: 'JetBrains Mono, Consolas, monospace',
              minimap: { enabled: false },
              automaticLayout: true,
              tabSize: 2,
              renderWhitespace: 'selection',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        )}
      </div>
    </section>
  );
}
