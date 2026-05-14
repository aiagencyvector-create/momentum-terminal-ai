import { Handle, Position, type NodeProps } from 'reactflow';
import type { StudioNodeData } from '../../../shared/studio-types';
import { NODE_STYLES } from './node-config';

export function StudioNodeView({ data, selected }: NodeProps<StudioNodeData>): JSX.Element {
  const style = NODE_STYLES[data.kind];
  return (
    <div
      className={[
        'min-w-[160px] max-w-[240px] rounded-md border-2 px-3 py-2 text-xs shadow-md transition',
        style.border,
        style.background,
        selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : '',
      ].join(' ')}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-accent" />
      <div className="flex items-center gap-2">
        <span style={{ color: style.color }} className="text-base">
          {style.icon}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-text-subtle">{style.label}</span>
      </div>
      <div className="mt-1 truncate font-medium text-text">{data.label || '(sem nome)'}</div>
      {data.tech && (
        <div className="mt-0.5 truncate text-[11px] text-text-muted">{data.tech}</div>
      )}
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-accent" />
    </div>
  );
}
