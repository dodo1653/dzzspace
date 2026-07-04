import React from 'react'
import { IconSidebar } from './icons'
import { playClick, playWindowClose } from '../utils/sound'

interface TitleBarProps {
  onToggleSidebar: () => void
  sidebarVisible: boolean
  showSidebarToggle?: boolean
}

const TitleBar: React.FC<TitleBarProps> = ({ onToggleSidebar, sidebarVisible, showSidebarToggle = true }) => {
  const isMac = window.dzz?.platform === 'darwin'

  const handleMinimize = () => window.dzz?.window.minimize()
  const handleMaximize = () => window.dzz?.window.maximize()
  const handleClose = () => { handleClose_(); playWindowClose() }
  function handleClose_() { window.dzz?.window.close() }

  return (
    <div className="title-bar">
      {isMac ? (
        <div className="title-bar-left">
          <div className="title-bar-traffic-lights">
            <button className="title-bar-traffic-light close" onClick={() => { handleClose_(); playWindowClose() }}>
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.9" strokeLinecap="round">
                <path d="M1.8 1.8l3.4 3.4M5.2 1.8l-3.4 3.4" />
              </svg>
            </button>
            <button className="title-bar-traffic-light minimize" onClick={handleMinimize}>
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.9" strokeLinecap="round">
                <path d="M1.5 3.5h4" />
              </svg>
            </button>
            <button className="title-bar-traffic-light maximize" onClick={handleMaximize}>
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.9" strokeLinecap="round">
                <rect x="1.2" y="1.2" width="4.6" height="4.6" rx="0.6" />
              </svg>
            </button>
          </div>
          <span className="title-bar-divider" />
          <div className="title-bar-app-icon" />
          {showSidebarToggle && (
            <button
              onClick={() => { onToggleSidebar(); playClick() }}
              className={`title-bar-toggle-btn ${sidebarVisible ? 'active' : ''}`}
              title="Toggle sidebar"
            >
              <IconSidebar size={15} />
            </button>
          )}
        </div>
      ) : (
        <div className="title-bar-left">
          <div className="title-bar-app-icon" style={{ marginLeft: 2 }} />
          {showSidebarToggle && (
            <button
              onClick={() => { onToggleSidebar(); playClick() }}
              className={`title-bar-toggle-btn ${sidebarVisible ? 'active' : ''}`}
              title="Toggle sidebar"
            >
              <IconSidebar size={15} />
            </button>
          )}
        </div>
      )}

      <div className="title-bar-center" />

      {!isMac ? (
        <div className="title-bar-right">
          <div className="title-bar-windows-controls">
            <button onClick={handleMinimize} title="Minimize">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square">
                <path d="M2 6h8" />
              </svg>
            </button>
            <button onClick={handleMaximize} title="Maximize">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square">
                <rect x="1.5" y="1.5" width="9" height="9" rx="0" />
              </svg>
            </button>
            <button className="title-bar-close-btn" onClick={() => { handleClose_(); playWindowClose() }} title="Close">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square">
                <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="title-bar-right" />
      )}
    </div>
  )
}

export default TitleBar
