export function DebugView(): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <div className="text-2xl text-text">Debug Center</div>
      <p className="max-w-md text-sm text-text-muted">
        Console, Network e Elements embarcados — sem precisar abrir F12 em outra janela.
        Implementação na fase M5.
      </p>
    </div>
  );
}
