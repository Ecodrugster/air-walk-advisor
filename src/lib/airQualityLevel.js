/**
 * Чистые функции: уровень качества воздуха по PM2.5 / PM10 (мкг/м³).
 * Пороги ориентированы на типичные шкалы для жителя (не только AQI США).
 */

/** @typedef {'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous'} AirLevel */

const LEVEL_META = {
  good: {
    id: 'good',
    label: 'Хорошо',
    color: '#22c55e',
  },
  moderate: {
    id: 'moderate',
    label: 'Умеренно',
    color: '#eab308',
  },
  unhealthy_sensitive: {
    id: 'unhealthy_sensitive',
    label: 'Вредно для чувствительных',
    color: '#f97316',
  },
  unhealthy: {
    id: 'unhealthy',
    label: 'Вредно',
    color: '#ef4444',
  },
  very_unhealthy: {
    id: 'very_unhealthy',
    label: 'Очень вредно',
    color: '#a855f7',
  },
  hazardous: {
    id: 'hazardous',
    label: 'Опасно',
    color: '#7f1d1d',
  },
}

/**
 * Уровень по PM2.5 (мкг/м³).
 * @param {number} pm25
 * @returns {AirLevel}
 */
export function getPm25Level(pm25) {
  if (pm25 == null || Number.isNaN(pm25)) {
    throw new Error('pm25 must be a number')
  }
  if (pm25 <= 12) return 'good'
  if (pm25 <= 35) return 'moderate'
  if (pm25 <= 55) return 'unhealthy_sensitive'
  if (pm25 <= 150) return 'unhealthy'
  if (pm25 <= 250) return 'very_unhealthy'
  return 'hazardous'
}

/**
 * Уровень по PM10 (мкг/м³).
 * @param {number} pm10
 * @returns {AirLevel}
 */
export function getPm10Level(pm10) {
  if (pm10 == null || Number.isNaN(pm10)) {
    throw new Error('pm10 must be a number')
  }
  if (pm10 <= 54) return 'good'
  if (pm10 <= 154) return 'moderate'
  if (pm10 <= 254) return 'unhealthy_sensitive'
  if (pm10 <= 354) return 'unhealthy'
  if (pm10 <= 424) return 'very_unhealthy'
  return 'hazardous'
}

/**
 * Худший из двух уровней (для общей оценки).
 * @param {AirLevel} a
 * @param {AirLevel} b
 * @returns {AirLevel}
 */
export function worseLevel(a, b) {
  const order = [
    'good',
    'moderate',
    'unhealthy_sensitive',
    'unhealthy',
    'very_unhealthy',
    'hazardous',
  ]
  return order.indexOf(a) >= order.indexOf(b) ? a : b
}

/**
 * @param {AirLevel} level
 */
export function getLevelMeta(level) {
  return LEVEL_META[level] ?? LEVEL_META.hazardous
}
