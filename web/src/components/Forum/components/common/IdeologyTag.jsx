import React from 'react'
import { getIdeologyColor, getIdeologyAbbrev } from '../../constants'

function IdeologyTag({ ideology, showFull = false }) {
  if (!ideology) return null

  const color = getIdeologyColor(ideology)
  const display = showFull ? ideology : getIdeologyAbbrev(ideology)

  return (
    <span style={{
      color,
      fontSize: '11px',
      marginLeft: '4px',
    }}>
      [{display}]
    </span>
  )
}

export default IdeologyTag
