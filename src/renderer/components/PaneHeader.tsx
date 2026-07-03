import React from 'react'
import ShellNameTag from './ShellNameTag'
import { IconFocus, IconSplit, IconClose } from './icons'
import { PaneConfig } from '../types'

interface PaneHeaderProps {
  pane: PaneConfig
  isActive: boolean
  onRename: (name: string) => void
  onFocus: () => void
  onSplit: () => void
  onClose: () => void
  onSelect: () => void
}

const PaneHeader: React.FC<PaneHeaderProps> = ({
  pane,
  isActive,
  onRename,
  onFocus,
  onSplit,
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
        <button className="pane-header-btn" onClick={(e) => { e.stopPropagation(); onFocus() }} title="Focus">
          <IconFocus />
        </button>
        <button className="pane-header-btn" onClick={(e) => { e.stopPropagation(); onSplit() }} title="Split">
          <IconSplit />
        </button>
        <button className="pane-header-btn close-btn" onClick={(e) => { e.stopPropagation(); onClose() }} title="Close">
          <IconClose />
        </button>
      </div>
    </div>
  )
}

export default PaneHeader
