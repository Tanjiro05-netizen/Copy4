import { style, globalStyle } from '@vanilla-extract/css';
import { vars, panelBase, panelInset } from '../../styles/obsidianTheme.css.ts';

/* ── Page shell ─────────────────────────────────────────── */

export const page = style({
  position: 'relative',
  minHeight: '100vh',
  overflow: 'hidden',
});

export const heroOrbLeft = style({
  top: '80px',
  left: '-120px',
  width: '320px',
  height: '320px',
  background: 'radial-gradient(circle, rgba(200,30,30,0.18) 0%, rgba(200,30,30,0.02) 70%)',
});

export const heroOrbRight = style({
  top: '200px',
  right: '-100px',
  width: '260px',
  height: '260px',
  background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 72%)',
});

/* ── Hero banner ────────────────────────────────────────── */

export const hero = style({
  position: 'relative',
  padding: `${vars.space.hero} ${vars.space.gutter} ${vars.space.xxl}`,
  borderBottom: vars.border.subtle,
  '@media': {
    'screen and (max-width: 900px)': {
      padding: `${vars.space.xxxl} ${vars.space.gutter} ${vars.space.xxl}`,
    },
    'screen and (max-width: 640px)': {
      padding: `${vars.space.xxl} ${vars.space.md} ${vars.space.xl}`,
    },
  },
});

export const heroInner = style({
  position: 'relative',
  zIndex: 1,
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
});

export const heroTitle = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: 'clamp(3.2rem, 7vw, 5.8rem)',
  lineHeight: 0.9,
  letterSpacing: '-0.05em',
  fontWeight: 500,
  color: vars.color.text,
});

export const heroLead = style({
  margin: `${vars.space.lg} 0 0`,
  maxWidth: '600px',
  fontSize: '15px',
  lineHeight: 1.85,
  fontWeight: 300,
  color: vars.color.textMuted,
});

/* ── Content container ──────────────────────────────────── */

export const content = style({
  position: 'relative',
  zIndex: 1,
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  padding: `${vars.space.xxxl} ${vars.space.gutter} ${vars.space.xxxl}`,
  '@media': {
    'screen and (max-width: 640px)': {
      padding: `${vars.space.xxl} ${vars.space.md} ${vars.space.xxxl}`,
    },
  },
});

/* ── Board listing ──────────────────────────────────────── */

export const boardList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
});

export const boardRow = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: vars.space.lg,
  alignItems: 'center',
  padding: `${vars.space.xl} 0`,
  borderBottom: vars.border.subtle,
  cursor: 'pointer',
  transition: 'background 180ms ease',
  selectors: {
    '&:first-child': {
      paddingTop: 0,
    },
    '&:hover': {
      background: vars.color.surfaceSoft,
    },
  },
  '@media': {
    'screen and (max-width: 640px)': {
      gridTemplateColumns: '1fr',
      gap: vars.space.sm,
    },
  },
});

export const boardInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
  minWidth: 0,
});

export const boardNameRow = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space.sm,
  flexWrap: 'wrap',
});

export const boardName = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: '28px',
  fontWeight: 600,
  lineHeight: 1.1,
  color: vars.color.text,
  '@media': {
    'screen and (max-width: 640px)': {
      fontSize: '22px',
    },
  },
});

export const boardSlug = style({
  fontFamily: vars.font.mono,
  fontSize: '14px',
  letterSpacing: '0.04em',
  color: vars.color.textFaint,
});

export const boardDescription = style({
  margin: 0,
  fontSize: '14px',
  lineHeight: 1.6,
  fontWeight: 300,
  color: vars.color.textMuted,
});

export const boardMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  flexShrink: 0,
});

export const boardStat = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xxs,
  fontFamily: vars.font.mono,
  fontSize: '12px',
  letterSpacing: '0.06em',
  color: vars.color.textFaint,
});

/* ── Breadcrumb / back nav ──────────────────────────────── */

export const breadcrumb = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  marginBottom: vars.space.xl,
  fontFamily: vars.font.mono,
  fontSize: '12px',
  letterSpacing: '0.06em',
  color: vars.color.textFaint,
});

export const breadcrumbLink = style({
  color: vars.color.accent,
  cursor: 'pointer',
  transition: 'color 180ms ease',
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
  },
});

/* ── Thread list view ───────────────────────────────────── */

export const threadListHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: vars.space.md,
  marginBottom: vars.space.xl,
  flexWrap: 'wrap',
});

export const threadListTitle = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: '34px',
  lineHeight: 1,
  fontWeight: 500,
  letterSpacing: '-0.03em',
  color: vars.color.text,
  '@media': {
    'screen and (max-width: 640px)': {
      fontSize: '26px',
    },
  },
});

export const threadListActions = style({
  display: 'flex',
  gap: vars.space.sm,
});

/* ── Thread cards (Obsidian-styled overrides) ───────────── */

export const threadCard = style([panelInset, {
  padding: vars.space.lg,
  marginBottom: vars.space.md,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
  transition: 'border-color 180ms ease, background 180ms ease',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      borderColor: vars.color.borderAccent,
      background: vars.color.accentWash,
    },
  },
}]);

export const threadTitle = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: '20px',
  lineHeight: 1.2,
  fontWeight: 500,
  color: vars.color.text,
});

export const threadExcerpt = style({
  margin: 0,
  fontSize: '13px',
  lineHeight: 1.7,
  fontWeight: 300,
  color: vars.color.textMuted,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const threadMetaRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.md,
  alignItems: 'center',
  fontFamily: vars.font.mono,
  fontSize: '11px',
  letterSpacing: '0.06em',
  color: vars.color.textFaint,
});

export const threadMetaStat = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xxs,
});

export const threadAuthor = style({
  color: vars.color.accent,
});

export const threadPinned = style({
  color: vars.color.warning,
});

export const threadLocked = style({
  color: vars.color.accent,
});

/* ── Thread detail wrapper ──────────────────────────────── */

export const threadDetailPanel = style([panelBase, {
  padding: vars.space.xxl,
  '@media': {
    'screen and (max-width: 640px)': {
      padding: vars.space.lg,
    },
  },
}]);

export const threadDetailHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  paddingBottom: vars.space.md,
  marginBottom: vars.space.lg,
  borderBottom: vars.border.subtle,
});

export const threadDetailAuthor = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
});

export const threadDetailTitle = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: '32px',
  lineHeight: 1.1,
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: vars.color.text,
  marginBottom: vars.space.lg,
  '@media': {
    'screen and (max-width: 640px)': {
      fontSize: '24px',
    },
  },
});

export const threadDetailContent = style({
  fontSize: '15px',
  lineHeight: 1.8,
  fontWeight: 300,
  color: vars.color.textSoft,
  marginBottom: vars.space.xl,
});

globalStyle(`${threadDetailContent} .greentext`, {
  color: '#88cc88',
});

export const threadDetailActions = style({
  display: 'flex',
  gap: vars.space.md,
  paddingTop: vars.space.md,
  borderTop: vars.border.subtle,
  fontFamily: vars.font.mono,
  fontSize: '11px',
  letterSpacing: '0.06em',
});

export const threadDetailAction = style({
  color: vars.color.textFaint,
  cursor: 'pointer',
  transition: 'color 180ms ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xxs,
  background: 'none',
  border: 'none',
  padding: 0,
  fontFamily: vars.font.mono,
  fontSize: '11px',
  letterSpacing: '0.06em',
  selectors: {
    '&:hover': {
      color: vars.color.text,
    },
  },
});

export const threadDetailActionActive = style({
  color: vars.color.accent,
});

/* ── Comment section ────────────────────────────────────── */

export const commentSection = style({
  marginTop: vars.space.xxl,
});

export const commentSectionTitle = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: '24px',
  fontWeight: 500,
  color: vars.color.text,
  marginBottom: vars.space.lg,
});

export const commentCard = style([panelInset, {
  padding: vars.space.md,
  marginBottom: vars.space.sm,
}]);

export const commentHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  marginBottom: vars.space.xs,
  fontFamily: vars.font.mono,
  fontSize: '11px',
  letterSpacing: '0.06em',
  color: vars.color.textFaint,
});

export const commentAuthorName = style({
  color: vars.color.accent,
  fontWeight: 500,
});

export const commentBody = style({
  fontSize: '14px',
  lineHeight: 1.7,
  fontWeight: 300,
  color: vars.color.textSoft,
});

export const commentActions = style({
  display: 'flex',
  gap: vars.space.md,
  marginTop: vars.space.xs,
  fontFamily: vars.font.mono,
  fontSize: '10px',
  letterSpacing: '0.06em',
  color: vars.color.textFaint,
});

export const nestedComment = style({
  marginLeft: vars.space.xl,
  borderLeft: vars.border.subtle,
  paddingLeft: vars.space.md,
});

/* ── Create thread form ─────────────────────────────────── */

export const formPanel = style([panelBase, {
  padding: vars.space.xxl,
  marginBottom: vars.space.xl,
  '@media': {
    'screen and (max-width: 640px)': {
      padding: vars.space.lg,
    },
  },
}]);

export const formTitle = style({
  margin: `0 0 ${vars.space.lg}`,
  fontFamily: vars.font.display,
  fontSize: '24px',
  fontWeight: 500,
  color: vars.color.text,
});

export const formField = style({
  marginBottom: vars.space.lg,
});

export const formLabel = style({
  display: 'block',
  marginBottom: vars.space.xs,
  fontFamily: vars.font.mono,
  fontSize: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: vars.color.textFaint,
});

export const formInput = style({
  width: '100%',
  minHeight: '42px',
  padding: `${vars.space.sm} ${vars.space.md}`,
  background: vars.color.surfaceSoft,
  border: vars.border.subtle,
  borderRadius: vars.radius.sm,
  color: vars.color.text,
  fontSize: '14px',
  fontFamily: vars.font.body,
  outline: 'none',
  transition: 'border-color 180ms ease',
  selectors: {
    '&:focus': {
      borderColor: vars.color.borderAccent,
    },
    '&::placeholder': {
      color: vars.color.textFaint,
    },
  },
});

export const formTextarea = style([formInput, {
  minHeight: '160px',
  resize: 'vertical',
  lineHeight: 1.7,
}]);

export const formSelect = style([formInput, {
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.28)'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: vars.space.xl,
  cursor: 'pointer',
}]);

export const formError = style({
  color: vars.color.accent,
  fontSize: '12px',
  marginBottom: vars.space.md,
});

export const formActions = style({
  display: 'flex',
  gap: vars.space.sm,
});

export const charCount = style({
  fontFamily: vars.font.mono,
  fontSize: '10px',
  color: vars.color.textFaint,
  marginTop: vars.space.xxs,
});

/* ── Empty / loading states ─────────────────────────────── */

export const emptyBoard = style({
  padding: `${vars.space.xxl} ${vars.space.lg}`,
  textAlign: 'center',
  color: vars.color.textMuted,
  fontSize: '14px',
  lineHeight: 1.7,
  border: vars.border.subtle,
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
});

export const loadingWrap = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
});

/* ── Comment form ───────────────────────────────────────── */

export const commentFormWrap = style([panelInset, {
  padding: vars.space.lg,
  marginBottom: vars.space.xl,
}]);

export const commentFormTextarea = style([formInput, {
  minHeight: '100px',
  resize: 'vertical',
  lineHeight: 1.7,
  marginBottom: vars.space.sm,
}]);

export const commentFormActions = style({
  display: 'flex',
  gap: vars.space.sm,
  alignItems: 'center',
});

// ── Theory References (Qdrant corpus cross-refs) ────────────

export const theoryRefsPanel = style({
  marginTop: vars.space.xl,
  marginBottom: vars.space.xl,
  border: vars.border.subtle,
  borderRadius: vars.radius.lg,
  overflow: 'hidden',
});

export const theoryRefsToggle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  width: '100%',
  padding: `${vars.space.md} ${vars.space.lg}`,
  background: 'none',
  border: 'none',
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
  transition: 'color 0.2s',
  ':hover': {
    color: vars.color.text,
  },
});

export const theoryRefsList = style({
  padding: `0 ${vars.space.lg} ${vars.space.lg}`,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: vars.space.md,
});

export const theoryRefCard = style({
  padding: vars.space.md,
  borderRadius: vars.radius.md,
  background: vars.color.surfaceSoft,
  border: vars.border.subtle,
  transition: 'border-color 0.2s',
  ':hover': {
    borderColor: vars.color.borderAccent,
  },
});

export const theoryRefSource = style({
  fontFamily: vars.font.mono,
  fontSize: '11px',
  color: vars.color.accent,
  letterSpacing: '0.04em',
  marginBottom: vars.space.xs,
});

export const theoryRefExcerpt = style({
  fontSize: '13px',
  lineHeight: '1.65',
  color: vars.color.textSoft,
});

export const theoryRefTags = style({
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: vars.space.xs,
  marginTop: vars.space.sm,
});

export const theoryRefTag = style({
  fontFamily: vars.font.mono,
  fontSize: '10px',
  letterSpacing: '0.06em',
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  background: vars.color.surfaceRaised,
  color: vars.color.textFaint,
});
