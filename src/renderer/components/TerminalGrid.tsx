import React from 'react'
import TerminalPane from './TerminalPane'
import LayoutSwitcher from './LayoutSwitcher'
import { useWorkspaceStore } from '../store/workspaceStore'
import { PaneConfig, LayoutPreset } from '../types'

function getGridTemplate(preset: LayoutPreset): { cols: string; rows: string } {
  switch (preset) {
    case 1:
      return { cols: '1fr', rows: '1fr' }
    case '2v':
      return { cols: '1fr 1fr', rows: '1fr' }
    case 4:
      return { cols: '1fr 1fr', rows: '1fr 1fr' }
    case 6:
      return { cols: '1fr 1fr 1fr', rows: '1fr 1fr' }
    case 9:
      return { cols: '1fr 1fr 1fr', rows: '1fr 1fr 1fr' }
    default:
      return { cols: '1fr 1fr', rows: '1fr 1fr' }
  }
}

const TerminalGrid: React.FC = () => {
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const activePaneId = useWorkspaceStore((s) => s.activePaneId)

  if (workspaces.length === 0) return null

  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="grid-area" style={{ position: 'relative' }}>
        {workspaces.map((ws) => {
          const isActive = ws.id === activeId
          const { cols, rows } = getGridTemplate(ws.layout)
          const panes = ws.panes
          if (panes.length === 0) return null

          return (
            <div
              key={ws.id}
              className="grid-container"
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                gridTemplateColumns: cols,
                gridTemplateRows: rows,
                gridAutoFlow: 'row',
                display: isActive ? 'grid' : 'none'
              }}
            >
              {panes.map((pane: PaneConfig, idx: number) => (
                <div key={pane.id} style={{ minWidth: 0, minHeight: 0, display: 'flex' }}>
                  <TerminalPane
                    pane={pane}
                    paneIndex={idx + 1}
                    isActive={pane.id === activePaneId}
                    workspaceCwd={ws.cwd || ''}
                    paneCount={panes.length}
                    layout={ws.layout}
                  />
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <LayoutSwitcher />
    </div>
  )
}

export default TerminalGrid
