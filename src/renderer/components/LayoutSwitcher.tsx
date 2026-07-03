import React, { useState } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { LayoutPreset } from '../types'

const presets: { value: LayoutPreset; label: string; cols: number; rows: number }[] = [
  { value: 1, label: '1', cols: 1, rows: 1 },
  { value: '2v', label: '2V', cols: 2, rows: 1 },
  { value: '2h', label: '2H', cols: 1, rows: 2 },
  { value: 4, label: '4', cols: 2, rows: 2 },
  { value: 6, label: '6', cols: 3, rows: 2 },
  { value: 9, label: '9', cols: 3, rows: 3 }
]

const LayoutSwitcher: React.FC = () => {
  const layout = useWorkspaceStore((s) => {
    const ws = s.workspaces.find((w) => w.id === s.activeWorkspaceId)
    return ws?.layout || 4
  })
  const setLayout = useWorkspaceStore((s) => s.setLayout)
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        zIndex: 50
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: expanded ? '6px 10px' : '6px',
          background: 'rgba(18,18,26,0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          transition: 'padding 0.2s ease'
        }}
      >
        {presets.map((p) => (
          <button
            key={String(p.value)}
            onClick={() => setLayout(p.value)}
            title={p.label}
            style={{
              width: expanded ? 22 : 18,
              height: expanded ? 22 : 18,
              display: 'grid',
              gridTemplateColumns: `repeat(${p.cols}, 1fr)`,
              gridTemplateRows: `repeat(${p.rows}, 1fr)`,
              gap: 2,
              padding: 3,
              borderRadius: 4,
              background: layout === p.value ? 'rgba(245,158,11,0.12)' : 'transparent',
              border: layout === p.value ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (layout !== p.value) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }
            }}
            onMouseLeave={(e) => {
              if (layout !== p.value) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {Array.from({ length: p.cols * p.rows }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: layout === p.value ? 'var(--accent)' : 'var(--dim)',
                  borderRadius: 1,
                  opacity: layout === p.value ? 0.8 : 0.4,
                  transition: 'all 0.15s ease'
                }}
              />
            ))}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LayoutSwitcher
