import { create } from 'zustand'
import { Workspace, PaneConfig, LayoutPreset, ViewState } from '../types'

const DEFAULT_NAMES = ['dev', 'build', 'server', 'db', 'tools', 'logs', 'test', 'deploy', 'monitor']

function createPanes(count: number): PaneConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `pane-${Date.now()}-${i}`,
    name: DEFAULT_NAMES[i] || `shell-${i + 1}`,
    terminalId: null,
    status: 'starting' as const,
    exitCode: null
  }))
}

interface WorkspaceState {
  view: ViewState
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  activePaneId: string | null

  setView: (view: ViewState) => void
  createWorkspace: (name: string, cwd?: string) => void
  deleteWorkspace: (id: string) => void
  selectWorkspace: (id: string) => void
  setLayout: (layout: LayoutPreset) => void
  renamePane: (paneId: string, name: string) => void
  setActivePane: (paneId: string) => void
  setPaneStatus: (paneId: string, status: PaneConfig['status'], exitCode?: number | null) => void
  setTerminalId: (paneId: string, terminalId: string) => void
  closePane: (paneId: string) => void
  addPane: () => void
  goBackToLanding: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  view: 'landing',
  workspaces: [],
  activeWorkspaceId: null,
  activePaneId: null,

  setView: (view) => set({ view }),

  createWorkspace: (name, cwd = '') => {
    const id = `ws-${Date.now()}`
    const ws: Workspace = {
      id,
      name,
      cwd,
      panes: createPanes(4),
      layout: 4,
      createdAt: Date.now(),
      lastOpened: Date.now()
    }
    set((s) => ({
      workspaces: [...s.workspaces, ws],
      activeWorkspaceId: id,
      activePaneId: ws.panes[0]?.id || null,
      view: 'workspace'
    }))
  },

  deleteWorkspace: (id) => {
    set((s) => ({
      workspaces: s.workspaces.filter((w) => w.id !== id)
    }))
  },

  selectWorkspace: (id) => {
    const ws = get().workspaces.find((w) => w.id === id)
    if (ws) {
      set({
        activeWorkspaceId: id,
        activePaneId: ws.panes[0]?.id || null,
        view: 'workspace',
        workspaces: get().workspaces.map((w) =>
          w.id === id
            ? { ...w, lastOpened: Date.now(), panes: w.panes.map((p) => ({ ...p, terminalId: null, status: 'starting' as const, exitCode: null })) }
            : w
        )
      })
    }
  },

  setLayout: (layout) => {
    const wsId = get().activeWorkspaceId
    if (!wsId) return
    const ws = get().workspaces.find((w) => w.id === wsId)
    if (!ws) return

    const countMap: Record<string, number> = { 1: 1, '2v': 2, 4: 4, 6: 6, 9: 9 }
    const targetCount = countMap[String(layout)] || 4
    const currentPanes = [...ws.panes]
    let newPanes: PaneConfig[]

    const resetPane = (p: PaneConfig) => ({ ...p, terminalId: null, status: 'starting' as const, exitCode: null })

    if (targetCount > currentPanes.length) {
      const namesToAdd = DEFAULT_NAMES.slice(currentPanes.length, targetCount)
      const addCount = targetCount - currentPanes.length
      const additional = Array.from({ length: addCount }, (_, i) => ({
        id: `pane-${Date.now()}-${i}`,
        name: namesToAdd[i] || `shell-${currentPanes.length + i + 1}`,
        terminalId: null,
        status: 'starting' as const,
        exitCode: null
      }))
      newPanes = [...currentPanes.map(resetPane), ...additional]
    } else {
      newPanes = currentPanes.slice(0, targetCount).map(resetPane)
    }

    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === wsId ? { ...w, panes: newPanes, layout } : w
      )
    }))
  },

  renamePane: (paneId, name) => {
    set((s) => ({
      workspaces: s.workspaces.map((w) => ({
        ...w,
        panes: w.panes.map((p) => (p.id === paneId ? { ...p, name } : p))
      }))
    }))
  },

  setActivePane: (paneId) => set({ activePaneId: paneId }),

  setPaneStatus: (paneId, status, exitCode = null) => {
    set((s) => ({
      workspaces: s.workspaces.map((w) => ({
        ...w,
        panes: w.panes.map((p) =>
          p.id === paneId ? { ...p, status, exitCode } : p
        )
      }))
    }))
  },

  setTerminalId: (paneId, terminalId) => {
    set((s) => ({
      workspaces: s.workspaces.map((w) => ({
        ...w,
        panes: w.panes.map((p) =>
          p.id === paneId ? { ...p, terminalId } : p
        )
      }))
    }))
  },

  closePane: (paneId) => {
    const wsId = get().activeWorkspaceId
    if (!wsId) return
    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === wsId
          ? { ...w, panes: w.panes.filter((p) => p.id !== paneId) }
          : w
      )
    }))
  },

  addPane: () => {
    const wsId = get().activeWorkspaceId
    if (!wsId) return
    const ws = get().workspaces.find((w) => w.id === wsId)
    if (!ws || ws.panes.length >= 9) return

    const idx = ws.panes.length
    const newPane: PaneConfig = {
      id: `pane-${Date.now()}`,
      name: DEFAULT_NAMES[idx] || `shell-${idx + 1}`,
      terminalId: null,
      status: 'starting',
      exitCode: null
    }

    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === wsId ? { ...w, panes: [...w.panes, newPane] } : w
      )
    }))
  },

  goBackToLanding: () => {
    set({ view: 'landing', activeWorkspaceId: null, activePaneId: null })
  }
}))
