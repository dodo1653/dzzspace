export type LayoutPreset = 1 | '2v' | '2h' | 4 | 6 | 9

export interface PaneConfig {
  id: string
  name: string
  terminalId: string | null
  status: 'starting' | 'running' | 'exited' | 'error'
  exitCode: number | null
}

export interface Workspace {
  id: string
  name: string
  panes: PaneConfig[]
  layout: LayoutPreset
  createdAt: number
  lastOpened: number
}

export type ViewState = 'landing' | 'workspace'
