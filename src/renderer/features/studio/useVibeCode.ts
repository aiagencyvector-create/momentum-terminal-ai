import { useCallback } from 'react';
import { useStudioStore } from '../../stores/studio';
import { NODE_STYLES } from './node-config';

function generatePrompt(designName: string, nodes: import('../../../shared/studio-types').StudioNode[], edges: import('../../../shared/studio-types').StudioEdge[]): string {
  const nodeLines = nodes.map((n) => {
    const style = NODE_STYLES[n.data.kind];
    const techPart = n.data.tech ? ` (${n.data.tech})` : '';
    const notesPart = n.data.notes ? ` — ${n.data.notes}` : '';
    return `- [${style.label}] ${n.data.label}${techPart}${notesPart}`;
  });

  const edgeLines = edges.map((e) => {
    const from = nodes.find((n) => n.id === e.source);
    const to = nodes.find((n) => n.id === e.target);
    if (!from || !to) return '';
    return `- ${from.data.label} -> ${to.data.label}${e.label ? ` (${e.label})` : ''}`;
  }).filter(Boolean);

  return [
    `Implemente o sistema "${designName}" com a seguinte arquitetura:`,
    '',
    'Componentes:',
    ...nodeLines,
    '',
    'Conexões:',
    ...(edgeLines.length > 0 ? edgeLines : ['(sem conexões definidas)']),
    '',
    'Sugira a estrutura de pastas e arquivos iniciais, depois implemente passo a passo. Pergunte antes de instalar dependências grandes.',
  ].join('\n');
}

type Options = {
  shellCommand?: 'claude' | 'codex';
};

export function useVibeCode() {
  const designName = useStudioStore((s) => s.currentName);
  const nodes = useStudioStore((s) => s.currentData.nodes);
  const edges = useStudioStore((s) => s.currentData.edges);

  return useCallback(
    async (terminalId: string, opts: Options = {}) => {
      const prompt = generatePrompt(designName, nodes, edges);
      const cmd = opts.shellCommand ?? 'claude';
      // Escape para passar como argumento entre aspas duplas
      const escaped = prompt.replace(/"/g, '\\"');
      const line = `${cmd} "${escaped}"\r`;
      await window.api.terminal.write(terminalId, line);
    },
    [designName, nodes, edges],
  );
}

export function buildPromptPreview(): string {
  const { currentName, currentData } = useStudioStore.getState();
  return generatePrompt(currentName, currentData.nodes, currentData.edges);
}
