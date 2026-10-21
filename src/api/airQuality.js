import { withCache } from '../lib/cache.js'

const BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality'

/**
 * Качество воздуха: текущие PM и почасовой PM2.5 на 2 дня.
 * @param {number} latitude
 * @param {number} longitude
 */
export async function getAirQuality(latitude, longitude) {
  const cacheKey = `aq:${latitude},${longitude}`
  return withCache(cacheKey, async () => {
    const url = new URL(BASE)
    url.searchParams.set('latitude', String(latitude))
    url.searchParams.set('longitude', String(longitude))
    url.searchParams.set('current', 'pm2_5,pm10')
    url.searchParams.set('hourly', 'pm2_5')
    url.searchParams.set('forecast_days', '2')
    url.searchParams.set('timezone', 'auto')

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Air quality error: ${res.status}`)
    }

    const data = await res.json()
    return {
      pm25: data.current.pm2_5,
      pm10: data.current.pm10,
      time: data.current.time,
      hourly: {
        time: data.hourly.time,
        pm2_5: data.hourly.pm2_5,
      },
    }
  })
}
