import React, { useState } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { IconTrash, IconGrid } from './icons'
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
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 580, padding: '0 24px', position: 'relative'
      }}>
        <div className="hero-glow" style={{
          top: '20%', left: '50%', transform: 'translateX(-50%)'
        }} />

        <div style={{ marginBottom: 44, textAlign: 'center', position: 'relative' }}>
          <h1 className="hero-title" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 54, fontWeight: 350,
            letterSpacing: '-0.04em',
            color: 'var(--text)',
            marginBottom: 4, lineHeight: 1
          }}>
            dzzspace<span className="hero-underscore" style={{
              color: 'var(--accent)', fontWeight: 300
            }}>_</span>
          </h1>
          <div className="hero-accent" style={{
            height: 1.5,
            background: 'var(--accent)',
            borderRadius: 1,
            margin: '12px auto 10px',
            opacity: 0.7
          }} />
          <p className="hero-subtitle" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9, fontWeight: 400,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--muted)'
          }}>
            multi-terminal workspace
          </p>
        </div>

        <div className="hero-panel" style={{
          width: '100%',
          background: 'rgba(17,17,24,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '0.5px solid rgba(255,255,255,0.05)',
          borderRadius: 'var(--radius-modal)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-hero)'
        }}>
          {sorted.length > 0 && (
            <>
              <div style={{
                padding: '14px 20px',
                borderBottom: '0.5px solid rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10, fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: 'var(--dim)'
                }}>
                  workspaces
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: 'var(--dim)'
                }}>
                  {sorted.length}
                </span>
              </div>
              <div style={{ maxHeight: 240, overflow: 'auto' }}>
                {sorted.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => handleSelect(ws.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      borderBottom: '0.5px solid rgba(255,255,255,0.02)',
                      transition: 'background 0.12s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12, fontWeight: 450,
                        color: 'var(--text)',
                        letterSpacing: '-0.01em', marginBottom: 3
                      }}>
                        {ws.name}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 10, color: 'var(--dim)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <IconGrid size={10} /> {ws.panes.length}
                        </span>
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
                        transition: 'all 0.12s ease',
                        display: 'flex', flexShrink: 0, opacity: 0,
                        marginLeft: 8
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--error)'
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
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
                ))}
              </div>
              <div style={{
                padding: '12px 20px',
                borderTop: '0.5px solid rgba(255,255,255,0.03)'
              }}>
                {!showCreate ? (
                  <button
                    onClick={() => { setShowCreate(true); playClick() }}
                    style={{
                      width: '100%', padding: '10px',
                      borderRadius: 8,
                      border: '0.5px dashed rgba(255,255,255,0.06)',
                      fontSize: 11, fontWeight: 450,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--muted)',
                      letterSpacing: '0.02em',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'
                      e.currentTarget.style.color = 'var(--accent)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.color = 'var(--muted)'
                    }}
                  >
                    + new workspace
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
            <div style={{ padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 10,
                  background: 'rgba(245,158,11,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  border: '0.5px solid rgba(245,158,11,0.1)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="14" height="14" rx="2" />
                    <path d="M6 2v14M2 6h14" />
                  </svg>
                </div>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11, fontWeight: 400, color: 'var(--dim)',
                  letterSpacing: '0.02em'
                }}>
                  no workspaces yet
                </p>
              </div>
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
      placeholder="workspace name"
      style={{
        width: '100%',
        padding: '10px 14px',
        background: 'rgba(10,10,15,0.6)',
        border: '0.5px solid rgba(255,255,255,0.05)',
        borderRadius: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text)',
        outline: 'none',
        marginBottom: 8,
        transition: 'border-color 0.15s ease'
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)' }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
    />

    <div
      onClick={() => { onBrowse(); playClick() }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        background: dir ? 'rgba(10,10,15,0.6)' : 'transparent',
        border: dir
          ? '0.5px solid rgba(255,255,255,0.05)'
          : '0.5px dashed rgba(255,255,255,0.06)',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: 14
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)'
        e.currentTarget.style.background = dir ? 'rgba(10,10,15,0.7)' : 'rgba(245,158,11,0.02)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = dir ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.06)'
        e.currentTarget.style.background = dir ? 'rgba(10,10,15,0.6)' : 'transparent'
      }}
    >
      <span style={{
        width: 28, height: 28,
        borderRadius: 6,
        background: dir ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={dir ? 'var(--accent)' : 'var(--dim)'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 3.5a1 1 0 011-1h3L7 4h4.5a1 1 0 011 1v5.5a1 1 0 01-1 1h-10a1 1 0 01-1-1V3.5z" />
        </svg>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10, fontWeight: dir ? 450 : 400,
          color: dir ? 'var(--text)' : 'var(--dim)',
          letterSpacing: '0.01em',
          marginBottom: dir ? 1 : 0
        }}>
          {dir ? 'directory' : 'workspace directory'}
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
            fontFamily: 'var(--font-mono)',
            fontSize: 9, color: 'rgba(255,255,255,0.1)',
            letterSpacing: '0.02em'
          }}>
            required — select a folder
          </div>
        )}
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10, fontWeight: 450,
        color: dir ? 'var(--accent)' : 'var(--muted)',
        padding: '4px 10px',
        borderRadius: 4,
        background: dir ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)',
        flexShrink: 0,
        transition: 'all 0.12s ease'
      }}>
        {dir ? 'change' : 'browse'}
      </span>
    </div>

    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <button
        onClick={() => { onCancel(); playClick() }}
        style={{
          padding: '7px 16px',
          borderRadius: 6,
          fontSize: 11, fontWeight: 450,
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
          transition: 'background 0.12s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        cancel
      </button>
      <button
        onClick={() => { if (canSubmit) onSubmit() }}
        disabled={!canSubmit}
        style={{
          padding: '7px 18px',
          borderRadius: 6,
          fontSize: 11, fontWeight: 500,
          fontFamily: 'var(--font-mono)',
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
        create
      </button>
    </div>
  </div>
)

export default LandingScreen
