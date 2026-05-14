import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FileTree } from '../../features/explorer/FileTree';
import { MonacoPane } from '../../features/editor/MonacoPane';
import { TerminalTabs } from '../../features/terminal/TerminalTabs';
import { LivePreview } from '../../features/preview/LivePreview';

function Handle({ vertical = false }: { vertical?: boolean }): JSX.Element {
  return (
    <PanelResizeHandle
      className={
        vertical
          ? 'h-1 cursor-row-resize bg-transparent hover:bg-accent/40 data-[resize-handle-active]:bg-accent'
          : 'w-1 cursor-col-resize bg-transparent hover:bg-accent/40 data-[resize-handle-active]:bg-accent'
      }
    />
  );
}

export function WorkspaceView(): JSX.Element {
  return (
    <div className="h-full min-h-0 p-1">
      <PanelGroup direction="horizontal" autoSaveId="workspace-horizontal-v2">
        <Panel defaultSize={16} minSize={10}>
          <FileTree />
        </Panel>
        <Handle />
        <Panel defaultSize={50} minSize={30}>
          <PanelGroup direction="vertical" autoSaveId="workspace-vertical-v2">
            <Panel defaultSize={65} minSize={20}>
              <MonacoPane />
            </Panel>
            <Handle vertical />
            <Panel defaultSize={35} minSize={15}>
              <TerminalTabs />
            </Panel>
          </PanelGroup>
        </Panel>
        <Handle />
        <Panel defaultSize={34} minSize={20}>
          <LivePreview />
        </Panel>
      </PanelGroup>
    </div>
  );
}
