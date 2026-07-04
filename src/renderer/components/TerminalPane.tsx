import React, { useState, useCallback, useMemo } from 'react'
import PaneHeader from './PaneHeader'
import PaneFooter from './PaneFooter'
import TerminalInstance from './TerminalInstance'
import { useWorkspaceStore } from '../store/workspaceStore'
import { useTerminalStore } from '../store/terminalStore'
import { PaneConfig, LayoutPreset } from '../types'

interface TerminalPaneProps {
  pane: PaneConfig
  paneIndex: number
  isActive: boolean
  workspaceCwd: string
  paneCount: number
  layout: LayoutPreset | undefined
}

const LAYOUT_MAX: Record<string, number> = { '1': 1, '2v': 2, '4': 4, '6': 6, '9': 9 }

const TerminalPane: React.FC<TerminalPaneProps> = ({ pane, paneIndex, isActive, workspaceCwd, paneCount, layout }) => {
  const renamePane = useWorkspaceStore((s) => s.renamePane)
  const closePane = useWorkspaceStore((s) => s.closePane)
  const setActivePane = useWorkspaceStore((s) => s.setActivePane)
  const setPaneStatus = useWorkspaceStore((s) => s.setPaneStatus)
  const setTerminalId = useWorkspaceStore((s) => s.setTerminalId)
  const setPaneColor = useWorkspaceStore((s) => s.setPaneColor)
  const addPane = useWorkspaceStore((s) => s.addPane)
  const registerTerminal = useTerminalStore((s) => s.registerTerminal)
  const [cwd, setCwd] = useState('~')

  const maxPanes = layout ? (LAYOUT_MAX[String(layout)] ?? 9) : 9
  const hideAddButton = paneCount >= maxPanes

  const handleTerminalReady = useCallback((id: string) => {
    setTerminalId(pane.id, id)
    setPaneStatus(pane.id, 'running')
    registerTerminal(pane.id, id, () => {})
  }, [pane.id, setTerminalId, setPaneStatus, registerTerminal])

  const handleProfileChange = useCallback((profile: string) => {
    const accents: Record<string, string> = {
      claude: '#b88a5c', kilo: '#b483d4', gemini: '#6d8ae8',
      codex: '#4cc2a0', devin: '#58b9c6'
    }
    setPaneColor(pane.id, accents[profile] || pane.color)
  }, [pane.id, pane.color, setPaneColor])

  const handleExit = useCallback((exitCode: number) => {
    setPaneStatus(pane.id, 'exited', exitCode)
  }, [pane.id, setPaneStatus])

  const handleClose = useCallback(() => {
    if (pane.terminalId) {
      window.dzz.pty.destroy(pane.terminalId)
    }
    closePane(pane.id)
  }, [pane.id, pane.terminalId, closePane])

  const handleAddPane = useCallback(() => {
    addPane()
  }, [addPane])

  const handleRename = useCallback((name: string) => {
    renamePane(pane.id, name)
  }, [pane.id, renamePane])

  const handleSelect = useCallback(() => {
    setActivePane(pane.id)
  }, [pane.id, setActivePane])

  const onTerminalDataRef = useMemo(() => () => {}, [])

  return (
    <div
      className={`pane-container ${isActive ? 'active' : ''} pane-entrance`}
      style={{ '--pane-color': pane.color } as React.CSSProperties}
    >
      <PaneHeader
        pane={pane}
        paneIndex={paneIndex}
        isActive={isActive}
        hideAddButton={hideAddButton}
        onRename={handleRename}
        onAddPane={handleAddPane}
        onClose={handleClose}
        onSelect={handleSelect}
      />
      <div className="pane-body">
        <TerminalInstance
          paneId={pane.id}
          terminalId={pane.terminalId}
          workspaceCwd={workspaceCwd}
          onTerminalReady={handleTerminalReady}
          onTerminalData={onTerminalDataRef}
          onExit={handleExit}
          onCwdChange={setCwd}
          onProfileChange={handleProfileChange}
        />
      </div>
      <PaneFooter pane={pane} cwd={cwd} />
    </div>
  )
}

export default React.memo(TerminalPane)
