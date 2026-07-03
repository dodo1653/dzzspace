import React from 'react'
import BackgroundCanvas from './components/BackgroundCanvas'
import TitleBar from './components/TitleBar'
import LandingScreen from './components/LandingScreen'
import Sidebar from './components/Sidebar'
import TerminalGrid from './components/TerminalGrid'
import { useWorkspaceStore } from './store/workspaceStore'
import { useKeyboard } from './hooks/useKeyboard'

const App: React.FC = () => {
  const view = useWorkspaceStore((s) => s.view)

  useKeyboard()

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      position: 'relative'
    }}>
      <BackgroundCanvas />

      {view === 'landing' && <LandingScreen />}

      {view === 'workspace' && (
        <>
          <TitleBar />
          <div style={{
            flex: 1,
            display: 'flex',
            marginTop: 'var(--title-bar-height)',
            minHeight: 0
          }}>
            <Sidebar />
            <TerminalGrid />
          </div>
        </>
      )}
    </div>
  )
}

export default App
