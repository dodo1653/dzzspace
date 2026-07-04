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
  const handleClose = () => { window.dzz?.window.close(); playWindowClose() }

  return (
    <div className="title-bar">
      {isMac ? (
        <div className="title-bar-left">
          <div className="title-bar-traffic-lights">
            <button className="title-bar-traffic-light close" onClick={handleClose}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.9" strokeLinecap="square">
                <path d="M2 2l4 4M6 2l-4 4" />
              </svg>
            </button>
            <button className="title-bar-traffic-light minimize" onClick={handleMinimize}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.9" strokeLinecap="square">
                <path d="M1.5 4h5" />
              </svg>
            </button>
            <button className="title-bar-traffic-light maximize" onClick={handleMaximize}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.9" strokeLinecap="square">
                <rect x="1.2" y="1.2" width="5.6" height="5.6" rx="0" />
              </svg>
            </button>
          </div>
          <span className="title-bar-divider" />
          <div className="title-bar-brand">
            <div className="title-bar-app-icon" />
            <span className="title-bar-app-name">dzzspace</span>
          </div>
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
          <div className="title-bar-brand" style={{ paddingLeft: 2 }}>
            <div className="title-bar-app-icon" />
            <span className="title-bar-app-name">dzzspace</span>
          </div>
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
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M2 6h8" />
              </svg>
            </button>
            <button onClick={handleMaximize} title="Maximize">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <rect x="1.5" y="1.5" width="9" height="9" rx="0" />
                <rect x="3.5" y="3.5" width="5" height="5" rx="0" strokeWidth="1" opacity="0.3" />
              </svg>
            </button>
            <button className="title-bar-close-btn" onClick={handleClose} title="Close">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M2 2l8 8M10 2l-8 8" />
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
