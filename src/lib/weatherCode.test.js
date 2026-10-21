import { describe, expect, it } from 'vitest'
import { weatherCodeToText } from './weatherCode.js'

describe('weatherCodeToText', () => {
  it('расшифровывает известный код', () => {
    expect(weatherCodeToText(0)).toBe('Ясно')
    expect(weatherCodeToText(3)).toBe('Пасмурно')
  })

  it('для неизвестного кода возвращает запасную строку', () => {
    expect(weatherCodeToText(12345)).toMatch(/12345/)
  })
})
