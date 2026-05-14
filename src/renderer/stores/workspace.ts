import { create } from 'zustand';

export type OpenTab = {
  path: string;
  content: string;
  dirty: boolean;
};

type State = {
  rootPath: string | null;
  tabs: OpenTab[];
  activeTabPath: string | null;
};

type Actions = {
  setRoot: (path: string | null) => void;
  openTab: (path: string, content: string) => void;
  closeTab: (path: string) => void;
  setActiveTab: (path: string) => void;
  updateTabContent: (path: string, content: string) => void;
  markTabClean: (path: string) => void;
};

export const useWorkspaceStore = create<State & Actions>((set, get) => ({
  rootPath: null,
  tabs: [],
  activeTabPath: null,

  setRoot: (path) => set({ rootPath: path }),

  openTab: (path, content) => {
    const existing = get().tabs.find((t) => t.path === path);
    if (existing) {
      set({ activeTabPath: path });
      return;
    }
    set({
      tabs: [...get().tabs, { path, content, dirty: false }],
      activeTabPath: path,
    });
  },

  closeTab: (path) => {
    const tabs = get().tabs.filter((t) => t.path !== path);
    const active = get().activeTabPath;
    set({
      tabs,
      activeTabPath: active === path ? (tabs[tabs.length - 1]?.path ?? null) : active,
    });
  },

  setActiveTab: (path) => set({ activeTabPath: path }),

  updateTabContent: (path, content) =>
    set({
      tabs: get().tabs.map((t) => (t.path === path ? { ...t, content, dirty: true } : t)),
    }),

  markTabClean: (path) =>
    set({
      tabs: get().tabs.map((t) => (t.path === path ? { ...t, dirty: false } : t)),
    }),
}));
