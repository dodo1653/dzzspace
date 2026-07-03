import React from 'react'
import { PaneConfig } from '../types'

interface PaneFooterProps {
  pane: PaneConfig
  cwd: string
}

const PaneFooter: React.FC<PaneFooterProps> = ({ pane, cwd }) => {
  const statusClass = pane.exitCode === 0
    ? 'success'
    : pane.exitCode !== null ? 'error' : ''

  return (
    <div className="pane-footer">
      <div className="pane-footer-left" title={cwd}>
        {cwd || '~'}
      </div>
      <div className={`pane-footer-right ${statusClass}`}>
        {pane.exitCode !== null ? `exit ${pane.exitCode}` : pane.status}
      </div>
    </div>
  )
}

export default PaneFooter
