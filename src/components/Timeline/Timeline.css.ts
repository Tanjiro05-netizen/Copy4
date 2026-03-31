import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../../styles/obsidianTheme.css.ts';

const pulseGlow = keyframes({
  '0%, 100%': { opacity: 0.4 },
  '50%': { opacity: 1 },
});

const ping = keyframes({
  '75%, 100%': { transform: 'scale(2)', opacity: 0 },
});

const slideInLeft = keyframes({
  from: { opacity: 0, transform: 'translateX(-24px)' },
  to: { opacity: 1, transform: 'translateX(0)' },
});

const slideInRight = keyframes({
  from: { opacity: 0, transform: 'translateX(24px)' },
  to: { opacity: 1, transform: 'translateX(0)' },
});

/* ── root ── */
export const root = style({
  position: 'relative',
  padding: `0 ${vars.space.md}`,
  '@media': {
    'screen and (min-width: 768px)': { padding: `0 ${vars.space.xl}` },
  },
});

/* ── filter bar ── */
export const filterBar = style({
  position: 'sticky',
  top: vars.space.md,
  zIndex: 20,
  marginBottom: vars.space.xl,
});

export const filterInner = style({
  maxWidth: 'fit-content',
  margin: '0 auto',
  background: 'rgba(9,9,9,0.72)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: vars.radius.lg,
  padding: vars.space.xs,
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.xs,
  justifyContent: 'center',
  border: vars.border.subtle,
});

export const filterBtn = style({
  padding: `${vars.space.xs} ${vars.space.md}`,
  borderRadius: vars.radius.sm,
  transition: 'all 180ms ease',
  color: vars.color.textMuted,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontFamily: vars.font.mono,
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': { color: vars.color.text },
  },
});

export const filterBtnActive = style({
  background: vars.color.accent,
  color: vars.color.text,
  boxShadow: vars.shadow.glow,
});

/* ── scroll-to-top ── */
export const scrollBtn = style({
  position: 'fixed',
  bottom: vars.space.xl,
  right: vars.space.xl,
  zIndex: 20,
  transition: 'opacity 300ms ease',
  background: vars.color.accent,
  padding: vars.space.sm,
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  boxShadow: vars.shadow.glow,
  color: vars.color.text,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  selectors: {
    '&:hover': { background: vars.color.accentHover },
  },
});

export const scrollBtnHidden = style({ opacity: 0, pointerEvents: 'none' });
export const scrollBtnVisible = style({ opacity: 1 });

/* ── spine (centre line) ── */
export const spine = style({
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  height: '100%',
  width: '2px',
  background: `linear-gradient(180deg, ${vars.color.borderAccent} 0%, ${vars.color.accent} 40%, ${vars.color.accent} 60%, ${vars.color.borderAccent} 100%)`,
  opacity: 0.38,
  '@media': {
    'screen and (max-width: 768px)': { left: vars.space.lg },
  },
});

export const spinePulse = style({
  position: 'absolute',
  inset: 0,
  background: `linear-gradient(180deg, transparent 0%, rgba(200,30,30,0.24) 50%, transparent 100%)`,
  animation: `${pulseGlow} 4s ease-in-out infinite`,
});

/* ── event list ── */
export const eventList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.hero,
});

/* ── single event row ── */
export const eventRow = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

export const eventRowLeft = style({ flexDirection: 'row' });
export const eventRowRight = style({ flexDirection: 'row-reverse' });

/* ── card container (occupies 5/12 width) ── */
export const cardWrap = style({
  width: '41.667%',
  '@media': {
    'screen and (max-width: 768px)': {
      width: '100%',
      paddingLeft: `calc(${vars.space.lg} + ${vars.space.xl})`,
    },
  },
});

export const cardWrapLeft = style({
  paddingRight: vars.space.xl,
  textAlign: 'right',
  animation: `${slideInLeft} 500ms ease both`,
  '@media': {
    'screen and (max-width: 768px)': {
      paddingRight: 0,
      textAlign: 'left',
    },
  },
});

export const cardWrapRight = style({
  paddingLeft: vars.space.xl,
  textAlign: 'left',
  animation: `${slideInRight} 500ms ease both`,
  '@media': {
    'screen and (max-width: 768px)': {
      paddingLeft: `calc(${vars.space.lg} + ${vars.space.xl})`,
    },
  },
});

/* ── card ── */
export const card = style({
  position: 'relative',
  background: `linear-gradient(180deg, ${vars.color.surfaceRaised} 0%, ${vars.color.surface} 100%)`,
  backdropFilter: 'blur(6px)',
  padding: vars.space.lg,
  borderRadius: vars.radius.lg,
  border: vars.border.subtle,
  transition: 'all 300ms ease',
  cursor: 'pointer',
  overflow: 'hidden',
  selectors: {
    '&:hover': {
      transform: 'scale(1.03)',
      borderColor: vars.color.borderAccent,
      boxShadow: vars.shadow.glow,
    },
  },
});

export const cardActive = style({
  borderColor: vars.color.accent,
  boxShadow: vars.shadow.glow,
});

/* ── card innards ── */
export const cardCategory = style({
  fontFamily: vars.font.mono,
  fontSize: '10px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: vars.color.accent,
  marginBottom: vars.space.xs,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
});

export const cardTitle = style({
  fontFamily: vars.font.display,
  fontSize: '22px',
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  color: vars.color.text,
  marginBottom: vars.space.xs,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
});

export const cardLinkIcon = style({
  opacity: 0,
  transition: 'opacity 200ms ease',
  color: vars.color.textFaint,
  selectors: {
    [`${card}:hover &`]: { opacity: 1 },
  },
});

export const cardDesc = style({
  fontSize: '14px',
  lineHeight: 1.7,
  fontWeight: 300,
  color: vars.color.textMuted,
  marginBottom: vars.space.sm,
});

export const cardImage = style({
  marginTop: vars.space.sm,
  overflow: 'hidden',
  borderRadius: vars.radius.md,
});

export const cardImg = style({
  width: '100%',
  height: '140px',
  objectFit: 'cover',
  transition: 'transform 500ms ease',
  selectors: {
    [`${card}:hover &`]: { transform: 'scale(1.08)' },
  },
});

export const cardLocation = style({
  fontFamily: vars.font.mono,
  fontSize: '10px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: vars.color.textFaint,
  marginTop: vars.space.xs,
});

export const cardPeople = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.xxs,
  marginTop: vars.space.xs,
});

export const personTag = style({
  display: 'inline-block',
  padding: `2px ${vars.space.xs}`,
  borderRadius: vars.radius.pill,
  background: vars.color.accentWash,
  border: `1px solid ${vars.color.borderAccent}`,
  fontFamily: vars.font.mono,
  fontSize: '9px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: vars.color.accent,
});

/* ── centre dot ── */
export const centrePoint = style({
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 2,
  '@media': {
    'screen and (max-width: 768px)': { left: vars.space.lg },
  },
});

export const dot = style({
  position: 'relative',
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  background: vars.color.accent,
  border: `3px solid ${vars.color.background}`,
  boxShadow: `0 0 8px rgba(200,30,30,0.4)`,
});

export const dotActive = style({
  animation: `${pulseGlow} 1.5s ease-in-out infinite`,
});

export const dotPing = style({
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  background: vars.color.accent,
  animation: `${ping} 1.5s cubic-bezier(0, 0, 0.2, 1) infinite`,
  opacity: 0.6,
});

export const yearLabel = style({
  fontFamily: vars.font.mono,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: vars.color.accent,
  marginTop: vars.space.xxs,
  whiteSpace: 'nowrap',
});

/* ── importance indicators ── */
export const importanceCritical = style({
  selectors: {
    [`&::before`]: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '3px',
      height: '100%',
      background: vars.color.accent,
      borderRadius: `${vars.radius.lg} 0 0 ${vars.radius.lg}`,
    },
  },
});

/* ── loading / empty ── */
export const loadingWrap = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '300px',
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: '12px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
});

export const emptyWrap = style({
  textAlign: 'center',
  padding: vars.space.xxl,
  color: vars.color.textMuted,
  fontFamily: vars.font.body,
  fontSize: '14px',
});

/* ══════════════════════════════════════
   DETAIL MODAL (frosted glass)
   ══════════════════════════════════════ */

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const scaleIn = keyframes({
  from: { opacity: 0, transform: 'translate(-50%, -50%) scale(0.95)' },
  to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

export const modalOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  animation: `${fadeIn} 200ms ease both`,
});

export const modalPanel = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 101,
  width: '90vw',
  maxWidth: '640px',
  maxHeight: '85vh',
  overflowY: 'auto',
  background: 'rgba(14,14,14,0.88)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: `1px solid rgba(200,30,30,0.18)`,
  borderRadius: vars.radius.xl,
  boxShadow: `0 0 60px rgba(200,30,30,0.08), ${vars.shadow.panel}`,
  padding: vars.space.xl,
  animation: `${scaleIn} 250ms ease both`,
});

export const modalClose = style({
  position: 'absolute',
  top: vars.space.md,
  right: vars.space.md,
  background: 'transparent',
  border: 'none',
  color: vars.color.textFaint,
  cursor: 'pointer',
  padding: vars.space.xxs,
  borderRadius: vars.radius.sm,
  transition: 'color 150ms ease, background 150ms ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  selectors: {
    '&:hover': { color: vars.color.accent, background: vars.color.accentWash },
  },
});

export const modalHero = style({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: vars.radius.lg,
  marginBottom: vars.space.lg,
});

export const modalCategory = style({
  fontFamily: vars.font.mono,
  fontSize: '10px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: vars.color.accent,
  marginBottom: vars.space.xs,
});

export const modalTitle = style({
  fontFamily: vars.font.display,
  fontSize: '32px',
  fontWeight: 500,
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  color: vars.color.text,
  marginBottom: vars.space.sm,
  paddingRight: vars.space.xl,
});

export const modalMeta = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.md,
  fontFamily: vars.font.mono,
  fontSize: '11px',
  letterSpacing: '0.06em',
  color: vars.color.textFaint,
  marginBottom: vars.space.lg,
  textTransform: 'uppercase',
});

export const modalMetaItem = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});

export const modalDivider = style({
  height: '1px',
  background: `linear-gradient(90deg, ${vars.color.borderAccent}, transparent)`,
  border: 'none',
  marginBottom: vars.space.lg,
});

export const modalBody = style({
  fontSize: '15px',
  lineHeight: 1.8,
  fontWeight: 300,
  color: vars.color.textSoft,
  fontFamily: vars.font.body,
  marginBottom: vars.space.lg,
  whiteSpace: 'pre-wrap',
});

export const modalPeople = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.xs,
  marginBottom: vars.space.lg,
});

/* ── glossary preview section ── */
export const glossarySection = style({
  marginTop: vars.space.lg,
  paddingTop: vars.space.lg,
  borderTop: vars.border.subtle,
});

export const glossarySectionTitle = style({
  fontFamily: vars.font.mono,
  fontSize: '10px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: vars.color.textFaint,
  marginBottom: vars.space.md,
});

export const glossaryCard = style({
  background: vars.color.surface,
  border: vars.border.subtle,
  borderRadius: vars.radius.lg,
  padding: vars.space.md,
  marginBottom: vars.space.sm,
  transition: 'all 180ms ease',
  selectors: {
    '&:hover': {
      borderColor: vars.color.borderAccent,
      background: vars.color.surfaceRaised,
    },
  },
});

export const glossaryCardTerm = style({
  fontFamily: vars.font.display,
  fontSize: '16px',
  fontWeight: 500,
  color: vars.color.text,
  marginBottom: vars.space.xxs,
});

export const glossaryCardType = style({
  fontFamily: vars.font.mono,
  fontSize: '9px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: vars.color.accent,
  marginLeft: vars.space.xs,
});

export const glossaryCardExcerpt = style({
  fontSize: '13px',
  lineHeight: 1.6,
  color: vars.color.textMuted,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  marginBottom: vars.space.xs,
});

export const glossaryCardLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontFamily: vars.font.mono,
  fontSize: '10px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: vars.color.accent,
  textDecoration: 'none',
  transition: 'opacity 150ms ease',
  selectors: { '&:hover': { opacity: 0.75 } },
});
