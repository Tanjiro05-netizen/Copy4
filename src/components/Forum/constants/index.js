// Board/Category definitions
export const BOARDS = [
  { slug: 't', name: 'theory', fullName: 'Theory', description: 'Marxist theory, philosophy, political economy' },
  { slug: 'r', name: 'reading', fullName: 'Reading', description: 'Reading groups, study circles, book discussion' },
  { slug: 'o', name: 'organizing', fullName: 'Organizing', description: 'Praxis, workplace organizing, political action' },
  { slug: 'h', name: 'history', fullName: 'History', description: 'Historical analysis and discussion' },
  { slug: 'c', name: 'current', fullName: 'Current Events', description: 'Analysis of current events' },
  { slug: 'm', name: 'meta', fullName: 'Meta', description: 'Site discussion and feedback' },
  { slug: 'x', name: 'random', fullName: 'Random', description: 'Off-topic discussion' },
]

// Ideology options with colors
export const IDEOLOGIES = [
  { value: 'Marxist-Leninist', label: 'Marxist-Leninist', abbrev: 'ML', color: '#ff4444' },
  { value: 'Marxism-Leninism-Maoism', label: 'Marxism-Leninism-Maoism', abbrev: 'MLM', color: '#ff6b35' },
  { value: 'Left Communist', label: 'Left Communist', abbrev: 'Left-Com', color: '#ffcc00' },
  { value: 'Trotskyist', label: 'Trotskyist', abbrev: 'Trot', color: '#ff8800' },
  { value: 'Anarcho-Communist', label: 'Anarcho-Communist', abbrev: 'Ancom', color: '#aa0000' },
  { value: 'Orthodox Marxist', label: 'Orthodox Marxist', abbrev: 'Orthodox', color: '#cc0000' },
  { value: 'Council Communist', label: 'Council Communist', abbrev: 'Council', color: '#ff5555' },
  { value: 'Democratic Socialist', label: 'Democratic Socialist', abbrev: 'DemSoc', color: '#ff7777' },
  { value: 'Unaffiliated', label: 'Unaffiliated', abbrev: 'None', color: '#888888' },
]

// Get ideology color by value
export const getIdeologyColor = (ideology) => {
  const found = IDEOLOGIES.find(i => i.value === ideology || i.abbrev === ideology)
  return found?.color || '#888888'
}

// Get ideology abbreviation
export const getIdeologyAbbrev = (ideology) => {
  const found = IDEOLOGIES.find(i => i.value === ideology)
  return found?.abbrev || ideology
}

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
}

// Content limits
export const LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  CONTENT_MIN: 10,
  CONTENT_MAX: 50000,
  BIO_MAX: 500,
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  COMMENT_MIN: 1,
  COMMENT_MAX: 10000,
}

// Time constants
export const TIME = {
  EDIT_WINDOW_MINUTES: 30,
}
