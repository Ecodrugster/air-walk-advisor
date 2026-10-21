import { getPm25Level, worseLevel, getPm10Level } from './airQualityLevel.js'

/**
 * Можно ли гулять (в т.ч. с ребёнком) по текущему PM.
 * @param {number} pm25
 * @param {number} [pm10]
 * @returns {{ canWalk: boolean, withChild: boolean, summary: string, detail: string }}
 */
export function getWalkAdvice(pm25, pm10 = pm25) {
  const level = worseLevel(getPm25Level(pm25), getPm10Level(pm10))

  switch (level) {
    case 'good':
      return {
        canWalk: true,
        withChild: true,
        summary: 'Можно гулять',
        detail: 'Воздух хороший. Подходит для прогулки с ребёнком и спорта на улице.',
      }
    case 'moderate':
      return {
        canWalk: true,
        withChild: true,
        summary: 'Гулять можно, но без лишней нагрузки',
        detail: 'Воздух умеренный. Короткая прогулка с ребёнком допустима; длительный бег лучше перенести.',
      }
    case 'unhealthy_sensitive':
      return {
        canWalk: true,
        withChild: false,
        summary: 'Чувствительным лучше остаться дома',
        detail: 'Детям, астматикам и пожилым лучше сократить время на улице. Остальным — короткие выходы без спорта.',
      }
    case 'unhealthy':
      return {
        canWalk: false,
        withChild: false,
        summary: 'Гулять не рекомендуется',
        detail: 'Воздух вредный. Прогулку с ребёнком отложите. При необходимости выхода — маска и минимум времени снаружи.',
      }
    case 'very_unhealthy':
    case 'hazardous':
      return {
        canWalk: false,
        withChild: false,
        summary: 'Оставайтесь дома',
        detail: 'Воздух опасен для здоровья. Закройте окна, по возможности используйте очиститель воздуха.',
      }
    default:
      return {
        canWalk: false,
        withChild: false,
        summary: 'Нет данных',
        detail: 'Не удалось оценить качество воздуха.',
      }
  }
}

/**
 * Когда лучше проветривать: ищем часы с наименьшим PM2.5 в ближайшие сутки.
 * @param {{ time: string[], pm2_5: number[] }} hourly — массивы из Open-Meteo
 * @param {string | Date} [now] — текущее время (для тестов)
 * @returns {{ bestHours: string[], message: string } | null}
 */
export function getVentilationAdvice(hourly, now = new Date()) {
  if (!hourly?.time?.length || !hourly?.pm2_5?.length) {
    return null
  }

  const nowMs = new Date(now).getTime()
  const horizonMs = nowMs + 24 * 60 * 60 * 1000

  const points = hourly.time
    .map((t, i) => ({
      time: t,
      pm25: hourly.pm2_5[i],
      ms: new Date(t).getTime(),
    }))
    .filter(
      (p) =>
        Number.isFinite(p.pm25) &&
        p.ms >= nowMs - 30 * 60 * 1000 &&
        p.ms <= horizonMs,
    )

  if (points.length === 0) {
    return null
  }

  const sorted = [...points].sort((a, b) => a.pm25 - b.pm25)
  const best = sorted.slice(0, 3)
  const bestHours = best.map((p) => formatHour(p.time))

  const bestPm = best[0].pm25
  const bestLevel = getPm25Level(bestPm)

  let message
  if (bestLevel === 'good' || bestLevel === 'moderate') {
    message = `Лучше проветривать около ${bestHours.join(', ')} (PM2.5 ≈ ${Math.round(bestPm)}).`
  } else {
    message = `В ближайшие 24 часа воздух всё ещё тяжёлый. Относительно лучше около ${bestHours.join(', ')} (PM2.5 ≈ ${Math.round(bestPm)}), но проветривайте коротко.`
  }

  return { bestHours, message }
}

/**
 * @param {string} iso
 */
function formatHour(iso) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
