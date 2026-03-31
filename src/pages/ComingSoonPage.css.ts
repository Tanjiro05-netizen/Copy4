import { style } from '@vanilla-extract/css';
import { vars } from '../styles/obsidianTheme.css.ts';

export const page = style({
  minHeight: '100vh',
  background: vars.color.background,
  color: vars.color.text,
});

export const inner = style({
  maxWidth: '680px',
  margin: '0 auto',
  padding: `${vars.space.hero} ${vars.space.md}`,
  textAlign: 'center',
});

export const title = style({
  fontFamily: vars.font.display,
  fontSize: '56px',
  fontWeight: 500,
  letterSpacing: '-0.03em',
  lineHeight: 1,
  color: vars.color.accent,
  marginBottom: vars.space.md,
  '@media': {
    'screen and (max-width: 640px)': {
      fontSize: '36px',
    },
  },
});

export const rule = style({
  width: '96px',
  height: '1px',
  background: vars.color.accent,
  margin: `0 auto ${vars.space.xl}`,
});

export const subtitle = style({
  fontSize: '20px',
  lineHeight: 1.6,
  fontWeight: 300,
  color: vars.color.textSoft,
  marginBottom: vars.space.xl,
});

export const card = style({
  background: vars.color.surface,
  border: vars.border.subtle,
  borderRadius: vars.radius.xl,
  padding: vars.space.xl,
  marginBottom: vars.space.xxl,
  textAlign: 'left',
});

export const cardTitle = style({
  fontFamily: vars.font.display,
  fontSize: '24px',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  marginBottom: vars.space.md,
});

export const cardText = style({
  fontSize: '14px',
  lineHeight: 1.8,
  color: vars.color.textMuted,
  marginBottom: vars.space.md,
  selectors: {
    '&:last-child': {
      marginBottom: 0,
    },
  },
});

export const backButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.xs,
  padding: `${vars.space.sm} ${vars.space.lg}`,
  background: vars.color.accent,
  color: vars.color.text,
  borderRadius: vars.radius.pill,
  border: 'none',
  fontSize: '14px',
  fontWeight: 500,
  fontFamily: vars.font.body,
  cursor: 'pointer',
  transition: 'background 180ms ease',
  selectors: {
    '&:hover': {
      background: vars.color.accentHover,
    },
  },
});
