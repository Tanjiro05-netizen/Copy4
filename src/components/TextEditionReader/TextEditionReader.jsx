import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertCircle, Minus, Plus } from 'lucide-react';
import { editorialProseCss } from '../EditorialReader/editorialProseCss';
import * as s from '../EditorialReader/EditorialReader.css.ts';

/**
 * The text-edition reading surface — the whole book as one typeset markdown
 * column with a chapter rail and a crimson progress rule. Companion to
 * EditorialReader, but fed from digital_library_books.text_edition (sections
 * of markdown) instead of an epubjs archive. Used for books that have no EPUB.
 */
const TextEditionReader = ({ edition, onProgressChange, fallbackUrl, fallbackLabel }) => {
    const scrollRef = useRef(null);
    const onProgressRef = useRef(onProgressChange);
    onProgressRef.current = onProgressChange;

    const sections = edition?.sections || [];
    const [activeId, setActiveId] = useState(sections[0]?.id ?? null);
    const [progress, setProgress] = useState(0);
    const [fontSize, setFontSize] = useState(() => {
        if (typeof window === 'undefined') return 100;
        const saved = localStorage.getItem('editorial-fontsize');
        return saved ? parseInt(saved, 10) : 100;
    });

    useEffect(() => {
        if (sections.length && !sections.some((sec) => sec.id === activeId)) {
            setActiveId(sections[0].id);
        }
    }, [sections, activeId]);

    const handleScroll = useCallback(() => {
        const scroller = scrollRef.current;
        if (!scroller) return;

        const maxScroll = scroller.scrollHeight - scroller.clientHeight;
        const pct = maxScroll > 0 ? Math.round((scroller.scrollTop / maxScroll) * 100) : 0;
        setProgress(pct);
        if (onProgressRef.current) onProgressRef.current(pct);

        const nodes = Array.from(scroller.querySelectorAll('[data-section-canonical]'));
        const active = nodes.filter((n) => n.offsetTop <= scroller.scrollTop + 200).pop() || nodes[0];
        if (active) setActiveId(active.getAttribute('data-section-canonical'));
    }, []);

    const scrollToSection = useCallback((id) => {
        const scroller = scrollRef.current;
        if (!scroller || !id) return;
        const target = scroller.querySelector(`[data-section-canonical="${id}"]`);
        if (target) {
            scroller.scrollTo({ top: Math.max(0, target.offsetTop - 24), behavior: 'smooth' });
        }
    }, []);

    const adjustFont = (delta) => {
        setFontSize((prev) => {
            const next = Math.min(160, Math.max(80, prev + delta));
            localStorage.setItem('editorial-fontsize', String(next));
            return next;
        });
    };

    if (!sections.length) {
        return (
            <div className={s.errorBox} data-testid="text-edition-reader-empty">
                <AlertCircle size={26} style={{ color: '#d41f3d' }} />
                <span className={s.errorText}>This text edition is empty.</span>
                {fallbackUrl && (
                    <a className={s.fallbackLink} href={fallbackUrl} target="_blank" rel="noopener noreferrer">
                        {fallbackLabel || 'Open the file directly'}
                    </a>
                )}
            </div>
        );
    }

    const activeIndex = sections.findIndex((sec) => sec.id === activeId);
    const currentSection = activeIndex >= 0 ? sections[activeIndex] : null;
    const minutesLabel = edition?.reading_minutes ? `${edition.reading_minutes} min` : null;
    const proseSize = Math.round(18 * (fontSize / 100));

    return (
        <div className={s.root} data-testid="text-edition-reader">
            {/* Chapter rail */}
            <nav className={s.rail} aria-label="Contents">
                <div className={s.railHeader}>Contents</div>
                {sections.map((sec, idx) => (
                    <button
                        key={sec.id || idx}
                        className={`${s.railItem} ${sec.id === activeId ? s.railItemActive : ''}`}
                        style={sec.level > 1 ? { paddingLeft: 'calc(16px + 12px)' } : undefined}
                        onClick={() => scrollToSection(sec.id)}
                    >
                        {sec.title || `Section ${idx + 1}`}
                    </button>
                ))}
            </nav>

            <div>
                {/* Toolbar: current chapter + index + reading time + type controls */}
                <div className={s.toolbar}>
                    <div className={s.chapterMeta}>
                        <span className={s.chapterLabel}>{currentSection?.title || 'Reading'}</span>
                        <span className={s.chapterIndex}>
                            {activeIndex >= 0
                                ? `${String(activeIndex + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`
                                : ''}
                            {minutesLabel ? ` · ${minutesLabel}` : ''}
                        </span>
                    </div>
                    <div className={s.sizeControls}>
                        <button className={s.sizeBtn} onClick={() => adjustFont(-10)} aria-label="Smaller text" title="Smaller text">
                            <Minus size={14} />
                        </button>
                        <span className={s.sizeValue}>{fontSize}%</span>
                        <button className={s.sizeBtn} onClick={() => adjustFont(10)} aria-label="Larger text" title="Larger text">
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                {/* Scroll shell with progress rule */}
                <div
                    className={s.shell}
                    ref={scrollRef}
                    onScroll={handleScroll}
                    data-testid="text-edition-reader-scroll"
                >
                    <div className={s.progressTrack}>
                        <div className={s.progressFill} style={{ width: `${progress}%` }} />
                    </div>

                    <div className={s.column} style={{ fontSize: `${proseSize}px` }} data-testid="text-edition-reader-column">
                        {sections.map((sec, i) => (
                            <React.Fragment key={sec.id || `sec-${i}`}>
                                <section
                                    data-section-canonical={sec.id}
                                    data-editorial-section="true"
                                >
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{sec.md || ''}</ReactMarkdown>
                                </section>
                                {i < sections.length - 1 && (
                                    <div className={s.sectionRule} aria-hidden="true">
                                        <span style={{ flex: 1, height: '1px', background: '#262a35' }} />
                                        <span style={{ width: '6px', height: '6px', background: '#b3122e', transform: 'rotate(45deg)' }} />
                                        <span style={{ flex: 1, height: '1px', background: '#262a35' }} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                        <style>{editorialProseCss}</style>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextEditionReader;
