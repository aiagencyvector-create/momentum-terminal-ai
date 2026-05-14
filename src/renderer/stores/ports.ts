import { create } from 'zustand';
import type { DetectedPort } from '../../shared/port-patterns';

type State = {
  ports: DetectedPort[];
  activeUrl: string | null;
  productionUrl: string;
  mode: 'local' | 'production';
  autoOpen: boolean;
};

type Actions = {
  setPorts: (ports: DetectedPort[]) => void;
  addPort: (port: DetectedPort) => void;
  removePort: (url: string) => void;
  setActiveUrl: (url: string | null) => void;
  setProductionUrl: (url: string) => void;
  setMode: (mode: 'local' | 'production') => void;
  setAutoOpen: (auto: boolean) => void;
};

export const usePortsStore = create<State & Actions>((set, get) => ({
  ports: [],
  activeUrl: null,
  productionUrl: '',
  mode: 'local',
  autoOpen: true,

  setPorts: (ports) => set({ ports }),

  addPort: (port) => {
    const exists = get().ports.find((p) => p.url === port.url);
    if (exists) return;
    const updated = [port, ...get().ports];
    const shouldAutoSet = get().autoOpen && get().activeUrl === null && get().mode === 'local';
    set({
      ports: updated,
      activeUrl: shouldAutoSet ? port.url : get().activeUrl,
    });
  },

  removePort: (url) =>
    set({
      ports: get().ports.filter((p) => p.url !== url),
      activeUrl: get().activeUrl === url ? null : get().activeUrl,
    }),

  setActiveUrl: (url) => set({ activeUrl: url }),
  setProductionUrl: (url) => set({ productionUrl: url }),
  setMode: (mode) => set({ mode }),
  setAutoOpen: (autoOpen) => set({ autoOpen }),
}));
