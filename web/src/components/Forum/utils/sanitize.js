/**
 * Lightweight HTML / XSS sanitiser for forum content.
 * Strips dangerous tags and attributes before content is rendered.
 */

const DANGEROUS_TAGS = /(<\s*\/?\s*(script|iframe|object|embed|form|input|button|link|meta|style|base|applet|svg|math|template)\b[^>]*>)/gi
const EVENT_ATTRS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const JS_URLS = /(href|src|action)\s*=\s*["']?\s*javascript\s*:/gi
const DATA_URLS = /(href|src)\s*=\s*["']?\s*data\s*:/gi

/**
 * Strip dangerous HTML from a raw string.
 * This is a defence-in-depth layer — the primary defence is that we
 * render user content via `parseContent()` which outputs React elements,
 * not raw HTML. This function catches anything that slips through.
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(DANGEROUS_TAGS, '')
    .replace(EVENT_ATTRS, '')
    .replace(JS_URLS, '')
    .replace(DATA_URLS, '')
}

/**
 * Sanitise a content string before it is stored / sent to the API.
 * Lighter than sanitizeText — only strips the most dangerous patterns
 * so user formatting (greentext, etc.) is preserved.
 */
export function sanitizeInput(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(EVENT_ATTRS, '')
    .replace(JS_URLS, '')
}
