import React from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { IconSidebar } from './icons'
import { playClick } from '../utils/sound'

interface TitleBarProps {
  onToggleSidebar: () => void
  sidebarVisible: boolean
}

const TitleBar: React.FC<TitleBarProps> = ({ onToggleSidebar, sidebarVisible }) => {
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const activeWs = workspaces.find((w) => w.id === activeId)
  const isMac = window.dzz?.platform === 'darwin'

  const handleMinimize = () => window.dzz?.window.minimize()
  const handleMaximize = () => window.dzz?.window.maximize()
  const handleClose = () => window.dzz?.window.close()

  return (
    <div className="title-bar">
      {isMac ? (
        <div className="title-bar-traffic-lights">
          <button className="title-bar-traffic-light close" onClick={handleClose}>
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" strokeLinecap="round">
              <path d="M1.5 1.5l3 3M4.5 1.5l-3 3" />
            </svg>
          </button>
          <button className="title-bar-traffic-light minimize" onClick={() => { handleMinimize(); playClick() }}>
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" strokeLinecap="round">
              <path d="M1.5 3h3" />
            </svg>
          </button>
          <button className="title-bar-traffic-light maximize" onClick={() => { handleMaximize(); playClick() }}>
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" strokeLinecap="round">
              <rect x="1" y="1" width="4" height="4" rx="0.5" />
            </svg>
          </button>
        </div>
      ) : (
        <div style={{ width: '90px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => { onToggleSidebar(); playClick() }}
            style={{
              padding: 5,
              borderRadius: 5,
              color: sidebarVisible ? 'var(--muted)' : 'var(--dim)',
              display: 'flex',
              transition: 'color 0.12s ease, background 0.12s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            title="Toggle sidebar"
          >
            <IconSidebar size={13} />
          </button>
        </div>
      )}

      <div className="title-bar-title">
        {activeWs ? `${activeWs.name}` : 'dzzspace'}
      </div>

      {!isMac ? (
        <div className="title-bar-windows-controls">
          <button onClick={() => { handleMinimize(); playClick() }}>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M2.5 6h7" />
            </svg>
          </button>
          <button onClick={() => { handleMaximize(); playClick() }}>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <rect x="2" y="2" width="8" height="8" rx="0.5" />
            </svg>
          </button>
          <button className="close-btn" onClick={() => { handleClose(); playClick() }}>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        </div>
      ) : (
        <div style={{ width: '90px' }} />
      )}
    </div>
  )
}

export default TitleBar
