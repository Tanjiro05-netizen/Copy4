import React from 'react'
import { colors } from '../../styles/theme'

function LoadingSpinner({ text = 'loading...' }) {
  return (
    <div style={{
      textAlign: 'center',
      color: colors.text.muted,
      padding: '20px',
    }}>
      {text}
    </div>
  )
}

export default LoadingSpinner
