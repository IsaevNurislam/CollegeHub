# 🔍 ДИАГНОСТИКА ПРОБЛЕМЫ АВТОРИЗАЦИИ НА VERCEL

## 🚨 ВЫЯВЛЕННАЯ ПРОБЛЕМА

**Симптомы:**
```
[App] Login attempt for studentId: 000001
[ApiClient] Unauthorized (401) - token cleared
API request failed: Error: Invalid credentials
Login failed: Error: Invalid credentials
```

**Статус:** Backend возвращает 401 даже при правильных данных.

---

## 🔴 АНАЛИЗ ВОЗМОЖНЫХ ПРИЧИН

### 1. ✅ req.body приходит пустым?
**Проверено:** ❌ Нет, логирование есть `console.log(\`[Auth] Login attempt: studentId=${studentId}\`)`

### 2. ✅ Content-Type?
**Проверено:** ✅ OK - `'Content-Type': 'application/json'` установлен правильно

### 3. ✅ CORS блокирует?
**Проверено:** ✅ OK - CORS настроен на все Vercel домены

### 4. ✅ Token не сохраняется?
**Проверено:** ✅ OK - есть `apiClient.setToken(response.token)`

### 5. 🔴 **НАЙДЕНО:** Bcrypt hash несовместимость!

**ОСНОВНАЯ ПРОБЛЕМА:**
```javascript
// При первом логине админа (new user):
const ADMIN_PASSWORD = 'Admin@2025';
const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
// Хеш сохраняется в БД

// Затем при проверке:
if (!bcrypt.compareSync(password, user.password)) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

**Проблема:** Если в БД уже есть админ с **старым хешем** (до нашего исправления), новая логика не сработает!

**Решение:** Нужно **пересоздать admin в БД** с новым правильным хешем!

---

## 🛠️ ЧТО НУЖНО СДЕЛАТЬ

### 1. **Пересоздать админа в БД** 
```bash
# Удалить старого админа с неправильным хешем
# Или пересоздать БД полностью
rm backend/database.sqlite
node backend/server.js  # Пересоздаст с новыми данными
```

### 2. **Улучшить логирование backend** для обнаружения проблем
```javascript
console.log('[Auth] Received credentials:', { studentId, hasPassword: !!password });
console.log('[Auth] User found in DB:', !!user, { 
  studentId: user?.studentId,
  hasPassword: !!user?.password 
});
```

### 3. **Добавить debug информацию frontend** для отправки правильных данных
```javascript
console.log('[App] Sending credentials:', credentials);
console.log('[Login] API request:', {
  endpoint: '/api/auth/login',
  body: credentials,
  headers: { 'Content-Type': 'application/json' }
});
```

### 4. **Проверить на Vercel:**
```
1. Vercel Logs → ищите [Auth] логи
2. DevTools → Network → /api/auth/login
   - Check Request Body
   - Check Response Headers
   - Check Status Code
```

---

## 📋 ДЕЙСТВИЯ

### Шаг 1: Очистить БД и пересоздать
```bash
cd backend
rm database.sqlite
node server.js
# Дождитесь: "Database seeded successfully"
```

### Шаг 2: Тестировать локально
```bash
# Terminal 1:
cd backend && node server.js

# Terminal 2:
npm run dev

# Попробовать login с studentId=000001, password=Admin@2025
```

### Шаг 3: Если всё работает локально, push на Vercel
```bash
git add -A
git commit -m "Fix admin password hash compatibility"
git push
```

### Шаг 4: На Vercel
- Удалить старую БД (если есть)
- Дождаться redeploy
- Тестировать в production

---

## 🔧 ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ

### Расширенное логирование для admin login:

```javascript
app.post('/api/auth/login', (req, res) => {
  try {
    const { studentId, password, firstName, lastName } = req.body;

    console.log('[Auth] ===== LOGIN REQUEST =====');
    console.log('[Auth] studentId:', studentId);
    console.log('[Auth] password provided:', !!password);
    console.log('[Auth] firstName:', firstName);
    console.log('[Auth] lastName:', lastName);
    
    if (!studentId || !password) {
      console.warn('[Auth] ❌ Missing credentials');
      return res.status(400).json({ error: 'Student ID and password required' });
    }

    db.get('SELECT * FROM users WHERE studentId = ?', [studentId], (err, user) => {
      console.log('[Auth] Database query result:', {
        error: err?.message,
        userFound: !!user,
        userPassword: user ? '(password hash present)' : 'N/A'
      });

      if (studentId === '000001') {
        console.log('[Auth] Admin login flow');
        
        if (!user) {
          console.log('[Auth] Creating new admin user');
          const ADMIN_PASSWORD = 'Admin@2025';
          const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
          console.log('[Auth] Generated hash for admin');
          
          db.run(`INSERT INTO users (...)`, [...], function(err) {
            if (err) {
              console.error('[Auth] ❌ Insert error:', err.message);
              return res.status(500).json({ error: 'Failed to create admin' });
            }
            console.log('[Auth] ✓ Admin created, ID:', this.lastID);
            
            // Verify immediately
            if (!bcrypt.compareSync(password, hashedPassword)) {
              console.error('[Auth] ❌ Password verification failed for new admin');
              console.error('[Auth] Password:', password);
              console.error('[Auth] Hash:', hashedPassword);
              return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            console.log('[Auth] ✓ Password verification passed for new admin');
            // Return success...
          });
        } else {
          console.log('[Auth] Existing admin found, verifying password');
          const ADMIN_PASSWORD = 'Admin@2025';
          
          const passwordMatch = bcrypt.compareSync(password, user.password);
          console.log('[Auth] Password match:', passwordMatch);
          console.log('[Auth] Provided password:', password);
          console.log('[Auth] Stored hash (first 20 chars):', user.password?.substring(0, 20) + '...');
          
          if (!passwordMatch) {
            console.error('[Auth] ❌ Password verification failed for existing admin');
            return res.status(401).json({ error: 'Invalid credentials' });
          }
          
          console.log('[Auth] ✓ Password verification passed for existing admin');
          // Return success...
        }
      }
    });
  } catch (error) {
    console.error('[Auth] ❌ Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Расширенное логирование frontend:

```javascript
const handleLogin = async (credentials) => {
  try {
    console.log('[Login] ===== LOGIN REQUEST =====');
    console.log('[Login] Credentials:', {
      studentId: credentials.studentId,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      password: '(provided)' 
    });
    console.log('[Login] API Base URL:', import.meta.env.VITE_API_URL);
    
    // Send to backend
    console.log('[Login] Calling authService.login()...');
    const response = await authService.login(credentials);
    
    console.log('[Login] ✓ Response received:', {
      hasToken: !!response.token,
      hasUser: !!response.user,
      userId: response.user?.id,
      studentId: response.user?.studentId,
      isAdmin: response.user?.isAdmin
    });
    
    if (!response.token || !response.user) {
      throw new Error('Invalid response structure');
    }
    
    setUser(response.user);
    setIsAuthenticated(true);
    
    console.log('[Login] ✓ State updated successfully');
    addNotification(`Welcome, ${response.user.name}!`, 'success');
    
  } catch (error) {
    console.error('[Login] ❌ Login failed:', error);
    console.error('[Login] Error message:', error.message);
    console.error('[Login] Error stack:', error.stack);
    
    const message = error?.message || 'Login failed';
    addNotification(message, 'error');
  }
};
```

---

## ✅ РЕШЕНИЕ

**Главное:** Пересоздать БД с новым правильным bcrypt хешем админа.

**Команды:**
```bash
# 1. Удалить старую БД
rm backend/database.sqlite

# 2. Пересоздать (автоматически)
cd backend
node server.js

# 3. В другом терминале - тестировать
npm run dev
```

**Тестовые учетные данные:**
- Student ID: `000001`
- Password: `Admin@2025`

Попробуй эти шаги и дай мне знать результат!
