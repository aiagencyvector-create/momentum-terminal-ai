import { create } from 'zustand';
import type { StudioDesign, StudioDesignData, StudioNode, StudioEdge } from '../../shared/studio-types';

type State = {
  designs: StudioDesign[];
  currentName: string;
  currentData: StudioDesignData;
  selectedNodeId: string | null;
  dirty: boolean;
};

type Actions = {
  setDesigns: (designs: StudioDesign[]) => void;
  loadDesign: (design: StudioDesign) => void;
  newDesign: (name: string) => void;
  setNodes: (nodes: StudioNode[]) => void;
  setEdges: (edges: StudioEdge[]) => void;
  updateNode: (id: string, patch: Partial<StudioNode['data']>) => void;
  removeNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  markClean: () => void;
};

export const useStudioStore = create<State & Actions>((set, get) => ({
  designs: [],
  currentName: 'Untitled',
  currentData: { nodes: [], edges: [] },
  selectedNodeId: null,
  dirty: false,

  setDesigns: (designs) => set({ designs }),

  loadDesign: (design) =>
    set({
      currentName: design.name,
      currentData: design.data,
      selectedNodeId: null,
      dirty: false,
    }),

  newDesign: (name) =>
    set({
      currentName: name,
      currentData: { nodes: [], edges: [] },
      selectedNodeId: null,
      dirty: true,
    }),

  setNodes: (nodes) =>
    set({ currentData: { ...get().currentData, nodes }, dirty: true }),

  setEdges: (edges) =>
    set({ currentData: { ...get().currentData, edges }, dirty: true }),

  updateNode: (id, patch) =>
    set({
      currentData: {
        ...get().currentData,
        nodes: get().currentData.nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      },
      dirty: true,
    }),

  removeNode: (id) =>
    set({
      currentData: {
        nodes: get().currentData.nodes.filter((n) => n.id !== id),
        edges: get().currentData.edges.filter((e) => e.source !== id && e.target !== id),
      },
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      dirty: true,
    }),

  setSelectedNode: (id) => set({ selectedNodeId: id }),
  markClean: () => set({ dirty: false }),
}));
