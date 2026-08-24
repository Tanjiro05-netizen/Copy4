import React from 'react';
import Link from 'next/link';
import * as s from './Footer.css.ts';

const sections = [
  { href: '/home', label: 'Home' },
  { href: '/theory', label: 'Theory' },
  { href: '/analysis', label: 'Analysis' },
  { href: '/digital-library', label: 'Library' },
  { href: '/study', label: 'Study' },
  { href: '/politics', label: 'Politics' },
  { href: '/substack', label: 'Bulletin' },
  { href: '/feed', label: 'Feed' },
];

/**
 * Global publication footer — ink band, hairline, wordmark seal, epigraph.
 */
const Footer = () => (
  <footer className={s.footer}>
    <div className={s.inner}>
      <div className={s.col}>
        <p className={s.wordmark}>
          Marxists<span className={s.wordmarkDot}>.</span>Info
        </p>
        <span className={s.rule} aria-hidden="true" />
        <p className={s.mission}>
          An open platform for the study of Marxist theory — texts, analysis,
          discussion, and data.
        </p>
      </div>

      <div className={s.col}>
        <p className={s.colLabel}>Sections</p>
        <div className={s.linkGrid}>
          {sections.map((l) => (
            <Link key={l.href} href={l.href} className={s.link}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className={s.col}>
        <p className={s.colLabel}>Epigraph</p>
        <p className={s.epigraph}>
          &ldquo;The philosophers have only interpreted the world, in various
          ways; the point is to change it.&rdquo;
        </p>
        <p className={s.attribution}>Marx &mdash; Theses on Feuerbach, XI</p>
      </div>
    </div>

    <div className={s.metaRow}>
      <p className={s.meta}>Marxists.Info &mdash; study &middot; analysis &middot; discussion &middot; data</p>
    </div>
  </footer>
);

export default Footer;
