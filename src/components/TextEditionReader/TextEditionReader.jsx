import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertCircle, ArrowLeft, Download } from 'lucide-react';
import * as s from './TextEditionReader.css.ts';

/* Paper prose — the light twin of the editorial column. Ink text on warm
   paper, Cormorant headings, crimson accents, drop cap on the opening
   paragraph of the whole text. */
const paperProseCss = `
  [data-paper-section] {
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
    font-weight: 400;
    line-height: 1.75;
    color: #1c1a16;
    text-align: left;
  }
  [data-paper-section] h1,
  [data-paper-section] h2,
  [data-paper-section] h3,
  [data-paper-section] h4,
  [data-paper-section] h5,
  [data-paper-section] h6 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 500;
    color: #14120e;
    line-height: 1.2;
    margin: 2.2em 0 0.8em;
    letter-spacing: 0.01em;
  }
  [data-paper-section] h1 { font-size: 1.85em; }
  [data-paper-section] h2 { font-size: 1.6em; }
  [data-paper-section] h3 { font-size: 1.35em; }
  [data-paper-section] p {
    margin: 0 0 1.15em;
    padding: 0;
  }
  [data-paper-section] a {
    color: #b3122e;
    text-decoration: none;
    border-bottom: 1px solid rgba(179, 18, 46, 0.35);
  }
  [data-paper-section] a:hover { color: #14120e; }
  [data-paper-section] em,
  [data-paper-section] i { font-style: italic; color: inherit; }
  [data-paper-section] blockquote {
    border-left: 2px solid #b3122e;
    padding-left: 1.4em;
    margin: 1.8em 0;
    font-style: italic;
    color: rgba(28, 26, 22, 0.75);
  }
  [data-paper-section] hr {
    border: none;
    border-top: 1px solid rgba(28, 26, 22, 0.2);
    margin: 3em auto;
    width: 40%;
  }
  [data-paper-section] img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 2em auto;
    border: 1px solid rgba(28, 26, 22, 0.2);
    padding: 6px;
    background: #ffffff;
  }
  [data-paper-section] table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.8em 0;
    font-size: 0.92em;
  }
  [data-paper-section] td,
  [data-paper-section] th {
    border: 1px solid rgba(28, 26, 22, 0.25);
    padding: 8px 10px;
    text-align: left;
  }
  [data-paper-section] th {
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(28, 26, 22, 0.62);
  }
  [data-paper-section] sup { color: #b3122e; }
  [data-paper-section] ::selection { background: rgba(216, 199, 159, 0.75); color: #14120e; }

  /* The drop cap — only the very first paragraph of the whole text */
  [data-paper-section="true"]:first-of-type > p:first-of-type::first-letter,
  [data-paper-section="true"]:first-of-type > p:first-child::first-letter {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 600;
    font-size: 3.4em;
    float: left;
    line-height: 0.8;
    padding-right: 0.14em;
    padding-top: 0.06em;
    color: #b3122e;
  }
`;

/**
 * The text-edition reading surface — a warm paper page in the manner of the
 * communist-left.org text pages: metadata header (title, author, year,
 * reading time, tags), a numbered section rail, one long typeset markdown
 * column, and a footer offering the way back to the library plus the fixed
 * PDF edition. Sections come from digital_library_books.text_edition.
 */
const TextEditionReader = ({ book, edition, onProgressChange, pdfUrl }) => {
    const rootRef = useRef(null);
    const onProgressRef = useRef(onProgressChange);
    onProgressRef.current = onProgressChange;

    const sections = edition?.sections || [];
    const [activeId, setActiveId] = useState(sections[0]?.id ?? null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (sections.length && !sections.some((sec) => sec.id === activeId)) {
            setActiveId(sections[0].id);
        }
    }, [sections, activeId]);

    /* One long page: progress and scroll-spy run on the document scroll. */
    useEffect(() => {
        if (!sections.length) return undefined;

        const handleScroll = () => {
            const root = rootRef.current;
            if (!root) return;

            const rect = root.getBoundingClientRect();
            const scrollable = rect.height - window.innerHeight;
            const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(scrollable, 0));
            const pct = scrollable > 0 ? Math.round((scrolled / scrollable) * 100) : 0;
            setProgress(pct);
            if (onProgressRef.current) onProgressRef.current(pct);

            const marker = window.innerHeight * 0.35;
            const nodes = Array.from(root.querySelectorAll('[data-section-canonical]'));
            const active =
                nodes.filter((n) => n.getBoundingClientRect().top <= marker).pop() || nodes[0];
            if (active) setActiveId(active.getAttribute('data-section-canonical'));
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections.length]);

    const scrollToSection = useCallback((id) => {
        const node = rootRef.current?.querySelector(`[data-section-canonical="${id}"]`);
        if (!node) return;
        const top = node.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, []);

    if (!sections.length) {
        return (
            <div className={s.root} data-testid="text-edition-reader-empty">
                <div className={s.emptyBox}>
                    <AlertCircle size={26} style={{ color: '#b3122e' }} />
                    <span className={s.emptyText}>This text edition is empty.</span>
                    {pdfUrl && (
                        <a className={s.paperLink} href={pdfUrl} target="_blank" rel="noopener noreferrer">
                            Open the PDF directly
                        </a>
                    )}
                </div>
            </div>
        );
    }

    const metaParts = [book?.author, book?.year, edition?.reading_minutes ? `${edition.reading_minutes} min read` : null]
        .filter(Boolean);
    // The category already serves as the kicker; tags carry era + language
    const tags = [book?.era, book?.language].filter(Boolean);

    return (
        <article className={s.root} ref={rootRef} data-testid="text-edition-reader">
            <div className={s.progressTrack} aria-hidden="true">
                <div className={s.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <div className={s.inner}>
                {/* Metadata header */}
                <header className={s.header}>
                    <p className={s.kicker}>{book?.category || 'Digital Library'}</p>
                    <h1 className={s.title}>{book?.title || 'Untitled'}</h1>
                    <div className={s.titleRule} aria-hidden="true" />
                    {metaParts.length > 0 && <p className={s.metaLine}>{metaParts.join('  ·  ')}</p>}
                    {tags.length > 0 && (
                        <div className={s.tags}>
                            {tags.map((tag) => (
                                <span key={tag} className={s.tag}>{tag}</span>
                            ))}
                        </div>
                    )}
                </header>

                {/* Numbered rail + typeset column */}
                <div className={s.body}>
                    <nav className={s.rail} aria-label="Sections">
                        <div className={s.railHeader}>Sections</div>
                        {sections.map((sec, idx) => (
                            <button
                                key={sec.id || idx}
                                className={`${s.railItem} ${sec.id === activeId ? s.railItemActive : ''}`}
                                style={sec.level > 1 ? { paddingLeft: 'calc(16px + 12px)' } : undefined}
                                onClick={() => scrollToSection(sec.id)}
                            >
                                <span className={s.railNum}>{String(idx + 1).padStart(2, '0')}</span>
                                <span>{sec.title || `Section ${idx + 1}`}</span>
                            </button>
                        ))}
                    </nav>

                    <div className={s.column} data-testid="text-edition-reader-column">
                        {sections.map((sec, i) => (
                            <React.Fragment key={sec.id || `sec-${i}`}>
                                <section data-section-canonical={sec.id} data-paper-section="true">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{sec.md || ''}</ReactMarkdown>
                                </section>
                                {i < sections.length - 1 && (
                                    <div className={s.sectionRule} aria-hidden="true">
                                        <span style={{ flex: 1, height: '1px', background: 'rgba(28, 26, 22, 0.2)' }} />
                                        <span style={{ width: '6px', height: '6px', background: '#b3122e', transform: 'rotate(45deg)' }} />
                                        <span style={{ flex: 1, height: '1px', background: 'rgba(28, 26, 22, 0.2)' }} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                        <style>{paperProseCss}</style>
                    </div>
                </div>
            </div>

            {/* Footer: way back + fixed-page edition */}
            <footer className={s.footer}>
                <a href="/digital-library" className={s.footerLink}>
                    <ArrowLeft size={13} />
                    Back to the library
                </a>
                {pdfUrl && (
                    <a href={pdfUrl} download className={s.footerLink}>
                        <Download size={13} />
                        PDF — fixed-page edition
                    </a>
                )}
            </footer>
        </article>
    );
};

export default TextEditionReader;
