import React, { useState } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { IconTrash } from './icons'

const LandingScreen: React.FC = () => {
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace)
  const selectWorkspace = useWorkspaceStore((s) => s.selectWorkspace)
  const deleteWorkspace = useWorkspaceStore((s) => s.deleteWorkspace)
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const handleCreate = () => {
    const name = newName.trim() || `workspace-${workspaces.length + 1}`
    createWorkspace(name)
    setNewName('')
    setShowCreate(false)
  }

  const sortedWorkspaces = [...workspaces].sort((a, b) => b.lastOpened - a.lastOpened)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10
    }}>
      <div
        className="landing-fade-in"
        style={{
          maxWidth: 520,
          width: '100%',
          padding: '0 24px'
        }}
      >
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 40,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            marginBottom: 12,
            lineHeight: 1.1
          }}>
            dzzspace
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted)'
          }}>
            Select or create a workspace
          </p>
        </div>

        <div style={{
          background: 'rgba(18,18,26,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-modal)',
          overflow: 'hidden'
        }}>
          {sortedWorkspaces.length > 0 && (
            <div style={{ padding: '8px 0' }}>
              {sortedWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => selectWorkspace(ws.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--text)',
                      letterSpacing: '0.02em',
                      marginBottom: 2
                    }}>
                      {ws.name}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: 'var(--dim)',
                      fontFamily: 'var(--font-sans)',
                      letterSpacing: '0.02em'
                    }}>
                      {ws.panes.length} panes · last opened {new Date(ws.lastOpened).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteWorkspace(ws.id)
                    }}
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      color: 'var(--dim)',
                      transition: 'color 0.15s ease, background 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--error)'
                      e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--dim)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showCreate ? (
            <div style={{ padding: '12px 20px 16px', borderTop: sortedWorkspaces.length > 0 ? '1px solid var(--border)' : 'none' }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') setShowCreate(false)
                }}
                placeholder="workspace name"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0a0a0f',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text)',
                  outline: 'none',
                  marginBottom: 10
                }}
                onFocus={(e) => { e.target.style.borderColor = '#f59e0b' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCreate(false)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--muted)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#0a0a0f',
                    background: '#f59e0b',
                    transition: 'opacity 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px 20px', borderTop: sortedWorkspaces.length > 0 ? '1px solid var(--border)' : 'none' }}>
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: '1px dashed var(--dim)',
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--muted)',
                  letterSpacing: '0.04em',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--muted)'
                  e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--dim)'
                  e.currentTarget.style.color = 'var(--muted)'
                }}
              >
                + New Workspace
              </button>
            </div>
          )}

          {workspaces.length === 0 && !showCreate && (
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                color: 'var(--dim)',
                marginBottom: 16,
                letterSpacing: '0.02em'
              }}>
                No workspaces yet. Create your first one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LandingScreen
