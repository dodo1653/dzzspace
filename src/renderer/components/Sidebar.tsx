import React, { useState, useCallback } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { IconArrowLeft, IconGrid, IconPlus, IconTrash } from './icons'
import { playClick, playCreate, playSwitch } from '../utils/sound'

const Sidebar: React.FC = () => {
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const selectWorkspace = useWorkspaceStore((s) => s.selectWorkspace)
  const deleteWorkspaceStore = useWorkspaceStore((s) => s.deleteWorkspace)
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

  const handleDelete = useCallback((e: React.MouseEvent, wsId: string, panes: { terminalId: string | null }[]) => {
    e.stopPropagation()
    panes.forEach((p) => {
      if (p.terminalId) window.dzz.pty.destroy(p.terminalId)
    })
    deleteWorkspaceStore(wsId)
    playClick()
  }, [deleteWorkspaceStore])

  return (
    <div style={{
      width: 280,
      background: 'rgba(8,8,12,0.65)',
      borderRight: '0.5px solid rgba(255,255,255,0.04)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '0.5px solid rgba(255,255,255,0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <button
          onClick={() => { goBackToLanding(); playClick() }}
          style={{
            padding: 7,
            borderRadius: 6,
            color: 'var(--dim)',
            transition: 'all 0.12s ease',
            display: 'flex',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--dim)'
            e.currentTarget.style.background = 'transparent'
          }}
          title="Back to workspace selection"
        >
          <IconArrowLeft size={15} />
        </button>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 550,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--dim)',
          flex: 1
        }}>
          workspaces
        </span>
        <button
          onClick={() => { setShowCreate(true); playClick() }}
          style={{
            padding: 7,
            borderRadius: 6,
            color: 'var(--dim)',
            transition: 'all 0.12s ease',
            display: 'flex'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent)'
            e.currentTarget.style.background = 'var(--accent-glow)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--dim)'
            e.currentTarget.style.background = 'transparent'
          }}
          title="New workspace"
        >
          <IconPlus size={15} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {showCreate && (
          <div style={{ padding: '12px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.02)' }}>
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
                padding: '9px 12px',
                background: 'rgba(0,0,0,0.25)',
                border: '0.5px solid rgba(255,255,255,0.04)',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--text)',
                outline: 'none',
                marginBottom: 10
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-dim)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)' }}
            />
            <div
              onClick={handleBrowse}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: newDir ? 'rgba(0,0,0,0.25)' : 'transparent',
                border: newDir
                  ? '0.5px solid rgba(255,255,255,0.04)'
                  : '0.5px dashed rgba(255,255,255,0.04)',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                marginBottom: 14
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-dim)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = newDir ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.04)'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={newDir ? 'var(--accent)' : 'var(--dim)'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 3.5a1 1 0 011-1h3L7 4h4.5a1 1 0 011 1v5.5a1 1 0 01-1 1h-10a1 1 0 01-1-1V3.5z" />
              </svg>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: newDir ? 'var(--muted)' : 'var(--dim)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {newDir || 'select directory'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowCreate(false); setNewName(''); setNewDir('') }}
                style={{
                  padding: '7px 16px',
                  borderRadius: 5,
                  fontSize: 11, fontWeight: 450,
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
                  padding: '7px 16px',
                  borderRadius: 5,
                  fontSize: 11, fontWeight: 500,
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
        {workspaces.map((ws) => {
          const isActive = ws.id === activeId
          return (
            <div
              key={ws.id}
              className="sidebar-item"
              onClick={() => handleSelect(ws.id)}
              style={{
                padding: '20px 22px',
                cursor: 'pointer',
                background: isActive
                  ? 'linear-gradient(to right, rgba(212,163,115,0.05), transparent)'
                  : 'transparent',
                borderLeft: isActive ? '3.5px solid var(--accent)' : '3.5px solid transparent',
                borderBottom: '0.5px solid rgba(255,255,255,0.02)',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.015)'
                }
                const btn = e.currentTarget.querySelector('.sidebar-delete-btn') as HTMLElement
                if (btn) btn.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                }
                const btn = e.currentTarget.querySelector('.sidebar-delete-btn') as HTMLElement
                if (btn) btn.style.opacity = '0'
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 15,
                fontWeight: 480,
                color: isActive ? 'var(--text)' : 'var(--muted)',
                letterSpacing: '-0.01em',
                marginBottom: 6
              }}>
                {ws.name}
              </div>
              <div style={{
                fontSize: 11,
                color: 'var(--dim)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'var(--font-mono)'
              }}>
                <IconGrid size={11} />
                <span>{ws.panes.length} {ws.panes.length === 1 ? 'pane' : 'panes'}</span>
                {ws.cwd && (
                  <>
                    <span style={{ opacity: 0.25, margin: '0 3px' }}>/</span>
                    <span style={{ opacity: 0.45 }}>{ws.cwd.split(/[/\\]/).pop()}</span>
                  </>
                )}
              </div>
              <button
                className="sidebar-delete-btn"
                onClick={(e) => handleDelete(e, ws.id, ws.panes)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  padding: 4,
                  borderRadius: 4,
                  color: 'var(--dim)',
                  opacity: 0,
                  transition: 'opacity 0.12s ease, color 0.12s ease, background 0.12s ease',
                  display: 'flex'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--error)'
                  e.currentTarget.style.background = 'rgba(227,86,124,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--dim)'
                  e.currentTarget.style.background = 'transparent'
                }}
                title="Delete workspace"
              >
                <IconTrash size={12} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Sidebar
