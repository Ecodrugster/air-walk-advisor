import { describe, expect, it } from 'vitest'
import { getWalkAdvice, getVentilationAdvice } from './recommendations.js'

describe('getWalkAdvice', () => {
  it('разрешает прогулку с ребёнком при хорошем воздухе', () => {
    const advice = getWalkAdvice(10, 40)
    expect(advice.canWalk).toBe(true)
    expect(advice.withChild).toBe(true)
    expect(advice.summary).toMatch(/гулять/i)
  })

  it('запрещает прогулку при вредном воздухе', () => {
    const advice = getWalkAdvice(120, 200)
    expect(advice.canWalk).toBe(false)
    expect(advice.withChild).toBe(false)
  })
})

describe('getVentilationAdvice', () => {
  it('находит часы с наименьшим PM2.5 в ближайшие сутки', () => {
    const now = new Date('2026-01-15T12:00:00')
    const hourly = {
      time: [
        '2026-01-15T10:00',
        '2026-01-15T14:00',
        '2026-01-15T18:00',
        '2026-01-16T08:00',
        '2026-01-17T12:00',
      ],
      pm2_5: [80, 25, 40, 15, 5],
    }

    const result = getVentilationAdvice(hourly, now)
    expect(result).not.toBeNull()
    expect(result.bestHours.length).toBeGreaterThan(0)
    expect(result.message).toMatch(/проветривать|воздух/i)
  })

  it('возвращает null без данных', () => {
    expect(getVentilationAdvice(null)).toBeNull()
    expect(getVentilationAdvice({ time: [], pm2_5: [] })).toBeNull()
  })
})
