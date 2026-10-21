import { withCache } from '../lib/cache.js'

const BASE = 'https://api.open-meteo.com/v1/forecast'

/**
 * Текущая погода по координатам.
 * @param {number} latitude
 * @param {number} longitude
 */
export async function getWeather(latitude, longitude) {
  const cacheKey = `weather:${latitude},${longitude}`
  return withCache(cacheKey, async () => {
    const url = new URL(BASE)
    url.searchParams.set('latitude', String(latitude))
    url.searchParams.set('longitude', String(longitude))
    url.searchParams.set(
      'current',
      'temperature_2m,apparent_temperature,wind_speed_10m,weather_code',
    )
    url.searchParams.set('timezone', 'auto')

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Weather error: ${res.status}`)
    }

    const data = await res.json()
    const c = data.current
    return {
      temperature: c.temperature_2m,
      apparentTemperature: c.apparent_temperature,
      windSpeed: c.wind_speed_10m,
      weatherCode: c.weather_code,
      time: c.time,
    }
  })
}
