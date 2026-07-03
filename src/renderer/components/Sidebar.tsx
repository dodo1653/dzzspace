import React, { useState } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { IconArrowLeft, IconGrid, IconPlus } from './icons'
import { playClick, playCreate, playSwitch } from '../utils/sound'

const Sidebar: React.FC = () => {
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const selectWorkspace = useWorkspaceStore((s) => s.selectWorkspace)
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace)
  const goBackToLanding = useWorkspaceStore((s) => s.goBackToLanding)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDir, setNewDir] = useState('')

  const handleBrowse = async () => {
    const selected = await window.dzz.dialog.selectDirectory()
    if (selected) { setNewDir(selected); playClick() }
  }

  const handleCreate = () => {
    const name = newName.trim() || `workspace-${workspaces.length + 1}`
    createWorkspace(name, newDir)
    playCreate()
    setNewName('')
    setNewDir('')
    setShowCreate(false)
  }

  const handleSelect = (id: string) => {
    selectWorkspace(id)
    playSwitch()
  }

  return (
    <div style={{
      width: 220,
      background: 'rgba(10,10,15,0.55)',
      borderRight: '0.5px solid rgba(255,255,255,0.04)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '12px 12px',
        borderBottom: '0.5px solid rgba(255,255,255,0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <button
          onClick={() => { goBackToLanding(); playClick() }}
          style={{
            padding: 4,
            borderRadius: 4,
            color: 'var(--dim)',
            transition: 'color 0.12s ease, background 0.12s ease',
            display: 'flex',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--muted)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--dim)'
            e.currentTarget.style.background = 'transparent'
          }}
          title="Back to workspace selection"
        >
          <IconArrowLeft size={12} />
        </button>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--dim)',
          flex: 1
        }}>
          workspaces
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          <button
            onClick={() => { setShowCreate(true); playClick() }}
            style={{
              padding: 4,
              borderRadius: 4,
              color: 'var(--dim)',
              transition: 'color 0.12s ease, background 0.12s ease',
              display: 'flex'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.background = 'rgba(124,92,252,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--dim)'
              e.currentTarget.style.background = 'transparent'
            }}
            title="New workspace"
          >
            <IconPlus size={12} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {showCreate && (
          <div style={{ padding: '8px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.02)' }}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newDir) handleCreate()
                if (e.key === 'Escape') { setShowCreate(false); setNewName(''); setNewDir('') }
              }}
              placeholder="workspace name"
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'rgba(10,10,15,0.6)',
                border: '0.5px solid rgba(255,255,255,0.05)',
                borderRadius: 5,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text)',
                outline: 'none',
                marginBottom: 6
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
            />
            <div
              onClick={handleBrowse}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 8px',
                background: newDir ? 'rgba(10,10,15,0.6)' : 'transparent',
                border: newDir
                  ? '0.5px solid rgba(255,255,255,0.05)'
                  : '0.5px dashed rgba(255,255,255,0.05)',
                borderRadius: 5,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                marginBottom: 8
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = newDir ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.05)'
              }}
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke={newDir ? 'var(--accent)' : 'var(--dim)'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 3.5a1 1 0 011-1h3L7 4h4.5a1 1 0 011 1v5.5a1 1 0 01-1 1h-10a1 1 0 01-1-1V3.5z" />
              </svg>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: newDir ? 'var(--muted)' : 'var(--dim)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {newDir || 'select directory'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowCreate(false); setNewName(''); setNewDir('') }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 9, fontWeight: 450,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--dim)',
                  transition: 'background 0.12s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newDir}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 9, fontWeight: 500,
                  fontFamily: 'var(--font-mono)',
                  color: newDir ? '#0a0a0f' : 'var(--dim)',
                  background: newDir ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                  cursor: newDir ? 'pointer' : 'default',
                  transition: 'opacity 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  if (newDir) e.currentTarget.style.opacity = '0.85'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                create
              </button>
            </div>
          </div>
        )}
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => handleSelect(ws.id)}
            style={{
              padding: '9px 14px',
              cursor: 'pointer',
              background: ws.id === activeId ? 'rgba(245,158,11,0.05)' : 'transparent',
              borderLeft: ws.id === activeId ? '2px solid var(--accent)' : '2px solid transparent',
              borderBottom: '0.5px solid rgba(255,255,255,0.02)',
              transition: 'all 0.12s ease'
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
              fontWeight: 450,
              color: ws.id === activeId ? 'var(--text)' : 'var(--muted)',
              letterSpacing: '-0.01em',
              marginBottom: 2
            }}>
              {ws.name}
            </div>
            <div style={{
              fontSize: 9,
              color: 'var(--dim)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: 'var(--font-mono)'
            }}>
              <IconGrid size={9} />
              {ws.panes.length}
              {ws.cwd && <span style={{ opacity: 0.4 }}>· {ws.cwd.split(/[/\\]/).pop()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
