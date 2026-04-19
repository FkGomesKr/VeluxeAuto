/**
 * In-memory cache-bust flag.
 * When set, car endpoints skip edge caching for a short window
 * so the next request goes straight to the database.
 */
let bustUntil = 0

const BUST_WINDOW_MS = 30_000 // 30 seconds of no-cache after a clear

export function triggerCacheBust() {
  bustUntil = Date.now() + BUST_WINDOW_MS
}

export function isCacheBusted(): boolean {
  return Date.now() < bustUntil
}
