import React, { useState } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { IconTrash } from './icons'
import { playLandingClick, playLandingCreate, playLandingSwitch, playLandingDelete, playLandingHover } from '../utils/sound'

function truncatePath(path: string, maxLen = 40): string {
  if (path.length <= maxLen) return path
  const head = path.slice(0, 18)
  const tail = path.slice(-18)
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
    if (selected) { setDir(selected); playLandingClick() }
  }

  const handleCreate = () => {
    const wsName = name.trim() || `workspace-${workspaces.length + 1}`
    createWorkspace(wsName, dir)
    playLandingCreate()
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
    playLandingSwitch()
  }

  const handleDelete = (id: string) => {
    deleteWorkspace(id)
    playLandingDelete()
  }

  const sorted = [...workspaces].sort((a, b) => b.lastOpened - a.lastOpened)

  return (
    <div style={{
      position: 'absolute', top: 'var(--title-bar-height)', left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10
    }}>
      <div className="hero-panel" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 36,
        width: 600, padding: '0 28px',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="hero-title" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 60, fontWeight: 160,
            letterSpacing: '-0.05em',
            color: '#f0f0f5',
            marginBottom: 22,
            lineHeight: 1,
            textRendering: 'geometricPrecision'
          }}>
            dzzspace
          </h1>
          <div className="hero-accent" style={{
            height: 2,
            width: 80,
            background: 'linear-gradient(90deg, transparent, rgba(212,163,115,0.4), rgba(212,163,115,0.5), rgba(212,163,115,0.4), transparent)',
            margin: '0 auto 18px',
            borderRadius: 4
          }} />
          <p className="hero-subtitle" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10, fontWeight: 400,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--dim)',
            textRendering: 'geometricPrecision'
          }}>
            multi-terminal workspace
          </p>
        </div>

        <div className="hero-panel-inner" style={{
          width: '100%',
          background: 'var(--panel)',
          border: '0.5px solid rgba(255,255,255,0.04)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(212, 163, 115, 0.06), 0 2px 12px rgba(0,0,0,0.3)',
          transition: 'box-shadow 0.3s ease'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 52px rgba(212, 163, 115, 0.1), 0 2px 16px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(212,163,115,0.06)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 40px rgba(212, 163, 115, 0.06), 0 2px 12px rgba(0,0,0,0.3)'
          }}
        >
          {sorted.length > 0 && (
            <>
              <div style={{
                padding: '20px 24px 14px',
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                borderBottom: '0.5px solid rgba(255,255,255,0.02)'
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10, fontWeight: 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--muted)'
                }}>
                  Workspaces
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: 'var(--dim)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  {sorted.length}
                </span>
              </div>

              <div style={{ padding: '4px 0 6px' }}>
                {sorted.map((ws, idx) => {
                  const isHovered = hovered === ws.id
                  return (
                    <div
                      key={ws.id}
                      className="workspace-item"
                      style={{ animationDelay: `${600 + idx * 60}ms` }}
                      onClick={() => handleSelect(ws.id)}
                      onMouseEnter={() => { setHovered(ws.id); playLandingHover() }}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 24px',
                        cursor: 'pointer',
                        borderLeft: isHovered ? '2px solid var(--accent)' : '2px solid transparent',
                        background: isHovered ? 'rgba(255,255,255,0.018)' : 'transparent',
                        transition: 'all 0.18s ease',
                        margin: '1px 0',
                        borderRadius: 0,
                        position: 'relative'
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 14, fontWeight: 420,
                            color: isHovered ? '#f0f0f5' : 'var(--text)',
                            letterSpacing: '-0.01em',
                            marginBottom: 3,
                            transition: 'color 0.18s ease'
                          }}>
                            {ws.name}
                          </div>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 10, color: 'var(--dim)',
                            fontFamily: 'var(--font-mono)'
                          }}>
                            <span>{ws.panes.length} pane{ws.panes.length !== 1 ? 's' : ''}</span>
                            {ws.cwd && (
                              <>
                                <span style={{ opacity: 0.3 }}>/</span>
                                <span style={{ opacity: 0.5 }}>{shortDir(ws.cwd)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(ws.id) }}
                          style={{
                            padding: 5, borderRadius: 4,
                            color: 'var(--dim)',
                            transition: 'all 0.15s ease',
                            display: 'flex', flexShrink: 0,
                            opacity: isHovered ? 0.6 : 0,
                            marginLeft: 10
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--error)'
                            e.currentTarget.style.background = 'rgba(227,86,124,0.08)'
                            e.currentTarget.style.opacity = '1'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--dim)'
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.opacity = '0.6'
                          }}
                        >
                          <IconTrash size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{
                padding: '8px 24px 20px',
                borderTop: '0.5px solid rgba(255,255,255,0.02)'
              }}>
                {!showCreate ? (
                  <button
                    onClick={() => { setShowCreate(true); playLandingClick() }}
                    style={{
                      width: '100%', padding: '10px',
                      borderRadius: 7,
                      border: '0.5px solid rgba(255,255,255,0.04)',
                      fontSize: 11, fontWeight: 420,
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--muted)',
                      letterSpacing: '0.04em',
                      transition: 'all 0.18s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-dim)'
                      e.currentTarget.style.color = 'var(--accent)'
                      e.currentTarget.style.background = 'var(--accent-glow)'
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
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.02)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
                border: '0.5px solid rgba(255,255,255,0.04)'
              }}>
                <svg width="22" height="22" viewBox="0 0 18 18" fill="none" stroke="var(--muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="14" height="14" rx="2" />
                  <path d="M6 2v14M2 6h14" />
                </svg>
              </div>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13, fontWeight: 400, color: 'var(--muted)',
                letterSpacing: '0.02em', marginBottom: 24
              }}>
                No workspaces yet. Create your first one.
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
        padding: '10px 14px',
        background: 'rgba(0,0,0,0.25)',
        border: '0.5px solid rgba(255,255,255,0.04)',
        borderRadius: 7,
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        color: 'var(--text)',
        outline: 'none',
        marginBottom: 10,
        transition: 'border-color 0.15s ease, background 0.15s ease'
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-dim)'
        e.currentTarget.style.background = 'rgba(0,0,0,0.35)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.background = 'rgba(0,0,0,0.25)'
      }}
    />

    <div
      onClick={() => { onBrowse(); playLandingClick() }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: dir ? 'rgba(0,0,0,0.25)' : 'transparent',
        border: dir
          ? '0.5px solid rgba(255,255,255,0.04)'
          : '0.5px dashed rgba(255,255,255,0.04)',
        borderRadius: 7,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: 16
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-dim)'
        e.currentTarget.style.background = dir ? 'rgba(0,0,0,0.35)' : 'var(--accent-glow)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = dir ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.04)'
        e.currentTarget.style.background = dir ? 'rgba(0,0,0,0.25)' : 'transparent'
      }}
    >
      <span style={{
        width: 32, height: 32,
        borderRadius: 7,
        background: dir ? 'var(--accent-glow)' : 'rgba(255,255,255,0.02)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={dir ? 'var(--accent)' : 'var(--dim)'} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 3.5a1 1 0 011-1h3L7 4h4.5a1 1 0 011 1v5.5a1 1 0 01-1 1h-10a1 1 0 01-1-1V3.5z" />
        </svg>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 11, fontWeight: 400,
          color: dir ? 'var(--text)' : 'var(--dim)',
          letterSpacing: '0.02em',
          marginBottom: dir ? 2 : 0
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
            fontSize: 10, color: 'rgba(255,255,255,0.08)',
            letterSpacing: '0.02em'
          }}>
            Required — select a folder
          </div>
        )}
      </div>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 11, fontWeight: 450,
        color: dir ? 'var(--accent)' : 'var(--muted)',
        padding: '4px 12px',
        borderRadius: 5,
        background: dir ? 'var(--accent-glow)' : 'rgba(255,255,255,0.02)',
        flexShrink: 0,
        transition: 'all 0.12s ease'
      }}>
        {dir ? 'Change' : 'Browse'}
      </span>
    </div>

    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <button
        onClick={() => { onCancel(); playLandingClick() }}
        style={{
          padding: '7px 16px',
          borderRadius: 6,
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
          padding: '7px 18px',
          borderRadius: 6,
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
