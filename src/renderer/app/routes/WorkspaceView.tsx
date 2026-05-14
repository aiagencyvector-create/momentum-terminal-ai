function Pane({ title, hint }: { title: string; hint: string }): JSX.Element {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-bg-panel">
      <header className="flex h-8 shrink-0 items-center border-b border-border px-3 text-xs uppercase tracking-wider text-text-subtle">
        {title}
      </header>
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-text-muted">
        {hint}
      </div>
    </section>
  );
}

export function WorkspaceView(): JSX.Element {
  return (
    <div className="grid h-full min-h-0 grid-cols-[260px_1fr_1fr] grid-rows-[1fr_240px] gap-2 p-2">
      <div className="row-span-2">
        <Pane title="Explorer" hint="Árvore de arquivos do workspace · M1" />
      </div>
      <div>
        <Pane title="Editor (Monaco)" hint="Abas de código com Monaco · M1" />
      </div>
      <div>
        <Pane title="Live Preview" hint="Webview com detecção automática de porta · M2" />
      </div>
      <div className="col-span-2">
        <Pane title="Terminais (xterm + node-pty)" hint="Grid de terminais Warp-style · M1" />
      </div>
    </div>
  );
}
