import React, { useState } from 'react'
import BackgroundCanvas from './components/BackgroundCanvas'
import TitleBar from './components/TitleBar'
import LandingScreen from './components/LandingScreen'
import Sidebar from './components/Sidebar'
import TerminalGrid from './components/TerminalGrid'
import { useWorkspaceStore } from './store/workspaceStore'
import { useKeyboard } from './hooks/useKeyboard'

const App: React.FC = () => {
  const view = useWorkspaceStore((s) => s.view)
  const [sidebarVisible, setSidebarVisible] = useState(true)

  useKeyboard()

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <BackgroundCanvas />

      {view === 'landing' && <LandingScreen />}

      {view === 'workspace' && (
        <>
          <TitleBar onToggleSidebar={() => setSidebarVisible((v) => !v)} sidebarVisible={sidebarVisible} />
          <div style={{
            position: 'absolute',
            top: 'var(--title-bar-height)',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden'
          }}>
            <div style={{
              width: sidebarVisible ? 220 : 0,
              overflow: 'hidden',
              flexShrink: 0,
              transition: 'width 200ms ease-out, opacity 200ms ease-out',
              opacity: sidebarVisible ? 1 : 0
            }}>
              <div style={{ width: 220 }}>
                <Sidebar />
              </div>
            </div>
            <TerminalGrid />
          </div>
        </>
      )}
    </div>
  )
}

export default App
