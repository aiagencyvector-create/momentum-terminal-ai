import { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { BrainDocument, BrainEdge } from '../../../shared/brain-types';

function DocumentNode({ data }: { data: { title: string; tags: string[] } }): JSX.Element {
  return (
    <div className="min-w-[180px] max-w-[260px] rounded-md border border-border bg-bg-panel p-2 text-xs text-text shadow-md">
      <div className="line-clamp-2 font-medium text-text">{data.title}</div>
      {data.tags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {data.tags.slice(0, 4).map((t) => (
            <span key={t} className="rounded bg-accent/20 px-1 text-[10px] text-text-muted">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { doc: DocumentNode };

type Props = {
  documents: BrainDocument[];
  edges: BrainEdge[];
  onNodeClick?: (id: string) => void;
};

export function BrainGraph({ documents, edges, onNodeClick }: Props): JSX.Element {
  const nodes = useMemo<Node[]>(() => {
    const cols = Math.max(1, Math.ceil(Math.sqrt(documents.length)));
    return documents.map((d, i) => ({
      id: d.id,
      type: 'doc',
      data: { title: d.title, tags: d.tags },
      position: { x: (i % cols) * 280, y: Math.floor(i / cols) * 120 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));
  }, [documents]);

  const flowEdges = useMemo<Edge[]>(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.from_id,
        target: e.to_id,
        label: e.relation ?? '',
        animated: false,
        style: { stroke: '#3a4458' },
      })),
    [edges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={flowEdges}
      nodeTypes={nodeTypes}
      fitView
      proOptions={{ hideAttribution: true }}
      onNodeClick={(_e, n) => onNodeClick?.(n.id)}
    >
      <Background color="#1c2230" gap={20} />
      <Controls className="!bg-bg-panel !border-border [&_button]:!bg-bg-panel [&_button]:!border-border [&_button]:!text-text-muted" />
    </ReactFlow>
  );
}
