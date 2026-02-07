import { LIMITS } from '../constants'

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUsername(username) {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }
  
  if (username.length < LIMITS.USERNAME_MIN) {
    return { valid: false, error: `Username must be at least ${LIMITS.USERNAME_MIN} characters` }
  }
  
  if (username.length > LIMITS.USERNAME_MAX) {
    return { valid: false, error: `Username must be at most ${LIMITS.USERNAME_MAX} characters` }
  }
  
  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  if (!usernameRegex.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' }
  }
  
  return { valid: true }
}

export function validatePassword(password) {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  
  return { valid: true }
}

export function validateThreadTitle(title) {
  if (!title || !title.trim()) {
    return { valid: false, error: 'Title is required' }
  }
  
  if (title.length < LIMITS.TITLE_MIN) {
    return { valid: false, error: `Title must be at least ${LIMITS.TITLE_MIN} characters` }
  }
  
  if (title.length > LIMITS.TITLE_MAX) {
    return { valid: false, error: `Title must be at most ${LIMITS.TITLE_MAX} characters` }
  }

  const spamCheck = checkSpamPatterns(title)
  if (!spamCheck.valid) return spamCheck
  
  return { valid: true }
}

export function validateContent(content, minLength = LIMITS.CONTENT_MIN) {
  if (!content || !content.trim()) {
    return { valid: false, error: 'Content is required' }
  }
  
  if (content.length < minLength) {
    return { valid: false, error: `Content must be at least ${minLength} characters` }
  }

  const spamCheck = checkSpamPatterns(content)
  if (!spamCheck.valid) return spamCheck
  
  return { valid: true }
}

function checkSpamPatterns(text) {
  // Reject if mostly repeated single character (e.g. "aaaaaaaaaa")
  if (/^(.)\1{9,}$/.test(text.trim())) {
    return { valid: false, error: 'Content appears to be spam' }
  }

  // Reject if the same word is repeated excessively (5+ times in a row)
  if (/(\b\w+\b)(\s+\1){4,}/i.test(text)) {
    return { valid: false, error: 'Content appears to be spam' }
  }

  // Reject excessive URLs (3+)
  const urlCount = (text.match(/https?:\/\//g) || []).length
  if (urlCount >= 3) {
    return { valid: false, error: 'Too many links. Please reduce the number of URLs.' }
  }

  return { valid: true }
}

export function validateBio(bio) {
  if (bio && bio.length > LIMITS.BIO_MAX) {
    return { valid: false, error: `Bio must be at most ${LIMITS.BIO_MAX} characters` }
  }
  
  return { valid: true }
}
