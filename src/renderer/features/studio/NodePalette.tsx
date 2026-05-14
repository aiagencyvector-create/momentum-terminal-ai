import { useStudioStore } from '../../stores/studio';
import { NODE_KINDS, NODE_STYLES } from './node-config';
import type { StudioNodeKind } from '../../../shared/studio-types';

export function NodePalette(): JSX.Element {
  const setNodes = useStudioStore((s) => s.setNodes);
  const nodes = useStudioStore((s) => s.currentData.nodes);

  function addNode(kind: StudioNodeKind): void {
    const id = `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const offset = nodes.length * 30;
    setNodes([
      ...nodes,
      {
        id,
        type: 'studio',
        position: { x: 100 + offset, y: 100 + offset },
        data: { label: NODE_STYLES[kind].label, kind },
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="px-1 pb-1 text-[10px] uppercase tracking-wider text-text-subtle">
        Adicionar
      </div>
      {NODE_KINDS.map((kind) => {
        const style = NODE_STYLES[kind];
        return (
          <button
            key={kind}
            type="button"
            onClick={() => addNode(kind)}
            className="flex items-center gap-2 rounded border border-border bg-bg-panel px-2 py-1.5 text-xs text-text-muted hover:border-accent/40 hover:bg-bg-subtle hover:text-text"
          >
            <span style={{ color: style.color }}>{style.icon}</span>
            <span>{style.label}</span>
          </button>
        );
      })}
    </div>
  );
}
