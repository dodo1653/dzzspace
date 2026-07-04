import React from 'react'
import ShellNameTag from './ShellNameTag'
import { IconPlus, IconClose } from './icons'
import { PaneConfig } from '../types'

interface PaneHeaderProps {
  pane: PaneConfig
  paneIndex: number
  isActive: boolean
  activity?: 'idle' | 'running'
  hideAddButton?: boolean
  onRename: (name: string) => void
  onAddPane: () => void
  onClose: () => void
  onSelect: () => void
}

const PaneHeader: React.FC<PaneHeaderProps> = ({
  pane,
  paneIndex,
  isActive,
  activity,
  hideAddButton,
  onRename,
  onAddPane,
  onClose,
  onSelect
}) => {
  const activityClass = activity === 'running' ? 'running' : pane.status === 'exited' ? 'exited' : ''

  return (
    <div
      className="pane-header"
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      <div className="pane-header-left">
        <div className="pane-avatar">{pane.name.charAt(0)}</div>
        <div className="pane-number-wrap">
          <span className="pane-number" style={{ color: pane.color }}>
            {paneIndex}
          </span>
          <div className="pane-number-bar" style={{ background: pane.color }} />
        </div>
        <span className={`pane-activity ${activityClass}`} />
        <ShellNameTag name={pane.name} onRename={onRename} />
      </div>
      <div className="pane-header-right">
        {!hideAddButton && (
          <button className="pane-header-btn add-btn" onClick={(e) => { e.stopPropagation(); onAddPane() }} title="Add pane">
            <IconPlus />
          </button>
        )}
        <button className="pane-header-btn close-btn" onClick={(e) => { e.stopPropagation(); onClose() }} title="Close pane">
          <IconClose />
        </button>
      </div>
    </div>
  )
}

export default PaneHeader
