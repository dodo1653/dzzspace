import React, { useState } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { IconTrash } from './icons'
import { playClick, playCreate, playSwitch, playDelete } from '../utils/sound'

function truncatePath(path: string, maxLen = 36): string {
  if (path.length <= maxLen) return path
  const head = path.slice(0, 16)
  const tail = path.slice(-16)
  return `${head}...${tail}`
}

function shortDir(path: string): string {
  if (!path) return ''
  const parts = path.replace(/\\/g, '/').split('/')
  if (parts.length <= 2) return path
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`
}

const LandingScreen: React.FC = () => {
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace)
  const selectWorkspace = useWorkspaceStore((s) => s.selectWorkspace)
  const deleteWorkspace = useWorkspaceStore((s) => s.deleteWorkspace)

  const [name, setName] = useState('')
  const [dir, setDir] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  const handleBrowse = async () => {
    const selected = await window.dzz.dialog.selectDirectory()
    if (selected) { setDir(selected); playClick() }
  }

  const handleCreate = () => {
    const wsName = name.trim() || `workspace-${workspaces.length + 1}`
    createWorkspace(wsName, dir)
    playCreate()
    setName('')
    setDir('')
    setShowCreate(false)
  }

  const handleCancel = () => {
    setName('')
    setDir('')
    setShowCreate(false)
  }

  const handleSelect = (id: string) => {
    selectWorkspace(id)
    playSwitch()
  }

  const handleDelete = (id: string) => {
    deleteWorkspace(id)
    playDelete()
  }

  const sorted = [...workspaces].sort((a, b) => b.lastOpened - a.lastOpened)

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10
    }}>
      <div className="hero-panel" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 32,
        width: 520, padding: '0 24px',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="hero-title" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 44, fontWeight: 200,
            letterSpacing: '-0.04em',
            color: '#f0f0f5',
            marginBottom: 14,
            lineHeight: 1,
            animationDelay: '0s'
          }}>
            dzzspace
          </h1>
          <div className="hero-accent" style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)',
            margin: '0 auto 12px'
          }} />
          <p className="hero-subtitle" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9, fontWeight: 400,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--dim)',
            animationDelay: '0.4s'
          }}>
            multi-terminal workspace
          </p>
        </div>

        <div style={{
          width: '100%',
          background: 'var(--panel)',
          border: '0.5px solid rgba(255,255,255,0.04)',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.15)',
          transition: 'box-shadow 0.2s ease'
        }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(0,0,0,0.4), 0 1px 6px rgba(0,0,0,0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.15)' }}
        >
          {sorted.length > 0 && (
            <>
              <div style={{
                padding: '16px 20px 12px',
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10, fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--muted)'
                }}>
                  Workspaces
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: 'var(--dim)'
                }}>
                  {sorted.length}
                </span>
              </div>

              <div style={{ padding: '0 0 4px' }}>
                {sorted.map((ws) => {
                  const isHovered = hovered === ws.id
                  return (
                    <div
                      key={ws.id}
                      onClick={() => handleSelect(ws.id)}
                      onMouseEnter={() => setHovered(ws.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        borderLeft: isHovered ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                        background: isHovered ? 'rgba(255,255,255,0.02)' : 'transparent',
                        transition: 'all 0.15s ease',
                        margin: isHovered ? '2px 0' : '2px 0',
                        borderRadius: isHovered ? '0 4px 4px 0' : '0'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 13, fontWeight: 400,
                          color: isHovered ? '#f0f0f5' : 'var(--text)',
                          letterSpacing: '-0.01em',
                          marginBottom: 2,
                          transition: 'color 0.15s ease'
                        }}>
                          {ws.name}
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          fontSize: 10, color: 'var(--dim)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          <span>{ws.panes.length} panes</span>
                          {ws.cwd && (
                            <span style={{ opacity: 0.5 }}>{shortDir(ws.cwd)}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(ws.id) }}
                        style={{
                          padding: 5, borderRadius: 4,
                          color: 'var(--dim)',
                          transition: 'all 0.15s ease',
                          display: 'flex', flexShrink: 0, opacity: 0,
                          marginLeft: 8
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--error)'
                          e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                          e.currentTarget.style.opacity = '1'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--dim)'
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.opacity = '0'
                        }}
                      >
                        <IconTrash size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div style={{
                padding: '8px 20px 16px',
              }}>
                {!showCreate ? (
                  <button
                    onClick={() => { setShowCreate(true); playClick() }}
                    style={{
                      width: '100%', padding: '9px',
                      borderRadius: 6,
                      border: '0.5px solid rgba(255,255,255,0.04)',
                      fontSize: 11, fontWeight: 400,
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--muted)',
                      letterSpacing: '0.04em',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)'
                      e.currentTarget.style.color = 'var(--accent)'
                      e.currentTarget.style.background = 'rgba(245,158,11,0.03)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.color = 'var(--muted)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    + New Workspace
                  </button>
                ) : (
                  <CreateForm
                    name={name} onNameChange={setName}
                    dir={dir} onBrowse={handleBrowse}
                    onSubmit={handleCreate} onCancel={handleCancel}
                    canSubmit={!!dir}
                  />
                )}
              </div>
            </>
          )}

          {sorted.length === 0 && (
            <div style={{ padding: 36, textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                border: '0.5px solid rgba(255,255,255,0.04)'
              }}>
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="var(--muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="14" height="14" rx="2" />
                  <path d="M6 2v14M2 6h14" />
                </svg>
              </div>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12, fontWeight: 400, color: 'var(--muted)',
                letterSpacing: '0.02em', marginBottom: 20
              }}>
                No workspaces yet
              </p>
              <CreateForm
                name={name} onNameChange={setName}
                dir={dir} onBrowse={handleBrowse}
                onSubmit={handleCreate} onCancel={() => {}}
                canSubmit={!!dir}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface CreateFormProps {
  name: string
  onNameChange: (v: string) => void
  dir: string
  onBrowse: () => void
  onSubmit: () => void
  onCancel: () => void
  canSubmit: boolean
}

const CreateForm: React.FC<CreateFormProps> = ({ name, onNameChange, dir, onBrowse, onSubmit, onCancel, canSubmit }) => (
  <div>
    <input
      autoFocus
      value={name}
      onChange={(e) => onNameChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && canSubmit) onSubmit()
        if (e.key === 'Escape') onCancel()
      }}
      placeholder="Workspace name"
      style={{
        width: '100%',
        padding: '9px 12px',
        background: 'rgba(0,0,0,0.25)',
        border: '0.5px solid rgba(255,255,255,0.04)',
        borderRadius: 6,
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        color: 'var(--text)',
        outline: 'none',
        marginBottom: 8,
        transition: 'border-color 0.15s ease, background 0.15s ease'
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'
        e.currentTarget.style.background = 'rgba(0,0,0,0.35)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.background = 'rgba(0,0,0,0.25)'
      }}
    />

    <div
      onClick={() => { onBrowse(); playClick() }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        background: dir ? 'rgba(0,0,0,0.25)' : 'transparent',
        border: dir
          ? '0.5px solid rgba(255,255,255,0.04)'
          : '0.5px dashed rgba(255,255,255,0.04)',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: 14
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.12)'
        e.currentTarget.style.background = dir ? 'rgba(0,0,0,0.35)' : 'rgba(245,158,11,0.02)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = dir ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.04)'
        e.currentTarget.style.background = dir ? 'rgba(0,0,0,0.25)' : 'transparent'
      }}
    >
      <span style={{
        width: 28, height: 28,
        borderRadius: 6,
        background: dir ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={dir ? 'var(--accent)' : 'var(--dim)'} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 3.5a1 1 0 011-1h3L7 4h4.5a1 1 0 011 1v5.5a1 1 0 01-1 1h-10a1 1 0 01-1-1V3.5z" />
        </svg>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10, fontWeight: 400,
          color: dir ? 'var(--text)' : 'var(--dim)',
          letterSpacing: '0.02em',
          marginBottom: dir ? 1 : 0
        }}>
          {dir ? 'Directory' : 'Workspace Directory'}
        </div>
        {dir && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9, color: 'var(--muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {truncatePath(dir)}
          </div>
        )}
        {!dir && (
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 9, color: 'rgba(255,255,255,0.08)',
            letterSpacing: '0.02em'
          }}>
            Required — select a folder
          </div>
        )}
      </div>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 10, fontWeight: 450,
        color: dir ? 'var(--accent)' : 'var(--muted)',
        padding: '3px 10px',
        borderRadius: 4,
        background: dir ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.02)',
        flexShrink: 0,
        transition: 'all 0.12s ease'
      }}>
        {dir ? 'Change' : 'Browse'}
      </span>
    </div>

    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <button
        onClick={() => { onCancel(); playClick() }}
        style={{
          padding: '6px 14px',
          borderRadius: 5,
          fontSize: 11, fontWeight: 400,
          fontFamily: 'var(--font-sans)',
          color: 'var(--muted)',
          transition: 'all 0.12s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        Cancel
      </button>
      <button
        onClick={() => { if (canSubmit) onSubmit() }}
        disabled={!canSubmit}
        style={{
          padding: '6px 16px',
          borderRadius: 5,
          fontSize: 11, fontWeight: 500,
          fontFamily: 'var(--font-sans)',
          color: canSubmit ? '#0a0a0f' : 'var(--dim)',
          background: canSubmit ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
          cursor: canSubmit ? 'pointer' : 'default',
          transition: 'opacity 0.12s ease',
          letterSpacing: '0.02em'
        }}
        onMouseEnter={(e) => {
          if (canSubmit) e.currentTarget.style.opacity = '0.85'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
      >
        Create
      </button>
    </div>
  </div>
)

export default LandingScreen
