import React, { useState } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { LayoutPreset } from '../types'
import { playLayoutChange } from '../utils/sound'

const presets: { value: LayoutPreset; label: string }[] = [
  { value: 1, label: '1' },
  { value: '2v', label: '2' },
  { value: 4, label: '4' },
  { value: 6, label: '6' },
  { value: 9, label: '9' }
]

const LayoutSwitcher: React.FC = () => {
  const layout = useWorkspaceStore((s) => {
    const ws = s.workspaces.find((w) => w.id === s.activeWorkspaceId)
    return ws?.layout || 4
  })
  const setLayout = useWorkspaceStore((s) => s.setLayout)
  const [expanded, setExpanded] = useState(false)

  const handleSetLayout = (v: LayoutPreset) => {
    setLayout(v)
    playLayoutChange()
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        right: 14,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '4px 4px',
          background: 'rgba(17,17,24,0.88)',
          border: '0.5px solid rgba(255,255,255,0.06)',
          borderRadius: 8,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)'
        }}
      >
        {expanded && (
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--dim)',
            padding: '0 6px 0 4px',
            whiteSpace: 'nowrap'
          }}>
            Layout
          </span>
        )}
        {presets.map((p) => (
          <button
            key={String(p.value)}
            onClick={() => handleSetLayout(p.value)}
            title={`${p.label} panes`}
            style={{
              padding: expanded ? '5px 10px' : '4px 7px',
              borderRadius: 6,
              fontSize: expanded ? 11 : 10,
              fontWeight: layout === p.value ? 600 : 400,
              fontFamily: 'var(--font-mono)',
              color: layout === p.value ? 'var(--accent)' : 'var(--muted)',
              background: layout === p.value ? 'rgba(245,158,11,0.1)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '0.02em',
              lineHeight: 1
            }}
            onMouseEnter={(e) => {
              if (layout !== p.value) {
                e.currentTarget.style.color = 'var(--text)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }
            }}
            onMouseLeave={(e) => {
              if (layout !== p.value) {
                e.currentTarget.style.color = 'var(--muted)'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LayoutSwitcher
