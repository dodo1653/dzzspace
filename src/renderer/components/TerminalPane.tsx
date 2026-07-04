import React, { useState, useCallback } from 'react'
import PaneHeader from './PaneHeader'
import PaneFooter from './PaneFooter'
import TerminalInstance from './TerminalInstance'
import { useWorkspaceStore } from '../store/workspaceStore'
import { useTerminalStore } from '../store/terminalStore'
import { PaneConfig } from '../types'

interface TerminalPaneProps {
  pane: PaneConfig
  paneIndex: number
  isActive: boolean
  workspaceCwd: string
}

const TerminalPane: React.FC<TerminalPaneProps> = ({ pane, paneIndex, isActive, workspaceCwd }) => {
  const renamePane = useWorkspaceStore((s) => s.renamePane)
  const closePane = useWorkspaceStore((s) => s.closePane)
  const setActivePane = useWorkspaceStore((s) => s.setActivePane)
  const setPaneStatus = useWorkspaceStore((s) => s.setPaneStatus)
  const setTerminalId = useWorkspaceStore((s) => s.setTerminalId)
  const addPane = useWorkspaceStore((s) => s.addPane)
  const registerTerminal = useTerminalStore((s) => s.registerTerminal)
  const [cwd, setCwd] = useState('~')

  const handleTerminalReady = useCallback((id: string) => {
    setTerminalId(pane.id, id)
    setPaneStatus(pane.id, 'running')
    registerTerminal(pane.id, id, () => {})
  }, [pane.id, setTerminalId, setPaneStatus, registerTerminal])

  const handleExit = useCallback((exitCode: number) => {
    setPaneStatus(pane.id, 'exited', exitCode)
  }, [pane.id, setPaneStatus])

  const handleClose = useCallback(() => {
    closePane(pane.id)
  }, [pane.id, closePane])

  const handleAddPane = useCallback(() => {
    addPane()
  }, [addPane])

  return (
    <div className={`pane-container ${isActive ? 'active' : ''} pane-entrance`}>
      <PaneHeader
        pane={pane}
        paneIndex={paneIndex}
        isActive={isActive}
        onRename={(name) => renamePane(pane.id, name)}
        onAddPane={handleAddPane}
        onClose={handleClose}
        onSelect={() => setActivePane(pane.id)}
      />
      <div className="pane-body">
        <TerminalInstance
          paneId={pane.id}
          terminalId={pane.terminalId}
          workspaceCwd={workspaceCwd}
          onTerminalReady={handleTerminalReady}
          onTerminalData={() => {}}
          onExit={handleExit}
          onCwdChange={setCwd}
        />
      </div>
      <PaneFooter pane={pane} cwd={cwd} />
    </div>
  )
}

export default TerminalPane
