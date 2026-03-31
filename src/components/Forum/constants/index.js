export const BOARDS = [
  {
    name: 'Theory',
    slug: 't',
    fullName: 'Marxist theory and philosophy',
    description: 'Marxist theory and philosophy',
  },
  {
    name: 'Reading',
    slug: 'r',
    fullName: 'Study groups and discussions',
    description: 'Study groups and discussions',
  },
  {
    name: 'Organizing',
    slug: 'o',
    fullName: 'Praxis and action',
    description: 'Praxis and action',
  },
  {
    name: 'History',
    slug: 'h',
    fullName: 'Historical analysis',
    description: 'Historical analysis',
  },
  {
    name: 'Current Events',
    slug: 'c',
    fullName: 'News and analysis',
    description: 'News and analysis',
  },
  {
    name: 'Meta',
    slug: 'm',
    fullName: 'Site feedback',
    description: 'Site feedback',
  },
  {
    name: 'Random',
    slug: 'x',
    fullName: 'Off-topic',
    description: 'Off-topic',
  },
]

export const getBoardBySlug = (slug) =>
  BOARDS.find((b) => b.slug === slug) || null

export const getBoardByName = (name) =>
  BOARDS.find((b) => b.name === name) || null

// ── Field-length limits (used by validators.js, CommentForm.jsx) ────

export const LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  CONTENT_MIN: 10,
  BIO_MAX: 500,
}

// ── Ideology helpers (used by IdeologyTag.jsx) ──────────────────────

const IDEOLOGY_COLORS = {
  'Marxist-Leninist':   '#e53935',
  'Trotskyist':         '#fb8c00',
  'Bordigist':          '#c62828',
  'Maoist':             '#d32f2f',
  'Anarchist':          '#212121',
  'Left Communist':     '#b71c1c',
  'Council Communist':  '#bf360c',
  'Democratic Socialist': '#1e88e5',
  'Libertarian Socialist': '#43a047',
  'Other':              '#757575',
}

const IDEOLOGY_ABBREVS = {
  'Marxist-Leninist':   'ML',
  'Trotskyist':         'Trot',
  'Bordigist':          'Bord',
  'Maoist':             'MLM',
  'Anarchist':          'An',
  'Left Communist':     'LC',
  'Council Communist':  'CC',
  'Democratic Socialist': 'DS',
  'Libertarian Socialist': 'LS',
  'Other':              '—',
}

export const getIdeologyColor = (ideology) =>
  IDEOLOGY_COLORS[ideology] || IDEOLOGY_COLORS['Other']

export const getIdeologyAbbrev = (ideology) =>
  IDEOLOGY_ABBREVS[ideology] || ideology?.slice(0, 3) || '—'
