import { useStudioStore } from '../../stores/studio';
import { NODE_STYLES } from './node-config';

export function NodeInspector(): JSX.Element {
  const selectedNodeId = useStudioStore((s) => s.selectedNodeId);
  const node = useStudioStore((s) =>
    s.currentData.nodes.find((n) => n.id === selectedNodeId) ?? null,
  );
  const updateNode = useStudioStore((s) => s.updateNode);
  const removeNode = useStudioStore((s) => s.removeNode);

  if (!node) {
    return (
      <div className="p-3 text-center text-xs text-text-subtle">
        Selecione um nó para editar.
      </div>
    );
  }

  const style = NODE_STYLES[node.data.kind];

  return (
    <div className="flex flex-col gap-3 p-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: style.color }} className="text-lg">
            {style.icon}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-text-subtle">
            {style.label}
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeNode(node.id)}
          className="rounded border border-border px-2 py-0.5 text-[10px] uppercase text-text-muted hover:bg-red-500/20 hover:text-red-300"
        >
          Remover
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle">Nome</span>
        <input
          type="text"
          value={node.data.label}
          onChange={(e) => updateNode(node.id, { label: e.target.value })}
          className="rounded border border-border bg-bg px-2 py-1 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle">Tech stack</span>
        <input
          type="text"
          value={node.data.tech ?? ''}
          onChange={(e) => updateNode(node.id, { tech: e.target.value })}
          placeholder="Ex: Next.js, Postgres, Redis"
          className="rounded border border-border bg-bg px-2 py-1 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle">Notas</span>
        <textarea
          rows={4}
          value={node.data.notes ?? ''}
          onChange={(e) => updateNode(node.id, { notes: e.target.value })}
          placeholder="O que esse nó faz, contratos, observações..."
          className="rounded border border-border bg-bg px-2 py-1 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </label>
    </div>
  );
}
