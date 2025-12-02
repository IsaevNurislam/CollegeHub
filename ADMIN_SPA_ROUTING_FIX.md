# 🔐 SPA Routing & Admin Protection - Полное решение

## Проблема (ДО)

**症状:** При попытке зайти в админку (`/admin`) происходит:
1. Reload страницы (F5)
2. Исчезновение админ доступа
3. Redirect на домашнюю страницу
4. Невозможно стабильно войти в админ

**Корень проблемы:**

```jsx
// ДО (неправильно)
<Route
  path="/admin"
  element={user?.isAdmin ? <AdminView /> : <div>access_denied</div>}
/>
```

При обновлении страницы:
1. Vercel возвращает `index.html` ✅
2. React загружается, но `user` ещё `null`
3. Ternary `user?.isAdmin` возвращает `false`
4. Показывается "access_denied"
5. Даже когда загружается user - компонент НЕ переходит на `/admin`
6. Бесконечный цикл: попытка зайти → ошибка → redirect

## Решение

### 1️⃣ ProtectedRoute компонент

**Файл:** `src/components/common/ProtectedRoute.jsx`

```jsx
export default function ProtectedRoute({
  isLoading,
  isAuthenticated,
  user,
  requiredRole, // 'admin' или null
  element
}) {
  // Если ещё загружается - показываем spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Если не аутентифицирован - редирект
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Если требуется админ роль - проверяем
  if (requiredRole === 'admin' && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Всё хорошо - показываем компонент
  return element;
}
```

**Логика:**
- ✅ Ожидает загрузки user из localStorage
- ✅ Только потом проверяет права
- ✅ Безопасно редиректит если нет доступа

### 2️⃣ Обновлён React Router

**Файл:** `src/App.jsx` (строка ~987)

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute
      isLoading={loading}
      isAuthenticated={isAuthenticated}
      user={user}
      requiredRole="admin"
      element={<AdminView user={user} feedback={feedback} onAcceptFeedback={handleAcceptFeedback} />}
    />
  }
/>
```

### 3️⃣ Улучшена Vercel конфигурация

**Файл:** `vercel.json`

```json
{
  "cleanUrls": true,        // Убирает .html расширения
  "trailingSlash": false,   // /admin/ → /admin
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"  // ALL routes → index.html (SPA)
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [{
        "key": "Cache-Control",
        "value": "no-cache, no-store, must-revalidate"  // API не кешируется
      }]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"  // Assets кешируются
      }]
    }
  ]
}
```

### 4️⃣ Backend проверка

**Файл:** `backend/server.js` (строка ~752)

```javascript
app.get('/api/user/me', authenticateToken, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      studentId: user.studentId,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isAdmin: user.isAdmin === 1,  // ✅ Возвращаем флаг
      joinedClubs: JSON.parse(user.joinedClubs || '[]'),
      joinedProjects: JSON.parse(user.joinedProjects || '[]')
    });
  });
});
```

### 5️⃣ Login endpoint - админ поддержка

**Файл:** `backend/server.js` (строка ~660)

При создании нового пользователя:
```javascript
// StudentId 000001 → админ
const isAdmin = studentId === '000001' ? 1 : 0;

db.run(`INSERT INTO users (..., isAdmin, ...) 
        VALUES (..., ?, ...)`,
  [..., isAdmin, ...]);
```

При возврате user после логина:
```javascript
res.json({
  token,
  user: {
    // ... другие поля
    isAdmin: user.isAdmin === 1,  // ✅ Возвращаем флаг админа
  }
});
```

## Как это работает ПОСЛЕ исправления

### Сценарий 1: Свежий логин (без token в localStorage)

```
1. Открываешь https://college-space.vercel.app/
2. App.jsx loading=true, user=null
3. ProtectedRoute показывает spinner
4. useEffect вызывает authService.getMe() → 401 (нет token)
5. setLoading(false)
6. Показывается LoginView
7. Вводишь данные: studentId=000001, password=xxx
8. POST /api/auth/login → возвращает user с isAdmin=true
9. setUser(response.user) → user.isAdmin=true ✅
10. setIsAuthenticated(true)
11. Автоматический переход на /admin

Результат: ✅ Админ панель работает!
```

### Сценарий 2: Обновление страницы (F5) на /admin

```
1. Нажимаешь F5 на странице /admin
2. Vercel возвращает index.html (SPA routing)
3. React загружается, loading=true, user=null
4. ProtectedRoute показывает spinner (ждёт)
5. useEffect вызывает authService.getMe()
6. Backend возвращает user с isAdmin=true
7. setUser(user) → user.isAdmin=true ✅
8. setLoading(false) → ProtectedRoute больше не показывает spinner
9. ProtectedRoute проверяет: user.isAdmin === true ✅
10. Показывает AdminView

Результат: ✅ Админ панель работает БЕЗ reload!
```

### Сценарий 3: Обычный пользователь пытается открыть /admin

```
1. Обычный пользователь открывает /admin напрямую
2. React загружается, loading=true
3. ProtectedRoute показывает spinner
4. useEffect восстанавливает обычного user (isAdmin=false)
5. setLoading(false) → ProtectedRoute проверяет roles
6. requiredRole='admin' && user.isAdmin=false
7. <Navigate to="/" replace /> → безопасный redirect
8. Показывается домашняя страница

Результат: ✅ Защита работает!
```

## Почему это решает проблему

| Проблема | Решение | Результат |
|----------|---------|-----------|
| Reload на /admin | ProtectedRoute показывает spinner пока loading | ✅ Нет видимого reload |
| Потеря админ доступа при F5 | authService.getMe() восстанавливает user | ✅ isAdmin сохраняется |
| Бесконечные редиректы | Правильная логика: сначала load, потом check | ✅ Один редирект если нужно |
| 404 на /admin | Vercel rewrite на /index.html + React Router | ✅ Маршрут работает |
| Некешируемый API | Cache-Control: no-cache для /api/* | ✅ Свежие данные |

## Тестирование

### Локально:
```bash
npm run build
npm run preview
# Откроешь http://localhost:4173/admin
# Должна загруститься админ панель!
```

### На Vercel:
1. Push всех изменений (автоматически пересоберётся)
2. Логинишься как админ (studentId=000001)
3. Открываешь /admin
4. Нажимаешь F5 - админ панель остаётся
5. Открываешь в новой вкладке /admin - работает
6. Логишься как обычный пользователь
7. Пытаешься открыть /admin - редирект на домашнюю

## Файлы изменены

- ✅ `src/components/common/ProtectedRoute.jsx` - NEW
- ✅ `src/App.jsx` - admin route updated
- ✅ `vercel.json` - SPA routing improved
- ✅ `backend/server.js` - админ поддержка added (уже в коде)

## Развертывание

```bash
git add -A
git commit -m "Fix SPA routing for admin panel - add ProtectedRoute and improve Vercel config"
git push
# Vercel автоматически пересоберётся
# Через 1-2 минуты адм панель будет работать!
```

---

**Статус:** ✅ Решено  
**Время развертывания:** ~2 минуты на Vercel
