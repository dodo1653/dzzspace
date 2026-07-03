import { useEffect } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'

export function useKeyboard() {
  const view = useWorkspaceStore((s) => s.view)
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const setLayout = useWorkspaceStore((s) => s.setLayout)
  const addPane = useWorkspaceStore((s) => s.addPane)
  const closePane = useWorkspaceStore((s) => s.closePane)
  const activePaneId = useWorkspaceStore((s) => s.activePaneId)
  const goBackToLanding = useWorkspaceStore((s) => s.goBackToLanding)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const alt = e.altKey

      if (view === 'workspace') {
        // Ctrl+Shift+N: New pane
        if (ctrl && shift && e.key === 'N') {
          e.preventDefault()
          addPane()
          return
        }

        // Ctrl+Shift+W: Close active pane
        if (ctrl && shift && e.key === 'W') {
          e.preventDefault()
          if (activePaneId) {
            closePane(activePaneId)
          }
          return
        }

        // Alt+1-9: Focus pane
        if (alt && /^[1-9]$/.test(e.key)) {
          e.preventDefault()
          const ws = workspaces.find((w) => w.id === activeId)
          if (ws) {
            const idx = parseInt(e.key) - 1
            if (ws.panes[idx]) {
              useWorkspaceStore.getState().setActivePane(ws.panes[idx].id)
            }
          }
          return
        }

        // Ctrl+B: Go back to landing
        if (ctrl && e.key === 'b') {
          e.preventDefault()
          goBackToLanding()
          return
        }

        // Ctrl+D: Cycle layout
        if (ctrl && e.key === 'd') {
          e.preventDefault()
          const layouts = [1, '2v', '2h', 4, 6, 9] as const
          const ws = workspaces.find((w) => w.id === activeId)
          if (ws) {
            const currentIndex = layouts.indexOf(ws.layout as any)
            const nextIndex = (currentIndex + 1) % layouts.length
            setLayout(layouts[nextIndex] as any)
          }
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, workspaces, activeId, activePaneId, setLayout, addPane, closePane, goBackToLanding])
}
