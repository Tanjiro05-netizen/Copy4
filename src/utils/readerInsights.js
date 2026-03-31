const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'about', 'your', 'have', 'has', 'are', 'was', 'were',
  'ein', 'eine', 'und', 'der', 'die', 'das', 'mit', 'von', 'ist', 'den', 'des', 'dem', 'auf', 'als'
]);

export const extractPassages = (rawContent = '') => {
  if (!rawContent) return [];

  let currentHeading = 'Introduction';
  const passages = [];

  rawContent
    .split('\n')
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line) return;

      const headingMatch = line.match(/^#{1,4}\s+(.+)/);
      if (headingMatch) {
        currentHeading = headingMatch[1].trim();
        return;
      }

      if (line.length < 40) return;

      passages.push({
        id: `passage-${passages.length + 1}`,
        heading: currentHeading,
        text: line
      });
    });

  return passages;
};

export const tokenizeQuery = (query = '') => {
  return query
    .toLowerCase()
    .split(/[^a-zA-Z0-9\u00C0-\u024F]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
};

export const toSnippet = (text = '', queryTokens = []) => {
  if (!text) return '';
  if (!queryTokens.length) return text.slice(0, 220);

  const lower = text.toLowerCase();
  const firstIndex = queryTokens
    .map((token) => lower.indexOf(token))
    .filter((idx) => idx >= 0)
    .sort((a, b) => a - b)[0];

  if (typeof firstIndex !== 'number') return text.slice(0, 220);

  const start = Math.max(0, firstIndex - 90);
  const end = Math.min(text.length, firstIndex + 170);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
};

export const scorePassage = ({ passage, queryTokens, glossaryTerms = [] }) => {
  if (!passage || !queryTokens.length) return 0;

  const lowerText = passage.text.toLowerCase();
  const lowerHeading = (passage.heading || '').toLowerCase();

  let score = 0;
  queryTokens.forEach((token) => {
    const bodyMatches = lowerText.split(token).length - 1;
    const headingMatches = lowerHeading.split(token).length - 1;
    score += bodyMatches;
    score += headingMatches * 2;
  });

  if (glossaryTerms.length) {
    const glossarySet = new Set(glossaryTerms.map((term) => term.term.toLowerCase()));
    const conceptHits = queryTokens.filter((token) => glossarySet.has(token)).length;
    score += conceptHits * 2;
  }

  if (passage.heading) score += 0.5;
  return score;
};

export const buildPassageResults = ({ passages = [], query = '', glossaryTerms = [] }) => {
  const queryTokens = tokenizeQuery(query);
  if (!queryTokens.length) return [];

  return passages
    .map((passage) => {
      const score = scorePassage({ passage, queryTokens, glossaryTerms });
      if (score <= 0) return null;
      return {
        ...passage,
        score,
        snippet: toSnippet(passage.text, queryTokens)
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
};

export const buildConceptGraphData = ({ passages = [], glossaryTerms = [] }) => {
  const nodes = [];
  const links = [];

  const headingMap = new Map();
  passages.forEach((passage) => {
    if (!passage.heading) return;
    if (!headingMap.has(passage.heading)) {
      headingMap.set(passage.heading, {
        id: `heading:${passage.heading}`,
        label: passage.heading,
        type: 'heading',
        passageId: passage.id,
        val: 6
      });
    }
  });

  const concepts = glossaryTerms
    .map((term) => {
      const lower = term.term.toLowerCase();
      const hitCount = passages.reduce((count, passage) => {
        return count + (passage.text.toLowerCase().includes(lower) ? 1 : 0);
      }, 0);
      return { term, hitCount };
    })
    .filter((entry) => entry.hitCount >= 2)
    .sort((a, b) => b.hitCount - a.hitCount)
    .slice(0, 12);

  const conceptNodes = concepts.map((entry) => ({
    id: `concept:${entry.term.term}`,
    label: entry.term.term,
    type: 'concept',
    val: Math.min(12, 4 + entry.hitCount),
    concept: entry.term.term
  }));

  const usedHeadings = new Set();

  concepts.forEach((entry) => {
    const lower = entry.term.term.toLowerCase();
    const headingHits = new Map();

    passages.forEach((passage) => {
      if (!passage.text.toLowerCase().includes(lower)) return;
      if (!passage.heading || !headingMap.has(passage.heading)) return;
      headingHits.set(passage.heading, (headingHits.get(passage.heading) || 0) + 1);
    });

    const sorted = [...headingHits.entries()].sort((a, b) => b[1] - a[1]);
    const topHeadings = sorted.slice(0, 2);

    topHeadings.forEach(([heading]) => {
      usedHeadings.add(heading);
      links.push({
        source: `concept:${entry.term.term}`,
        target: `heading:${heading}`,
        value: 1
      });
    });
  });

  const filteredHeadings = [...headingMap.values()].filter((h) => usedHeadings.has(h.label));
  nodes.push(...filteredHeadings, ...conceptNodes);

  const seenPairs = new Set();
  for (let i = 0; i < concepts.length; i += 1) {
    for (let j = i + 1; j < concepts.length; j += 1) {
      const a = concepts[i].term.term.toLowerCase();
      const b = concepts[j].term.term.toLowerCase();
      const pairKey = `${a}::${b}`;
      if (seenPairs.has(pairKey)) continue;

      const coCount = passages.filter((passage) => {
        const lower = passage.text.toLowerCase();
        return lower.includes(a) && lower.includes(b);
      }).length;

      if (coCount >= 2) {
        links.push({
          source: `concept:${concepts[i].term.term}`,
          target: `concept:${concepts[j].term.term}`,
          value: 0.5
        });
      }
      seenPairs.add(pairKey);
    }
  }

  return { nodes, links };
};
