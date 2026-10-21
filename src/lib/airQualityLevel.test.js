import { describe, expect, it } from 'vitest'
import {
  getPm25Level,
  getPm10Level,
  worseLevel,
  getLevelMeta,
} from './airQualityLevel.js'

describe('getPm25Level', () => {
  it('возвращает good для низкого PM2.5', () => {
    expect(getPm25Level(8)).toBe('good')
  })

  it('возвращает moderate на верхней границе 35', () => {
    expect(getPm25Level(35)).toBe('moderate')
  })

  it('возвращает hazardous для очень высоких значений', () => {
    expect(getPm25Level(300)).toBe('hazardous')
  })
})

describe('getPm10Level', () => {
  it('возвращает good для PM10 ≤ 54', () => {
    expect(getPm10Level(40)).toBe('good')
  })
})

describe('worseLevel', () => {
  it('выбирает худший уровень', () => {
    expect(worseLevel('good', 'unhealthy')).toBe('unhealthy')
    expect(worseLevel('hazardous', 'moderate')).toBe('hazardous')
  })
})

describe('getLevelMeta', () => {
  it('отдаёт русскую метку и цвет', () => {
    const meta = getLevelMeta('moderate')
    expect(meta.label).toBe('Умеренно')
    expect(meta.color).toMatch(/^#/)
  })
})
