import type { StudioNodeKind } from '../../../shared/studio-types';

export type NodeStyle = {
  label: string;
  icon: string;
  color: string;
  border: string;
  background: string;
};

export const NODE_STYLES: Record<StudioNodeKind, NodeStyle> = {
  service: {
    label: 'Service',
    icon: '◆',
    color: '#7c5cff',
    border: 'border-violet-500/60',
    background: 'bg-violet-500/10',
  },
  database: {
    label: 'Database',
    icon: '⛁',
    color: '#22d3ee',
    border: 'border-cyan-500/60',
    background: 'bg-cyan-500/10',
  },
  queue: {
    label: 'Queue',
    icon: '⇉',
    color: '#fbbf24',
    border: 'border-amber-500/60',
    background: 'bg-amber-500/10',
  },
  frontend: {
    label: 'Frontend',
    icon: '◫',
    color: '#a3e635',
    border: 'border-lime-500/60',
    background: 'bg-lime-500/10',
  },
  external: {
    label: 'External API',
    icon: '↗',
    color: '#f472b6',
    border: 'border-pink-500/60',
    background: 'bg-pink-500/10',
  },
  worker: {
    label: 'Worker',
    icon: '⚙',
    color: '#60a5fa',
    border: 'border-blue-500/60',
    background: 'bg-blue-500/10',
  },
  storage: {
    label: 'Storage',
    icon: '▤',
    color: '#94a3b8',
    border: 'border-slate-400/60',
    background: 'bg-slate-500/10',
  },
};

export const NODE_KINDS: readonly StudioNodeKind[] = [
  'service',
  'frontend',
  'database',
  'storage',
  'queue',
  'worker',
  'external',
];
