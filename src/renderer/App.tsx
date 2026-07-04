import React, { useState, Component } from 'react'
import BackgroundCanvas from './components/BackgroundCanvas'
import TitleBar from './components/TitleBar'
import LandingScreen from './components/LandingScreen'
import Sidebar from './components/Sidebar'
import TerminalGrid from './components/TerminalGrid'
import { useWorkspaceStore } from './store/workspaceStore'
import { useKeyboard } from './hooks/useKeyboard'

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--error)' }}>
          <p style={{ marginBottom: 8 }}>Something went wrong:</p>
          <pre style={{ opacity: 0.6, whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: '6px 14px', border: '0.5px solid rgba(255,255,255,0.04)', borderRadius: 5, background: 'var(--panel)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11 }}>retry</button>
        </div>
      )
    }
    return this.props.children
  }
}

const App: React.FC = () => {
  const view = useWorkspaceStore((s) => s.view)
  const [sidebarVisible, setSidebarVisible] = useState(true)

  useKeyboard()

  return (
    <ErrorBoundary>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {view === 'landing' && <BackgroundCanvas />}

        <TitleBar onToggleSidebar={() => setSidebarVisible((v) => !v)} sidebarVisible={sidebarVisible} showSidebarToggle={view === 'workspace'} />

        {view === 'landing' && <LandingScreen />}

        {view === 'workspace' && (
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
              width: sidebarVisible ? 280 : 0,
              overflow: 'hidden',
              flexShrink: 0,
              transition: 'width 200ms ease-out, opacity 200ms ease-out',
              opacity: sidebarVisible ? 1 : 0
            }}>
              <div style={{ width: 280 }}>
                <Sidebar />
              </div>
            </div>
            <TerminalGrid />
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
