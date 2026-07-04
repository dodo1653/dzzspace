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

  const ws = workspaces.find((w) => w.id === activeId)
  if (!ws) return null

  const { cols, rows } = getGridTemplate(ws.layout)
  const panes = ws.panes

  if (panes.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12
      }}>
        No panes. Add one with Ctrl+Shift+N
      </div>
    )
  }

  return (
    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="grid-area">
        <div
          className="grid-container"
          style={{
            gridTemplateColumns: cols,
            gridTemplateRows: rows,
            gridAutoFlow: 'row'
          }}
        >
          {panes.map((pane: PaneConfig, idx: number) => (
            <div key={pane.id} style={{ minWidth: 0, minHeight: 0, display: 'flex' }}>
              <TerminalPane
                pane={pane}
                paneIndex={idx + 1}
                isActive={pane.id === activePaneId}
                workspaceCwd={ws.cwd || ''}
              />
            </div>
          ))}
        </div>
      </div>
      <LayoutSwitcher />
    </div>
  )
}

export default TerminalGrid
