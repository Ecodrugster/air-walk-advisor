const DEFAULT_TTL_MS = 15 * 60 * 1000

/** @type {Map<string, { expiresAt: number, value: unknown }>} */
const store = new Map()

/**
 * Кеш в памяти с TTL (по умолчанию 15 минут).
 * @template T
 * @param {string} key
 * @param {() => Promise<T>} fetcher
 * @param {number} [ttlMs]
 * @returns {Promise<T>}
 */
export async function withCache(key, fetcher, ttlMs = DEFAULT_TTL_MS) {
  const hit = store.get(key)
  const now = Date.now()
  if (hit && hit.expiresAt > now) {
    return /** @type {T} */ (hit.value)
  }

  const value = await fetcher()
  store.set(key, { value, expiresAt: now + ttlMs })
  return value
}

/** Очистка кеша (для тестов). */
export function clearCache() {
  store.clear()
}

/**
 * @param {string} key
 * @returns {boolean}
 */
export function hasFreshCache(key) {
  const hit = store.get(key)
  return Boolean(hit && hit.expiresAt > Date.now())
}
