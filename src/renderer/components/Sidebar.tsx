import React from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { IconArrowLeft, IconGrid } from './icons'

const Sidebar: React.FC = () => {
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const selectWorkspace = useWorkspaceStore((s) => s.selectWorkspace)
  const goBackToLanding = useWorkspaceStore((s) => s.goBackToLanding)

  return (
    <div style={{
      width: 200,
      background: 'rgba(10,10,15,0.6)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--dim)'
        }}>
          Workspaces
        </span>
        <button
          onClick={goBackToLanding}
          style={{
            padding: 4,
            borderRadius: 4,
            color: 'var(--dim)',
            transition: 'color 0.15s ease, background 0.15s ease',
            display: 'flex'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--muted)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--dim)'
            e.currentTarget.style.background = 'transparent'
          }}
          title="Back to workspace selection"
        >
          <IconArrowLeft />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => selectWorkspace(ws.id)}
            style={{
              padding: '8px 14px',
              cursor: 'pointer',
              background: ws.id === activeId ? 'rgba(245,158,11,0.06)' : 'transparent',
              borderLeft: ws.id === activeId ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (ws.id !== activeId) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              }
            }}
            onMouseLeave={(e) => {
              if (ws.id !== activeId) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 500,
              color: ws.id === activeId ? 'var(--text)' : 'var(--muted)',
              letterSpacing: '0.02em',
              marginBottom: 2
            }}>
              {ws.name}
            </div>
            <div style={{
              fontSize: 10,
              color: 'var(--dim)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <IconGrid />
              {ws.panes.length} panes
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
