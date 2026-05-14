import { create } from 'zustand';
import type { AppSettings } from '../../shared/brain-types';

type State = {
  settings: AppSettings | null;
  loaded: boolean;
};

type Actions = {
  load: () => Promise<void>;
  reload: () => Promise<void>;
};

export const useSettingsStore = create<State & Actions>((set) => ({
  settings: null,
  loaded: false,

  load: async () => {
    const s = await window.api.settings.get();
    set({ settings: s, loaded: true });
  },

  reload: async () => {
    const s = await window.api.settings.get();
    set({ settings: s });
  },
}));
