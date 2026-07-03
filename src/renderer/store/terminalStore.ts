import { create } from 'zustand'

interface TerminalState {
  terminals: Record<string, { termId: string | null; cleanup: (() => void) | null }>
  registerTerminal: (paneId: string, termId: string, cleanup: () => void) => void
  unregisterTerminal: (paneId: string) => void
  getTermId: (paneId: string) => string | null
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  terminals: {},

  registerTerminal: (paneId, termId, cleanup) => {
    set((s) => ({
      terminals: {
        ...s.terminals,
        [paneId]: { termId, cleanup }
      }
    }))
  },

  unregisterTerminal: (paneId) => {
    const entry = get().terminals[paneId]
    if (entry?.cleanup) {
      entry.cleanup()
    }
    set((s) => {
      const { [paneId]: _, ...rest } = s.terminals
      return { terminals: rest }
    })
  },

  getTermId: (paneId) => {
    return get().terminals[paneId]?.termId || null
  }
}))
