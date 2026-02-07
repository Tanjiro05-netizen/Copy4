import React from 'react'
import { colors, spacing } from '../../styles/theme'

function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{
      textAlign: 'center',
      color: colors.state.error,
      padding: spacing.lg,
    }}>
      <p>{message || 'something went wrong'}</p>
      {onRetry && (
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onRetry() }}
          style={{ color: colors.accent.green, marginTop: spacing.sm, display: 'inline-block' }}
        >
          [try again]
        </a>
      )}
    </div>
  )
}

export default ErrorMessage
