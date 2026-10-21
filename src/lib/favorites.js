const STORAGE_KEY = 'air-walk-favorites'

/**
 * @typedef {{ id: number, name: string, country: string, admin1?: string, latitude: number, longitude: number }} City
 */

/**
 * @returns {City[]}
 */
export function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultFavorites()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : defaultFavorites()
  } catch {
    return defaultFavorites()
  }
}

/**
 * @param {City[]} cities
 */
export function saveFavorites(cities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities))
}

/**
 * @param {City[]} list
 * @param {City} city
 * @returns {City[]}
 */
export function toggleFavorite(list, city) {
  const exists = list.some((c) => c.id === city.id)
  const next = exists
    ? list.filter((c) => c.id !== city.id)
    : [...list, city].slice(0, 8)
  saveFavorites(next)
  return next
}

/**
 * @param {City[]} list
 * @param {number} id
 */
export function isFavorite(list, id) {
  return list.some((c) => c.id === id)
}

/** Стартовые города Казахстана для быстрого выбора. */
function defaultFavorites() {
  return [
    {
      id: 1526273,
      name: 'Алматы',
      country: 'Казахстан',
      admin1: 'Алматы',
      latitude: 43.25,
      longitude: 76.92,
    },
    {
      id: 1526274,
      name: 'Астана',
      country: 'Казахстан',
      admin1: 'Астана',
      latitude: 51.18,
      longitude: 71.45,
    },
    {
      id: 1526275,
      name: 'Караганда',
      country: 'Казахстан',
      admin1: 'Карагандинская область',
      latitude: 49.8,
      longitude: 73.1,
    },
  ]
}
