# Air Walk Advisor

Одностраничное приложение: по названию города показывает текущую погоду, PM2.5 / PM10 и рекомендации — можно ли гулять (в том числе с ребёнком) и когда лучше проветривать.

**Уровень:** средний (поиск, погода, воздух, советы, лучшие часы проветривания, избранные города, кеш 15 минут, автотесты).

## Стек

- React + Vite
- Open-Meteo: Geocoding, Forecast, Air Quality (без API-ключа)
- Vitest + Testing Library

## Запуск

```bash
npm install
npm run dev
```

## Тесты и сборка

```bash
npm test
npm run build
```

## Репозиторий

https://github.com/Ecodrugster/air-walk-advisor

## Деплой на Vercel

1. Войдите на [vercel.com](https://vercel.com) через GitHub.
2. Add New Project → выберите `air-walk-advisor`.
3. Framework Preset: Vite. Build Command: `npm run build`, Output Directory: `dist`.
4. Deploy. После каждого `git push` сайт обновляется автоматически.

## Структура

- `src/api/` — запросы к Open-Meteo
- `src/lib/` — чистые функции (уровни PM, советы, кеш, избранное)
- `src/App.jsx` — интерфейс и состояния загрузки / ошибки
