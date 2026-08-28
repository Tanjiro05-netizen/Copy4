import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/obsidianTheme.css.ts';

/* The paper reading room — warm paper ground, near-black ink, crimson rules.
   Modeled on the communist-left.org text pages: metadata header, numbered
   section rail, one long typeset column, download footer. Deliberately light
   inside the app's dark chrome, like a broadsheet laid on a desk. */

export const paperInk = '#1c1a16';
const paperInkFaint = 'rgba(28, 26, 22, 0.62)';
const paperHairline = 'rgba(28, 26, 22, 0.18)';
const crimson = '#b3122e';
const paperGround = '#f5f3ec';

export const root = style({
  position: 'relative',
  background: paperGround,
  color: paperInk,
  borderTop: `1px solid ${paperHairline}`,
  borderBottom: `1px solid ${paperHairline}`,
});

export const progressTrack = style({
  position: 'sticky',
  top: 45,
  zIndex: 5,
  height: '2px',
  background: 'rgba(28, 26, 22, 0.08)',
});

export const progressFill = style({
  height: '100%',
  background: crimson,
  transition: 'width 300ms ease',
});

export const inner = style({
  maxWidth: '1080px',
  margin: '0 auto',
  padding: `${vars.space.xxl} ${vars.space.lg} ${vars.space.xl}`,
});

/* ── Metadata header ── */

export const header = style({
  maxWidth: '640px',
  margin: `0 auto ${vars.space.xxl}`,
  textAlign: 'center',
});

export const kicker = style({
  fontFamily: vars.font.label,
  fontSize: '10px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  color: crimson,
  marginBottom: vars.space.sm,
});

export const title = style({
  fontFamily: vars.font.display,
  fontSize: 'clamp(30px, 4.4vw, 46px)',
  fontWeight: 500,
  lineHeight: 1.12,
  letterSpacing: '-0.01em',
  color: paperInk,
  margin: 0,
});

export const titleRule = style({
  width: '32px',
  height: '2px',
  background: crimson,
  margin: `${vars.space.md} auto`,
});

export const metaLine = style({
  fontFamily: vars.font.body,
  fontSize: '14px',
  color: paperInkFaint,
  margin: 0,
});

export const tags = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: vars.space.xs,
  marginTop: vars.space.md,
});

export const tag = style({
  fontFamily: vars.font.label,
  fontSize: '9.5px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: paperInkFaint,
  border: `1px solid ${paperHairline}`,
  padding: '4px 9px',
  background: 'rgba(255, 255, 255, 0.45)',
});

/* ── Numbered rail + column ── */

export const body = style({
  display: 'grid',
  gridTemplateColumns: '230px minmax(0, 1fr)',
  gap: vars.space.xxl,
  alignItems: 'start',
  '@media': {
    'screen and (max-width: 1023px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const rail = style({
  position: 'sticky',
  top: 72,
  '@media': {
    'screen and (max-width: 1023px)': {
      display: 'none',
    },
  },
});

export const railHeader = style({
  fontFamily: vars.font.label,
  fontSize: '10px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  color: paperInkFaint,
  paddingBottom: vars.space.sm,
  borderBottom: `1px solid ${paperHairline}`,
  marginBottom: vars.space.sm,
});

export const railItem = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space.sm,
  width: '100%',
  textAlign: 'left',
  padding: `${vars.space.xs} ${vars.space.sm} ${vars.space.xs} ${vars.space.md}`,
  background: 'transparent',
  border: 'none',
  borderLeft: `2px solid transparent`,
  fontFamily: vars.font.body,
  fontSize: '13px',
  lineHeight: 1.45,
  color: paperInkFaint,
  cursor: 'pointer',
  transition: 'color 160ms ease, border-color 160ms ease',
  selectors: {
    '&:hover': {
      color: paperInk,
    },
  },
});

export const railItemActive = style({
  color: paperInk,
  borderLeftColor: crimson,
  selectors: {
    '&:hover': {
      color: paperInk,
    },
  },
});

export const railNum = style({
  fontFamily: vars.font.label,
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  fontVariantNumeric: 'tabular-nums',
  color: crimson,
  opacity: 0.55,
  flexShrink: 0,
});

/* ── The column ── */

export const column = style({
  maxWidth: '640px',
  margin: '0 auto',
  paddingBottom: vars.space.xl,
  fontSize: '18px',
});

export const sectionRule = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  maxWidth: '640px',
  margin: `${vars.space.xxl} auto`,
});

export const emptyBox = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.md,
  minHeight: '320px',
  textAlign: 'center',
});

export const emptyText = style({
  color: paperInkFaint,
  fontSize: '14px',
});

export const paperLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  padding: `10px ${vars.space.lg}`,
  border: `1px solid ${crimson}`,
  color: crimson,
  fontFamily: vars.font.label,
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'background 200ms ease, color 200ms ease',
  selectors: {
    '&:hover': {
      background: crimson,
      color: '#ffffff',
    },
  },
});

/* ── Footer ── */

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: vars.space.md,
  maxWidth: '1080px',
  margin: '0 auto',
  padding: `${vars.space.lg} ${vars.space.lg} ${vars.space.xxl}`,
  borderTop: `1px solid ${paperHairline}`,
});

export const footerLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontFamily: vars.font.label,
  fontSize: '10px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: paperInkFaint,
  textDecoration: 'none',
  transition: 'color 160ms ease',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      color: crimson,
    },
  },
});
