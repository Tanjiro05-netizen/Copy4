import { createTheme, createThemeContract, globalStyle, keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

export const vars = createThemeContract({
  color: {
    background: '',
    surface: '',
    surfaceRaised: '',
    surfaceSoft: '',
    overlay: '',
    border: '',
    borderStrong: '',
    borderAccent: '',
    accent: '',
    accentHover: '',
    accentSoft: '',
    accentWash: '',
    accentGlow: '',
    spotlight: '',
    text: '',
    textSoft: '',
    textMuted: '',
    textFaint: '',
    success: '',
    warning: '',
    info: '',
  },
  font: {
    display: '',
    body: '',
    mono: '',
  },
  space: {
    xxs: '',
    xs: '',
    sm: '',
    md: '',
    lg: '',
    xl: '',
    xxl: '',
    xxxl: '',
    hero: '',
    gutter: '',
  },
  radius: {
    tiny: '',
    sm: '',
    md: '',
    lg: '',
    xl: '',
    pill: '',
  },
  shadow: {
    soft: '',
    panel: '',
    glow: '',
  },
  layout: {
    maxWidth: '',
    rail: '',
  },
  border: {
    subtle: '',
    strong: '',
    accent: '',
  },
});

export const studyThemeClass = createTheme(vars, {
  color: {
    background: '#090909',
    surface: '#0f0f0f',
    surfaceRaised: '#141414',
    surfaceSoft: '#1a1a1a',
    overlay: '#1f1f1f',
    border: 'rgba(255,255,255,0.06)',
    borderStrong: 'rgba(255,255,255,0.12)',
    borderAccent: 'rgba(200,30,30,0.28)',
    accent: '#c81e1e',
    accentHover: '#e02424',
    accentSoft: 'rgba(200,30,30,0.16)',
    accentWash: 'rgba(200,30,30,0.08)',
    accentGlow: 'rgba(200,30,30,0.22)',
    spotlight: 'rgba(255,255,255,0.05)',
    text: '#ffffff',
    textSoft: 'rgba(255,255,255,0.72)',
    textMuted: 'rgba(255,255,255,0.48)',
    textFaint: 'rgba(255,255,255,0.28)',
    success: '#2d8a4e',
    warning: '#c8860a',
    info: '#4a7fb5',
  },
  font: {
    display: 'Cormorant Garamond, Georgia, serif',
    body: 'Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    mono: 'JetBrains Mono, Fira Code, SFMono-Regular, Menlo, monospace',
  },
  space: {
    xxs: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '40px',
    xxxl: '56px',
    hero: '72px',
    gutter: '24px',
  },
  radius: {
    tiny: '2px',
    sm: '6px',
    md: '12px',
    lg: '18px',
    xl: '28px',
    pill: '999px',
  },
  shadow: {
    soft: '0 1px 3px rgba(0,0,0,0.45)',
    panel: '0 18px 40px rgba(0,0,0,0.42)',
    glow: '0 0 26px rgba(200,30,30,0.14)',
  },
  layout: {
    maxWidth: '1380px',
    rail: '360px',
  },
  border: {
    subtle: '1px solid rgba(255,255,255,0.06)',
    strong: '1px solid rgba(255,255,255,0.12)',
    accent: '1px solid rgba(200,30,30,0.28)',
  },
});

export const liteThemeClass = createTheme(vars, {
  color: {
    background: '#1a1a1a',
    surface: '#222222',
    surfaceRaised: '#2a2a2a',
    surfaceSoft: '#262626',
    overlay: '#2e2e2e',
    border: '#3a3a3a',
    borderStrong: '#4a4a4a',
    borderAccent: '#7a1e1e',
    accent: '#b91c1c',
    accentHover: '#dc2626',
    accentSoft: '#3a1414',
    accentWash: '#2a1010',
    accentGlow: '#3a1414',
    spotlight: '#2e2e2e',
    text: '#e0e0e0',
    textSoft: '#b0b0b0',
    textMuted: '#808080',
    textFaint: '#606060',
    success: '#2d8a4e',
    warning: '#c8860a',
    info: '#4a7fb5',
  },
  font: {
    display: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    mono: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  space: {
    xxs: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '40px',
    xxxl: '56px',
    hero: '72px',
    gutter: '24px',
  },
  radius: {
    tiny: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '10px',
    pill: '999px',
  },
  shadow: {
    soft: 'none',
    panel: 'none',
    glow: 'none',
  },
  layout: {
    maxWidth: '1380px',
    rail: '360px',
  },
  border: {
    subtle: '1px solid #3a3a3a',
    strong: '1px solid #4a4a4a',
    accent: '1px solid #7a1e1e',
  },
});

const rotateGlow = keyframes({
  '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
  '50%': { transform: 'translate3d(0, 12px, 0) scale(1.04)' },
  '100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
});

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const themeRoot = style({
  position: 'relative',
  minHeight: '100%',
  background: vars.color.background,
  color: vars.color.text,
  fontFamily: vars.font.body,
  isolation: 'isolate',
});

globalStyle(`${studyThemeClass}`, {
  color: vars.color.text,
  backgroundColor: vars.color.background,
  fontFamily: vars.font.body,
});

globalStyle(`${studyThemeClass} *`, {
  boxSizing: 'border-box',
});

globalStyle(`${studyThemeClass} a`, {
  color: 'inherit',
  textDecoration: 'none',
});

globalStyle(`${studyThemeClass} button`, {
  fontFamily: vars.font.body,
});

globalStyle(`${studyThemeClass} input`, {
  fontFamily: vars.font.body,
});

globalStyle(`${studyThemeClass} input::placeholder`, {
  color: vars.color.textFaint,
});

globalStyle(`${studyThemeClass} ::selection`, {
  background: vars.color.accentSoft,
  color: vars.color.text,
});

export const ambientOrb = style({
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(36px)',
  opacity: 0.5,
  pointerEvents: 'none',
  animation: `${rotateGlow} 10s ease-in-out infinite`,
});

export const panelBase = style({
  position: 'relative',
  background: `linear-gradient(180deg, ${vars.color.surfaceRaised} 0%, ${vars.color.surface} 100%)`,
  border: vars.border.subtle,
  borderRadius: vars.radius.xl,
  boxShadow: vars.shadow.panel,
  overflow: 'hidden',
});

export const panelInset = style({
  background: vars.color.surfaceSoft,
  border: vars.border.subtle,
  borderRadius: vars.radius.lg,
});

export const sectionHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: vars.space.lg,
  alignItems: 'flex-end',
  marginBottom: vars.space.xl,
  '@media': {
    'screen and (max-width: 820px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
      marginBottom: vars.space.lg,
    },
  },
});

export const sectionHeaderStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
});

export const sectionEyebrow = style({
  margin: 0,
  fontFamily: vars.font.mono,
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: vars.color.accent,
  opacity: 0.72,
});

export const sectionTitle = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: '40px',
  lineHeight: 1,
  fontWeight: 500,
  letterSpacing: '-0.03em',
  color: vars.color.text,
  '@media': {
    'screen and (max-width: 640px)': {
      fontSize: '32px',
    },
  },
});

export const panelTitle = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: '30px',
  lineHeight: 1,
  fontWeight: 500,
  letterSpacing: '-0.03em',
  color: vars.color.text,
});

export const sectionDescription = style({
  margin: 0,
  maxWidth: '700px',
  fontSize: '14px',
  lineHeight: 1.8,
  fontWeight: 300,
  color: vars.color.textMuted,
});

export const panelDescription = style({
  margin: 0,
  fontSize: '13px',
  lineHeight: 1.75,
  fontWeight: 300,
  color: vars.color.textMuted,
});

export const monoMeta = style({
  fontFamily: vars.font.mono,
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.textFaint,
});

export const iconFrame = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '42px',
  height: '42px',
  borderRadius: vars.radius.md,
  background: vars.color.accentWash,
  border: vars.border.accent,
  color: vars.color.accent,
  flexShrink: 0,
  boxShadow: vars.shadow.glow,
});

export const divider = style({
  width: '100%',
  height: '1px',
  background: vars.color.border,
});

export const textLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  color: vars.color.accent,
  fontFamily: vars.font.mono,
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
  },
});

export const actionButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space.xs,
    borderRadius: vars.radius.pill,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 180ms ease',
    fontFamily: vars.font.mono,
    fontSize: '11px',
    fontWeight: 400,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    selectors: {
      '&:focus-visible': {
        outline: `2px solid ${vars.color.accentGlow}`,
        outlineOffset: '2px',
      },
      '&:disabled': {
        opacity: 0.4,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    tone: {
      accent: {
        background: vars.color.accent,
        color: vars.color.text,
        boxShadow: vars.shadow.glow,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.color.accentHover,
          },
        },
      },
      ghost: {
        background: 'transparent',
        color: vars.color.textSoft,
        border: vars.border.subtle,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.color.surfaceSoft,
            borderColor: vars.color.borderStrong,
            color: vars.color.text,
          },
        },
      },
      subtle: {
        background: vars.color.surfaceSoft,
        color: vars.color.textMuted,
        border: vars.border.subtle,
        selectors: {
          '&:hover:not(:disabled)': {
            color: vars.color.text,
            borderColor: vars.color.borderAccent,
            background: vars.color.accentWash,
          },
        },
      },
    },
    size: {
      sm: {
        minHeight: '34px',
        padding: `0 ${vars.space.md}`,
      },
      md: {
        minHeight: '40px',
        padding: `0 ${vars.space.lg}`,
      },
    },
  },
  defaultVariants: {
    tone: 'ghost',
    size: 'md',
  },
});

export const filterPill = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space.xs,
    minHeight: '36px',
    padding: `0 ${vars.space.md}`,
    borderRadius: vars.radius.pill,
    border: vars.border.subtle,
    background: 'transparent',
    color: vars.color.textMuted,
    fontFamily: vars.font.mono,
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    transition: 'all 180ms ease',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    selectors: {
      '&:hover': {
        color: vars.color.text,
        borderColor: vars.color.borderStrong,
        background: vars.color.surfaceSoft,
      },
      '&:focus-visible': {
        outline: `2px solid ${vars.color.accentGlow}`,
        outlineOffset: '2px',
      },
    },
  },
  variants: {
    active: {
      true: {
        background: vars.color.accentSoft,
        borderColor: vars.color.borderAccent,
        color: vars.color.text,
        boxShadow: vars.shadow.glow,
      },
      false: {},
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const badge = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '22px',
    padding: '0 10px',
    borderRadius: vars.radius.pill,
    fontFamily: vars.font.mono,
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    border: vars.border.subtle,
  },
  variants: {
    tone: {
      default: {
        background: vars.color.surfaceSoft,
        color: vars.color.textMuted,
      },
      accent: {
        background: vars.color.accentSoft,
        borderColor: vars.color.borderAccent,
        color: vars.color.accent,
      },
      success: {
        background: 'rgba(45,138,78,0.16)',
        color: vars.color.success,
      },
      warning: {
        background: 'rgba(200,134,10,0.16)',
        color: vars.color.warning,
      },
      info: {
        background: 'rgba(74,127,181,0.16)',
        color: vars.color.info,
      },
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});

export const emptyState = style({
  padding: `${vars.space.xxl} ${vars.space.lg}`,
  textAlign: 'center',
  color: vars.color.textMuted,
  fontSize: '14px',
  lineHeight: 1.7,
  border: vars.border.subtle,
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
});

export const loadingState = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '160px',
});

export const loadingSpinner = style({
  width: '26px',
  height: '26px',
  borderRadius: '50%',
  border: `2px solid ${vars.color.borderStrong}`,
  borderTopColor: vars.color.accent,
  animation: `${spin} 800ms linear infinite`,
});
