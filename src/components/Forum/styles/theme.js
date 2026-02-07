export const colors = {
  bg: {
    primary: '#000000',
    elevated: '#0a0a0a',
    input: '#111111',
    hover: '#1a1a1a',
  },
  
  border: {
    primary: '#333333',
    secondary: '#222222',
    subtle: '#1a1a1a',
  },
  
  text: {
    primary: '#ffffff',
    secondary: '#cccccc',
    tertiary: '#888888',
    muted: '#666666',
    faded: '#444444',
  },
  
  accent: {
    green: '#88ff88',
    greenHover: '#aaffaa',
    red: '#ff6b6b',
    redBright: '#ff4444',
    sovietRed: '#cc0000',
    yellow: '#ffcc00',
    orange: '#ff8800',
  },
  
  state: {
    success: '#88ff88',
    error: '#ff4444',
    warning: '#ffcc00',
  }
}

export const typography = {
  fontFamily: "Arial, Helvetica, sans-serif",
  fontFamilyMono: "'Courier New', Courier, monospace",
  
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '15px',
    lg: '18px',
    xl: '28px',
  },
  
  fontWeight: {
    normal: 400,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  }
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
}

export const layout = {
  maxWidth: '1200px',
  borderRadius: '0px',
}

export const commonStyles = {
  pageContainer: {
    minHeight: 'calc(100vh - 64px)',
    backgroundColor: colors.bg.primary,
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.base,
    padding: `${spacing.lg} ${spacing.xl}`,
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  
  card: {
    border: `1px solid ${colors.border.primary}`,
    backgroundColor: colors.bg.elevated,
    padding: spacing.lg,
  },
  
  input: {
    width: '100%',
    padding: spacing.sm,
    backgroundColor: colors.bg.input,
    border: `1px solid ${colors.border.primary}`,
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.base,
    boxSizing: 'border-box',
  },
  
  link: {
    color: colors.accent.green,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  
  buttonPrimary: {
    padding: `6px ${spacing.lg}`,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.accent.green}`,
    color: colors.accent.green,
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.base,
  },
  
  buttonSecondary: {
    padding: `6px ${spacing.lg}`,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.text.muted}`,
    color: colors.text.muted,
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.base,
  },
  
  buttonDanger: {
    padding: `6px ${spacing.lg}`,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.state.error}`,
    color: colors.state.error,
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.base,
  },
}
