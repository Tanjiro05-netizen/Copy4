import { style } from '@vanilla-extract/css';
import { vars } from '../styles/obsidianTheme.css.ts';

export const page = style({ minHeight: '100vh', background: vars.color.background, color: vars.color.text });
export const main = style({ maxWidth: vars.layout.maxWidth, margin: '0 auto', padding: `${vars.space.xl} ${vars.space.md} ${vars.space.hero}` });
export const pageTitle = style({ fontFamily: vars.font.display, fontSize: '48px', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: vars.space.lg });
