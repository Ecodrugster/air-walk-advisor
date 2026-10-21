import { withCache } from '../lib/cache.js'

const BASE = 'https://geocoding-api.open-meteo.com/v1/search'

/**
 * Поиск городов по названию.
 * @param {string} name
 * @param {number} [count=5]
 * @returns {Promise<Array<{ id: number, name: string, country: string, admin1?: string, latitude: number, longitude: number }>>}
 */
export async function searchCities(name, count = 5) {
  const q = name.trim()
  if (!q) return []

  const cacheKey = `geo:${q.toLowerCase()}:${count}`
  return withCache(cacheKey, async () => {
    const url = new URL(BASE)
    url.searchParams.set('name', q)
    url.searchParams.set('count', String(count))
    url.searchParams.set('language', 'ru')
    url.searchParams.set('format', 'json')

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Geocoding error: ${res.status}`)
    }

    const data = await res.json()
    return (data.results ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      country: c.country ?? '',
      admin1: c.admin1,
      latitude: c.latitude,
      longitude: c.longitude,
    }))
  })
}
