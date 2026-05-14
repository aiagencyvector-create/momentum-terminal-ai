import { create } from 'zustand';
import type { PackageScript, TestResult, TestRunUpdate } from '../../shared/testlab-types';

type State = {
  scripts: PackageScript[];
  loadingScripts: boolean;
  currentRunId: string | null;
  output: string;
  results: TestResult[];
  summary: { pass: number; fail: number; skip: number } | null;
  exitCode: number | null;
};

type Actions = {
  loadScripts: (workspacePath: string) => Promise<void>;
  startRun: (workspacePath: string, script: string) => Promise<void>;
  handleUpdate: (update: TestRunUpdate) => void;
  cancel: () => Promise<void>;
  clear: () => void;
};

export const useTestLabStore = create<State & Actions>((set, get) => ({
  scripts: [],
  loadingScripts: false,
  currentRunId: null,
  output: '',
  results: [],
  summary: null,
  exitCode: null,

  loadScripts: async (workspacePath) => {
    set({ loadingScripts: true });
    try {
      const scripts = await window.api.testlab.listScripts(workspacePath);
      set({ scripts });
    } finally {
      set({ loadingScripts: false });
    }
  },

  startRun: async (workspacePath, script) => {
    set({ output: '', results: [], summary: null, exitCode: null });
    const { runId } = await window.api.testlab.run({ workspacePath, script });
    set({ currentRunId: runId });
  },

  handleUpdate: (update) => {
    if (update.runId !== get().currentRunId) return;
    if (update.type === 'data') {
      set({ output: get().output + update.chunk });
    } else if (update.type === 'result') {
      set({ results: [...get().results, update.result] });
    } else if (update.type === 'summary') {
      set({
        summary: { pass: update.pass, fail: update.fail, skip: update.skip },
      });
    } else if (update.type === 'exit') {
      set({ exitCode: update.exitCode, currentRunId: null });
    }
  },

  cancel: async () => {
    const id = get().currentRunId;
    if (id) {
      await window.api.testlab.cancel(id);
      set({ currentRunId: null });
    }
  },

  clear: () =>
    set({ output: '', results: [], summary: null, exitCode: null, currentRunId: null }),
}));
