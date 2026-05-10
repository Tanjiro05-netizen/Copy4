import React, { useState } from 'react'
import { colors } from '../../styles/theme'
import { getInitials } from '../../utils/helpers'

function Avatar({ src, name, size = 40 }) {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        onError={() => setHasError(true)}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          border: `1px solid ${colors.border.primary}`,
          backgroundColor: colors.bg.hover,
        }}
      />
    )
  }

  return (
    <div style={{
      width: size,
      height: size,
      backgroundColor: colors.bg.hover,
      border: `1px solid ${colors.border.primary}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.text.faded,
      fontSize: size * 0.4,
      fontWeight: 'bold',
    }}>
      {getInitials(name)}
    </div>
  )
}

export default Avatar
