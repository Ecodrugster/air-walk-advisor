import { useCallback, useEffect, useState } from 'react'
import { searchCities } from './api/geocoding.js'
import { getWeather } from './api/weather.js'
import { getAirQuality } from './api/airQuality.js'
import {
  getPm25Level,
  getPm10Level,
  worseLevel,
  getLevelMeta,
} from './lib/airQualityLevel.js'
import { getWalkAdvice, getVentilationAdvice } from './lib/recommendations.js'
import { weatherCodeToText } from './lib/weatherCode.js'
import {
  loadFavorites,
  toggleFavorite,
  isFavorite,
} from './lib/favorites.js'
import './App.css'

function formatCityLabel(city) {
  const parts = [city.name]
  if (city.admin1) parts.push(city.admin1)
  if (city.country) parts.push(city.country)
  return parts.join(', ')
}

function App() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searchStatus, setSearchStatus] = useState('idle')
  const [searchError, setSearchError] = useState('')

  const [city, setCity] = useState(null)
  const [dataStatus, setDataStatus] = useState('idle')
  const [dataError, setDataError] = useState('')
  const [weather, setWeather] = useState(null)
  const [air, setAir] = useState(null)

  const [favorites, setFavorites] = useState(() => loadFavorites())

  const loadCityData = useCallback(async (selected) => {
    setCity(selected)
    setSuggestions([])
    setQuery(selected.name)
    setDataStatus('loading')
    setDataError('')
    setWeather(null)
    setAir(null)

    try {
      const [w, a] = await Promise.all([
        getWeather(selected.latitude, selected.longitude),
        getAirQuality(selected.latitude, selected.longitude),
      ])
      setWeather(w)
      setAir(a)
      setDataStatus('success')
    } catch (err) {
      setDataStatus('error')
      setDataError(err instanceof Error ? err.message : 'Не удалось загрузить данные')
    }
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setSuggestions([])
      setSearchStatus('idle')
      setSearchError('')
      return
    }

    if (city && q === city.name) {
      return
    }

    const timer = setTimeout(async () => {
      setSearchStatus('loading')
      setSearchError('')
      try {
        const results = await searchCities(q)
        setSuggestions(results)
        setSearchStatus('success')
      } catch (err) {
        setSuggestions([])
        setSearchStatus('error')
        setSearchError(
          err instanceof Error ? err.message : 'Ошибка поиска города',
        )
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query, city])

  const onToggleFavorite = () => {
    if (!city) return
    setFavorites((prev) => toggleFavorite(prev, city))
  }

  const level =
    air != null
      ? worseLevel(getPm25Level(air.pm25), getPm10Level(air.pm10))
      : null
  const levelMeta = level ? getLevelMeta(level) : null
  const walk = air != null ? getWalkAdvice(air.pm25, air.pm10) : null
  const vent =
    air?.hourly != null ? getVentilationAdvice(air.hourly) : null

  return (
    <div className="app">
      <header className="header">
        <p className="badge">Средний уровень</p>
        <h1>Air Walk Advisor</h1>
        <p className="lead">
          Погода, PM2.5 / PM10 и простой ответ: можно ли гулять и когда
          проветривать.
        </p>
      </header>

      <section className="panel favorites" aria-label="Избранные города">
        <h2>Быстрый выбор</h2>
        <div className="chip-row">
          {favorites.map((f) => (
            <button
              key={f.id}
              type="button"
              className={
                city?.id === f.id ? 'chip chip-active' : 'chip'
              }
              onClick={() => loadCityData(f)}
            >
              {f.name}
            </button>
          ))}
        </div>
      </section>

      <section className="panel search" aria-label="Поиск города">
        <label htmlFor="city-search" className="label">
          Город
        </label>
        <div className="search-row">
          <input
            id="city-search"
            type="search"
            autoComplete="off"
            placeholder="Например, Алматы"
            value={query}
            onChange={(e) => {
              setCity(null)
              setQuery(e.target.value)
            }}
          />
          {city && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onToggleFavorite}
              aria-pressed={isFavorite(favorites, city.id)}
            >
              {isFavorite(favorites, city.id)
                ? 'В избранном'
                : 'В избранное'}
            </button>
          )}
        </div>

        {searchStatus === 'loading' && (
          <p className="status" role="status">
            Ищем город…
          </p>
        )}
        {searchStatus === 'error' && (
          <p className="status status-error" role="alert">
            {searchError}
          </p>
        )}
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => loadCityData(s)}>
                  {formatCityLabel(s)}
                </button>
              </li>
            ))}
          </ul>
        )}
        {searchStatus === 'success' &&
          suggestions.length === 0 &&
          query.trim().length >= 2 &&
          !city && (
            <p className="status">Город не найден. Попробуйте другое название.</p>
          )}
      </section>

      {dataStatus === 'loading' && (
        <p className="status panel" role="status">
          Загружаем погоду и качество воздуха…
        </p>
      )}
      {dataStatus === 'error' && (
        <p className="status status-error panel" role="alert">
          {dataError}
        </p>
      )}

      {dataStatus === 'success' && city && weather && air && walk && levelMeta && (
        <div className="results">
          <section className="panel card">
            <h2>{formatCityLabel(city)}</h2>
            <p className="muted">Обновлено: {weather.time}</p>
            <dl className="stats">
              <div>
                <dt>Температура</dt>
                <dd>{Math.round(weather.temperature)} °C</dd>
              </div>
              <div>
                <dt>Ощущается</dt>
                <dd>{Math.round(weather.apparentTemperature)} °C</dd>
              </div>
              <div>
                <dt>Ветер</dt>
                <dd>{Math.round(weather.windSpeed)} км/ч</dd>
              </div>
              <div>
                <dt>Небо</dt>
                <dd>{weatherCodeToText(weather.weatherCode)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel card">
            <h2>Качество воздуха</h2>
            <div
              className="level-pill"
              style={{
                backgroundColor: `${levelMeta.color}22`,
                borderColor: levelMeta.color,
                color: levelMeta.color,
              }}
            >
              {levelMeta.label}
            </div>
            <dl className="stats">
              <div>
                <dt>PM2.5</dt>
                <dd>
                  <span
                    className="dot"
                    style={{ backgroundColor: getLevelMeta(getPm25Level(air.pm25)).color }}
                  />
                  {Math.round(air.pm25)} мкг/м³
                </dd>
              </div>
              <div>
                <dt>PM10</dt>
                <dd>
                  <span
                    className="dot"
                    style={{ backgroundColor: getLevelMeta(getPm10Level(air.pm10)).color }}
                  />
                  {Math.round(air.pm10)} мкг/м³
                </dd>
              </div>
            </dl>
          </section>

          <section className="panel card advice">
            <h2>Рекомендация</h2>
            <p className="advice-summary">{walk.summary}</p>
            <p>{walk.detail}</p>
            <ul className="flags">
              <li className={walk.canWalk ? 'ok' : 'no'}>
                {walk.canWalk ? 'Гулять можно' : 'Гулять лучше не стоит'}
              </li>
              <li className={walk.withChild ? 'ok' : 'no'}>
                {walk.withChild
                  ? 'С ребёнком — допустимо'
                  : 'С ребёнком — не рекомендуется'}
              </li>
            </ul>
          </section>

          {vent && (
            <section className="panel card">
              <h2>Проветривание</h2>
              <p>{vent.message}</p>
              <p className="muted">Лучшие часы: {vent.bestHours.join(' · ')}</p>
            </section>
          )}
        </div>
      )}

      <footer className="footer">
        Данные: Open-Meteo (геокодинг, погода, качество воздуха). Кеш ответов —
        15 минут.
      </footer>
    </div>
  )
}

export default App
