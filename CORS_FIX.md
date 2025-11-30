# Backend CORS Fix

## Что было изменено:

В `backend/server.js` добавлены Vercel origins в CORS конфигурацию:

```javascript
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/college-space.*\.vercel\.app$/,  // Vercel origins
  /^https:\/\/.*\.vercel\.app$/
];
```

## Для синхронизации с backend репозиторием:

1. Откройте backend репозиторий
2. Обновите `backend/server.js` с новой CORS конфигурацией
3. Запушьте изменения
4. Redeploy backend на Vercel

## Frontend будет подключаться через:
- `https://backend-college-hub.vercel.app`

## После обновления:
- ✅ CORS ошибки исчезнут
- ✅ Frontend сможет делать запросы к backend
- ✅ Логин и все API запросы будут работать
