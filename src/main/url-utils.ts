/**
 * URL utilities for the omnibox.
 *
 * Determines whether user input is a URL or a search query,
 * and normalises URLs for navigation.
 */

const SEARCH_ENGINES: Record<string, string> = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q='
}

let currentEngine = 'google'

/** Set the active search engine */
export function setSearchEngine(engine: string): void {
  if (engine in SEARCH_ENGINES) {
    currentEngine = engine
  }
}

/** Characters that suggest the input is a URL rather than a search */
const URL_PATTERNS = [
  /^https?:\/\//i,              // explicit protocol
  /^file:\/\//i,                // local file
  /^localhost(:\d+)?(\/|$)/i,   // localhost
  /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,  // IP address
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+/i  // domain-like (e.g. github.com)
]

/** Check if input looks like a URL */
export function isLikelyURL(input: string): boolean {
  const trimmed = input.trim()
  if (!trimmed) return false

  // Contains spaces → definitely a search
  if (/\s/.test(trimmed) && !trimmed.startsWith('http')) return false

  return URL_PATTERNS.some((pattern) => pattern.test(trimmed))
}

/** Convert user input to a navigable URL */
export function inputToURL(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  if (isLikelyURL(trimmed)) {
    // Add protocol if missing
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  // It's a search query — use the configured engine
  const base = SEARCH_ENGINES[currentEngine] || SEARCH_ENGINES.google
  return `${base}${encodeURIComponent(trimmed)}`
}
