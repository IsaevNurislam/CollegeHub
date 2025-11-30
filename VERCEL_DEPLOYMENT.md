# Развертывание на Vercel

## Для фронтенда (React + Vite)

### Шаги:

1. **Подготовка репозитория**
   - Убедитесь, что весь код закоммичен и в GitHub
   - `git push origin main`

2. **Импорт в Vercel**
   - Перейти на https://vercel.com
   - Нажать "New Project"
   - Выбрать репозиторий CollegeHub
   - Выбрать корневую папку: `.`

3. **Настройка переменных окружения**
   - Settings → Environment Variables
   - Добавить переменные (если используются):
     - `VITE_API_URL` = URL вашего backend

4. **Деплой**
   - Vercel автоматически обнаружит `vercel.json`
   - Нажать "Deploy"

---

## Для бэкенда (Node.js + Express)

### Вариант 1: Vercel Functions (рекомендуется)

1. **Структура проекта**
   ```
   backend/
   ├── api/
   │   └── server.js  → /api/server (entry point)
   ├── vercel.json
   └── package.json
   ```

2. **Создать `backend/api/server.js`**
   - Экспортировать Express app как default export
   - Vercel автоматически создаст функцию

3. **Переменные окружения в Vercel**
   - `GMAIL_USER` = ваш Gmail
   - `GMAIL_APP_PASSWORD` = App Password
   - `NODE_ENV` = production

4. **Деплой**
   ```bash
   vercel --cwd ./backend
   ```

### Вариант 2: Отдельное приложение на Railway/Render

- Используйте Railway.app или Render.com
- URL backend → Environment Variable фронтенда

---

## Переменные окружения

### Frontend (Vercel Project Settings → Environment Variables)

```
VITE_API_URL = https://your-backend-url.vercel.app
```

### Backend (Vercel Project Settings → Environment Variables)

```
GMAIL_USER = your-email@gmail.com
GMAIL_APP_PASSWORD = xxxx xxxx xxxx xxxx
NODE_ENV = production
PORT = 3000
```

**Как получить Gmail App Password:**
1. Перейти на https://myaccount.google.com/apppasswords
2. Выбрать "Mail" и "Windows Computer" (или другое)
3. Скопировать 16-значный пароль
4. Вставить в `GMAIL_APP_PASSWORD` (с пробелами как есть)

---

## Команды

```bash
# Локально проверить Vercel конфиг
vercel dev

# Деплой фронтенда
vercel --prod

# Деплой бэкенда
vercel --cwd ./backend --prod
```

---

## Troubleshooting

- **Build fails**: Проверить `npm run build` локально
- **API не доступен**: Убедиться что `VITE_API_URL` правильный
- **Database не инициализируется**: SQLite создается автоматически в `/tmp` (ephemeral)

**Для продакшена рекомендуется использовать PostgreSQL вместо SQLite.**
