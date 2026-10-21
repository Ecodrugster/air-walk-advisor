import { describe, expect, it, beforeEach, vi } from 'vitest'
import { withCache, clearCache, hasFreshCache } from './cache.js'

describe('withCache', () => {
  beforeEach(() => {
    clearCache()
    vi.useRealTimers()
  })

  it('кеширует результат и не вызывает fetcher повторно', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true })

    const a = await withCache('k1', fetcher, 60_000)
    const b = await withCache('k1', fetcher, 60_000)

    expect(a).toEqual({ ok: true })
    expect(b).toEqual({ ok: true })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(hasFreshCache('k1')).toBe(true)
  })

  it('после истечения TTL запрашивает снова', async () => {
    vi.useFakeTimers()
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second')

    await withCache('k2', fetcher, 1000)
    expect(fetcher).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1001)
    const value = await withCache('k2', fetcher, 1000)
    expect(value).toBe('second')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
