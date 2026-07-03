import React from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'

const TitleBar: React.FC = () => {
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
            <svg width="5" height="5" viewBox="0 0 5 5" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8">
              <path d="M1 1l3 3M4 1l-3 3" />
            </svg>
          </button>
          <button className="title-bar-traffic-light minimize" onClick={handleMinimize}>
            <svg width="5" height="5" viewBox="0 0 5 5" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8">
              <path d="M1 2.5h3" />
            </svg>
          </button>
          <button className="title-bar-traffic-light maximize" onClick={handleMaximize}>
            <svg width="5" height="5" viewBox="0 0 5 5" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8">
              <rect x="0.5" y="0.5" width="4" height="4" rx="0.5" />
            </svg>
          </button>
        </div>
      ) : (
        <div style={{ width: '80px' }} />
      )}

      <div className="title-bar-title">
        {activeWs ? `dzzspace — ${activeWs.name}` : 'dzzspace'}
      </div>

      {!isMac ? (
        <div className="title-bar-windows-controls">
          <button onClick={handleMinimize}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 5h6" />
            </svg>
          </button>
          <button onClick={handleMaximize}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="1.5" y="1.5" width="7" height="7" rx="0.5" />
            </svg>
          </button>
          <button className="close-btn" onClick={handleClose}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 2l6 6M8 2l-6 6" />
            </svg>
          </button>
        </div>
      ) : (
        <div style={{ width: '80px' }} />
      )}
    </div>
  )
}

export default TitleBar
