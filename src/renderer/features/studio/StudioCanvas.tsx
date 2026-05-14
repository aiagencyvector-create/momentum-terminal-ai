import { useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStudioStore } from '../../stores/studio';
import { StudioNodeView } from './StudioNode';

const nodeTypes = { studio: StudioNodeView };

export function StudioCanvas(): JSX.Element {
  const nodes = useStudioStore((s) => s.currentData.nodes);
  const edges = useStudioStore((s) => s.currentData.edges);
  const setNodes = useStudioStore((s) => s.setNodes);
  const setEdges = useStudioStore((s) => s.setEdges);
  const setSelectedNode = useStudioStore((s) => s.setSelectedNode);

  const flowNodes = useMemo<Node[]>(() => nodes as unknown as Node[], [nodes]);
  const flowEdges = useMemo<Edge[]>(() => edges as unknown as Edge[], [edges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const next = applyNodeChanges(changes, flowNodes);
      setNodes(next as unknown as typeof nodes);
    },
    [flowNodes, setNodes, nodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const next = applyEdgeChanges(changes, flowEdges);
      setEdges(next as unknown as typeof edges);
    },
    [flowEdges, setEdges, edges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const next = addEdge(
        { ...connection, id: `e_${Date.now().toString(36)}` },
        flowEdges,
      );
      setEdges(next as unknown as typeof edges);
    },
    [flowEdges, setEdges, edges],
  );

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={(_e, n) => setSelectedNode(n.id)}
      onPaneClick={() => setSelectedNode(null)}
      proOptions={{ hideAttribution: true }}
      fitView
    >
      <Background color="#1c2230" gap={20} />
      <Controls className="!bg-bg-panel !border-border [&_button]:!bg-bg-panel [&_button]:!border-border [&_button]:!text-text-muted" />
    </ReactFlow>
  );
}
