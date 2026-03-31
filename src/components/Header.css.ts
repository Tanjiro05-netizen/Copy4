import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../styles/obsidianTheme.css.ts';

export const header = style({
  position: 'fixed',
  top: 0,
  width: '100%',
  zIndex: 50,
  background: vars.color.background,
  borderBottom: vars.border.subtle,
  padding: `${vars.space.sm} 0`,
});

export const headerInner = style({
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `0 ${vars.space.md}`,
});

export const logo = style({
  fontFamily: vars.font.display,
  fontSize: '20px',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  color: vars.color.text,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      color: vars.color.accent,
    },
  },
});

export const desktopNav = style({
  display: 'flex',
  alignItems: 'center',
  '@media': {
    'screen and (max-width: 768px)': {
      display: 'none',
    },
  },
});

export const navRow = style({
  display: 'flex',
  alignItems: 'center',
});

export const navLink = style({
  display: 'flex',
  alignItems: 'center',
  padding: `${vars.space.xs} ${vars.space.md}`,
  fontFamily: vars.font.body,
  fontSize: '13px',
  fontWeight: 400,
  color: vars.color.textMuted,
  transition: 'color 180ms ease',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
  },
});

export const navLinkActive = style({
  color: vars.color.accent,
});

export const navLinkRestricted = style({
  color: vars.color.textFaint,
  selectors: {
    '&:hover': {
      color: vars.color.textMuted,
    },
  },
});

export const restrictedMark = style({
  marginLeft: vars.space.xxs,
  fontSize: '10px',
  color: vars.color.textFaint,
});

/* ── Dropdown ── */

export const dropdownWrap = style({
  position: 'relative',
});

export const dropdownTrigger = style({
  display: 'flex',
  alignItems: 'center',
  padding: `${vars.space.xs} ${vars.space.md}`,
  fontFamily: vars.font.body,
  fontSize: '13px',
  fontWeight: 400,
  color: vars.color.textMuted,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  transition: 'color 180ms ease',
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
  },
});

export const dropdownTriggerActive = style({
  color: vars.color.accent,
});

export const dropdownMenu = style({
  position: 'absolute',
  left: 0,
  top: '100%',
  width: '240px',
  background: vars.color.surface,
  border: vars.border.subtle,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.panel,
  padding: vars.space.xxs,
  opacity: 0,
  visibility: 'hidden' as any,
  transition: 'opacity 180ms ease, visibility 180ms ease',
  zIndex: 50,
  selectors: {
    [`${dropdownWrap}:hover &`]: {
      opacity: 1,
      visibility: 'visible' as any,
    },
  },
});

export const dropdownItem = style({
  display: 'block',
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.sm,
  fontSize: '13px',
  color: vars.color.textSoft,
  transition: 'all 140ms ease',
  selectors: {
    '&:hover': {
      background: vars.color.surfaceSoft,
      color: vars.color.text,
    },
  },
});

export const dropdownItemActive = style({
  background: vars.color.surfaceSoft,
  color: vars.color.text,
});

export const dropdownItemLabel = style({
  display: 'block',
  fontWeight: 500,
  marginBottom: '2px',
});

export const dropdownItemDesc = style({
  display: 'block',
  fontSize: '11px',
  color: vars.color.textFaint,
});

/* ── Actions ── */

export const actionsRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
});

export const iconButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  borderRadius: vars.radius.pill,
  background: 'transparent',
  border: 'none',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'all 180ms ease',
  selectors: {
    '&:hover': {
      background: vars.color.surfaceSoft,
      color: vars.color.text,
    },
  },
});

export const loginButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${vars.space.xs} ${vars.space.md}`,
  background: vars.color.accent,
  color: vars.color.text,
  borderRadius: vars.radius.pill,
  border: 'none',
  fontSize: '13px',
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

/* ── Mobile ── */

export const mobileMenuBtn = style([iconButton, {
  '@media': {
    'screen and (min-width: 769px)': {
      display: 'none',
    },
  },
}]);

export const mobileOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  background: vars.color.background,
  paddingTop: '64px',
  overflowY: 'auto',
  '@media': {
    'screen and (min-width: 769px)': {
      display: 'none',
    },
  },
});

export const mobileInner = style({
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  padding: `${vars.space.xl} ${vars.space.md}`,
  display: 'flex',
  flexDirection: 'column',
});

export const mobileCloseRow = style({
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: vars.space.md,
});

export const mobileNavStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.lg,
});

export const mobileLink = style({
  display: 'flex',
  alignItems: 'center',
  fontSize: '18px',
  fontWeight: 500,
  color: vars.color.text,
  transition: 'color 180ms ease',
  selectors: {
    '&:hover': {
      color: vars.color.accent,
    },
  },
});

export const mobileLinkActive = style({
  color: vars.color.accent,
});

export const mobileLinkRestricted = style({
  color: vars.color.textFaint,
  selectors: {
    '&:hover': {
      color: vars.color.textMuted,
    },
  },
});

export const mobileGroupLabel = style({
  fontSize: '18px',
  fontWeight: 500,
  color: vars.color.textMuted,
});

export const mobileSubStack = style({
  paddingLeft: vars.space.md,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
});

export const mobileSubLink = style({
  display: 'block',
  fontSize: '16px',
  fontWeight: 500,
  color: vars.color.text,
  transition: 'color 180ms ease',
  selectors: {
    '&:hover': {
      color: vars.color.accent,
    },
  },
});

export const mobileSubDesc = style({
  display: 'block',
  fontSize: '12px',
  color: vars.color.textFaint,
});

export const mobileComingSoon = style({
  marginLeft: vars.space.xs,
  fontSize: '12px',
  color: vars.color.textFaint,
});

export const mobileActions = style({
  marginTop: vars.space.xl,
  display: 'flex',
  justifyContent: 'center',
  gap: vars.space.lg,
});

export const mobileLogout = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  color: vars.color.text,
  background: 'none',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'color 180ms ease',
  selectors: {
    '&:hover': {
      color: vars.color.accent,
    },
  },
});
