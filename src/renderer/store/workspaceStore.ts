import { create } from 'zustand'
import { Workspace, PaneConfig, LayoutPreset, ViewState } from '../types'

const NICKNAMES = [
  'Gizmo', 'Pickle', 'Mochi', 'Ziggy', 'Pepper', 'Waffle', 'Tofu', 'Boba',
  'Noodle', 'Waddles', 'Sushi', 'Panda', 'Mango', 'Pixel', 'Sparky',
  'Fizz', 'Kiwi', 'Taco', 'Maple', 'Yuzu', 'Nacho', 'Miso', 'Dango',
  'Kimchi', 'Wasabi', 'Soba', 'Udon', 'Okra', 'Sesame', 'Chili',
  'Curry', 'Basil', 'Mint', 'Olive', 'Peanut', 'Cashew', 'Walnut',
  'Biscuit', 'Nugget', 'Pudding', 'Sprout', 'Clover', 'Hazel', 'Juniper',
  'Rascal', 'Pippin', 'Wrigley', 'Zorro', 'Mimosa', 'Ramen', 'Gumbo',
  'Truffle', 'Fennel', 'Radish', 'Turnip', 'Burdock', 'Gnocchi'
]

const COLORS = [
  '#e8885c', '#5cb89a', '#d4a373', '#7c8cd4', '#c47cb4',
  '#5cb4c4', '#c47c6a', '#8ac48a', '#c4a4c4'
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function createPanes(count: number): PaneConfig[] {
  const shuffledNames = shuffle(NICKNAMES)
  const shuffledColors = shuffle(COLORS)
  return Array.from({ length: count }, (_, i) => ({
    id: `pane-${Date.now()}-${i}`,
    name: shuffledNames[i % shuffledNames.length],
    color: shuffledColors[i % shuffledColors.length],
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
  workspaceSwitchCount: number

  setView: (view: ViewState) => void
  createWorkspace: (name: string, cwd?: string) => void
  deleteWorkspace: (id: string) => void
  selectWorkspace: (id: string) => void
  setLayout: (layout: LayoutPreset) => void
  renamePane: (paneId: string, name: string) => void
  setActivePane: (paneId: string) => void
  setPaneStatus: (paneId: string, status: PaneConfig['status'], exitCode?: number | null) => void
  setTerminalId: (paneId: string, terminalId: string) => void
  setPaneColor: (paneId: string, color: string) => void
  closePane: (paneId: string) => void
  addPane: () => void
  goBackToLanding: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  view: 'landing',
  workspaces: [],
  activeWorkspaceId: null,
  activePaneId: null,
  workspaceSwitchCount: 0,

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
      view: 'workspace',
      workspaceSwitchCount: s.workspaceSwitchCount + 1
    }))
  },

  deleteWorkspace: (id) => {
    set((s) => {
      const remaining = s.workspaces.filter((w) => w.id !== id)
      const wasActive = s.activeWorkspaceId === id
      if (remaining.length === 0) {
        return {
          workspaces: [],
          activeWorkspaceId: null,
          activePaneId: null,
          view: 'landing'
        }
      }
      const nextWs = wasActive ? remaining[0] : s.workspaces.find((w) => w.id === s.activeWorkspaceId)
      return {
        workspaces: remaining,
        activeWorkspaceId: wasActive ? remaining[0].id : s.activeWorkspaceId,
        activePaneId: wasActive ? remaining[0].panes[0]?.id || null : s.activePaneId
      }
    })
  },

  selectWorkspace: (id) => {
    const ws = get().workspaces.find((w) => w.id === id)
    if (ws) {
      set({
        activeWorkspaceId: id,
        activePaneId: ws.panes[0]?.id || null,
        view: 'workspace',
        workspaceSwitchCount: get().workspaceSwitchCount + 1,
        workspaces: get().workspaces.map((w) =>
          w.id === id
            ? { ...w, lastOpened: Date.now() }
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
      const addCount = targetCount - currentPanes.length
      const additional = Array.from({ length: addCount }, (_, i) => ({
        id: `pane-${Date.now()}-${i}`,
        name: pickRandom(NICKNAMES),
        color: pickRandom(COLORS),
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

  setPaneColor: (paneId, color) => {
    set((s) => ({
      workspaces: s.workspaces.map((w) => ({
        ...w,
        panes: w.panes.map((p) =>
          p.id === paneId ? { ...p, color } : p
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

    const newPane: PaneConfig = {
      id: `pane-${Date.now()}`,
      name: pickRandom(NICKNAMES),
      color: pickRandom(COLORS),
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
