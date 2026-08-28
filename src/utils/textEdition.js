/**
 * Text-edition utilities — turn a raw source text (.md preferred, .txt or a
 * pdf.js extraction) into the sectioned markdown shape stored in
 * digital_library_books.text_edition and rendered by TextEditionReader.
 *
 * Everything here is DOM-free so it runs identically in Node (jest) and the
 * browser (admin panel).
 */

export const FRONT_MATTER_TITLE = 'Front matter';

let sectionCounter = 0;
const nextSectionId = () => {
    sectionCounter += 1;
    return `s${sectionCounter}`;
};

/** Total minutes to read at ~200 wpm, always at least one. */
export const readingMinutes = (md) => {
    const words = `${md || ''}`.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
};

/**
 * Split a markdown source at heading lines into sections. The heading becomes
 * the section title (rail label) and everything up to the next heading becomes
 * that section's markdown body. Non-empty text before the first heading is
 * kept as a "Front matter" section.
 */
export const splitMarkdown = (src) => {
    sectionCounter = 0;
    const lines = `${src || ''}`.replace(/\r\n?/g, '\n').split('\n');

    const sections = [];
    let current = null;
    const preamble = [];

    for (const line of lines) {
        const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
        if (match) {
            if (current) sections.push(current);
            current = {
                id: nextSectionId(),
                title: match[2].trim(),
                level: match[1].length,
                md: '',
            };
        } else if (current) {
            current.md += (current.md ? '\n' : '') + line;
        } else {
            preamble.push(line);
        }
    }
    if (current) sections.push(current);

    const frontMatter = preamble.join('\n').trim();
    if (frontMatter) {
        sections.unshift({
            id: nextSectionId(),
            title: FRONT_MATTER_TITLE,
            level: 1,
            md: frontMatter,
        });
    }

    return sections
        .map((sec) => ({ ...sec, md: sec.md.trim() }))
        .filter((sec) => sec.md.length > 0 || sec.title !== FRONT_MATTER_TITLE);
};

/*
 * Plain-text heading heuristics, in priority order. Adapted from the old
 * formatBookContent.js chapter splitter.
 */
const TXT_HEADING_PATTERNS = [
    { re: /^(chapter\s+(?:[ivxlc]+|\d+).*)$/i, level: 1 },
    { re: /^(part\s+(?:[ivxlc]+|\d+).*)$/i, level: 1 },
    { re: /^(preface|foreword|introduction|afterword|appendix|conclusion|epilogue|prologue)\b.*$/i, level: 1 },
    { re: /^(section\s+(?:[ivxlc]+|\d+).*)$/i, level: 2 },
    { re: /^([ivxlc]{1,7}\.?)$/i, level: 1 },
    { re: /^([ivxlc]{1,7})\.\s+\S.*$/i, level: 1 },
];

/* Line-initial markdown sigils that prose must not accidentally trigger. */
const MD_SIGIL = /^([#*+>-]|```|\d{1,3}[.)]\s)/;

export const escapeMarkdownLineStarts = (text) =>
    text
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => (MD_SIGIL.test(line) ? `\\${line}` : line))
        .join('\n');

const isCapsHeading = (line) => {
    const trimmed = line.trim();
    if (trimmed.length < 3 || trimmed.length > 48) return false;
    const letters = trimmed.replace(/[^A-Za-z]/g, '');
    if (letters.length < 3) return false;
    const caps = letters.replace(/[^A-Z]/g, '');
    return caps.length / letters.length >= 0.9 && !/[.!?]$/.test(trimmed);
};

const titleCaseCaps = (line) =>
    line
        .trim()
        .toLowerCase()
        .replace(/(^|\s|["'("])([a-z])/g, (m, p, c) => p + c.toUpperCase());

/**
 * Split a plain-text source into sections using heading heuristics: explicit
 * Chapter/Part/Section lines, bare roman numerals, and short ALL-CAPS lines
 * (title-cased for the rail). Prose line-starts that would collide with
 * markdown sigils are escaped so they can never render as syntax.
 */
export const splitPlainText = (src) => {
    sectionCounter = 0;
    const lines = `${src || ''}`.replace(/\r\n?/g, '\n').split('\n');

    const sections = [];
    let current = null;
    const preamble = [];

    const pushCurrent = () => {
        if (current) sections.push(current);
    };

    for (const line of lines) {
        const trimmed = line.trim();
        let heading = null;

        for (const { re, level } of TXT_HEADING_PATTERNS) {
            const match = re.exec(trimmed);
            if (match) {
                heading = { title: match[1].trim(), level };
                break;
            }
        }
        if (!heading && isCapsHeading(trimmed)) {
            heading = { title: titleCaseCaps(trimmed), level: 2 };
        }

        if (heading) {
            pushCurrent();
            current = { id: nextSectionId(), title: heading.title, level: heading.level, md: '' };
        } else if (current) {
            current.md += (current.md ? '\n' : '') + escapeMarkdownLineStarts(line);
        } else {
            preamble.push(escapeMarkdownLineStarts(line));
        }
    }
    pushCurrent();

    const frontMatter = preamble.join('\n').trim();
    if (frontMatter) {
        sections.unshift({
            id: nextSectionId(),
            title: FRONT_MATTER_TITLE,
            level: 1,
            md: frontMatter,
        });
    }

    return sections
        .map((sec) => ({ ...sec, md: sec.md.trim() }))
        .filter((sec) => sec.md.length > 0 || sec.title !== FRONT_MATTER_TITLE);
};

/** Guess whether an uploaded source is markdown or plain text. */
export const detectKind = (filename, content) => {
    if (/\.(md|markdown|mdown)$/i.test(filename || '')) return 'md';
    if (/\.(txt|text)$/i.test(filename || '')) return 'txt';
    const sample = `${content || ''}`.split('\n').slice(0, 200).join('\n');
    return /^#{1,6}\s+\S/m.test(sample) ? 'md' : 'txt';
};

/** Split with the right strategy for the detected kind. */
export const splitSource = (kind, src) =>
    kind === 'md' ? splitMarkdown(src) : splitPlainText(src);

/** Assemble the persisted edition object from edited sections. */
export const buildEdition = (sections, source) => ({
    sections: (sections || [])
        .filter((sec) => sec && (`${sec.md || ''}`.trim() || `${sec.title || ''}`.trim()))
        .map((sec) => ({
            id: sec.id || nextSectionId(),
            title: `${sec.title || ''}`.trim(),
            level: sec.level || 1,
            md: `${sec.md || ''}`.trim(),
        })),
    reading_minutes: readingMinutes((sections || []).map((sec) => sec.md || '').join('\n')),
    source: source || 'manual',
    generated_at: new Date().toISOString(),
});
