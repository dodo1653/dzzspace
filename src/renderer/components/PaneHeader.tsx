import React from 'react'
import ShellNameTag from './ShellNameTag'
import { IconPlus, IconClose } from './icons'
import { PaneConfig } from '../types'

interface PaneHeaderProps {
  pane: PaneConfig
  isActive: boolean
  onRename: (name: string) => void
  onAddPane: () => void
  onClose: () => void
  onSelect: () => void
}

const PaneHeader: React.FC<PaneHeaderProps> = ({
  pane,
  isActive,
  onRename,
  onAddPane,
  onClose,
  onSelect
}) => {
  return (
    <div
      className="pane-header"
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      <div className="pane-header-left">
        <div className={`pane-status-dot ${pane.status}`} />
        <ShellNameTag name={pane.name} onRename={onRename} />
      </div>
      <div className="pane-header-right">
        <button className="pane-header-btn add-btn" onClick={(e) => { e.stopPropagation(); onAddPane() }} title="Add pane">
          <IconPlus />
        </button>
        <button className="pane-header-btn close-btn" onClick={(e) => { e.stopPropagation(); onClose() }} title="Close pane">
          <IconClose />
        </button>
      </div>
    </div>
  )
}

export default PaneHeader
