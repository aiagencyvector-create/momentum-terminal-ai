export function TestLabView(): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <div className="text-2xl text-text">Test Lab</div>
      <p className="max-w-md text-sm text-text-muted">
        Runner unificado: detecta scripts do package.json, executa em PTY dedicado, mostra árvore de
        resultados e coverage. Implementação na fase M5.
      </p>
    </div>
  );
}
