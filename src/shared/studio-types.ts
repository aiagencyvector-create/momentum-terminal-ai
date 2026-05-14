export type StudioNodeKind =
  | 'service'
  | 'database'
  | 'queue'
  | 'frontend'
  | 'external'
  | 'worker'
  | 'storage';

export type StudioNodeData = {
  label: string;
  kind: StudioNodeKind;
  tech?: string;
  notes?: string;
  brainDocumentIds?: string[];
};

export type StudioNode = {
  id: string;
  type: 'studio';
  position: { x: number; y: number };
  data: StudioNodeData;
};

export type StudioEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
};

export type StudioDesignData = {
  nodes: StudioNode[];
  edges: StudioEdge[];
};

export type StudioDesign = {
  id: string;
  name: string;
  data: StudioDesignData;
  created_at: string;
  updated_at: string;
};
