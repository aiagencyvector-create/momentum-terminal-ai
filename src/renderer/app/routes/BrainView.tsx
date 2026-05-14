export function BrainView(): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <div className="text-2xl text-text">Main Brain</div>
      <p className="max-w-md text-sm text-text-muted">
        Visualização em grafo dos arquivos da LLM da empresa, com busca semântica via Supabase +
        pgvector. Implementação na fase M3.
      </p>
    </div>
  );
}
