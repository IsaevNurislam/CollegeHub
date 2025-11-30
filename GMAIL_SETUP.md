# Gmail Setup для отправки Email'ов

Когда вы готовы к production, следуйте этим шагам для настройки отправки email'ов через Gmail.

## Шаг 1: Создайте Google Account (если его нет)

Создайте или используйте существующий Gmail аккаунт для отправки писем приложения.

## Шаг 2: Включите двухфакторную аутентификацию

1. Перейдите на https://myaccount.google.com/security
2. В левом меню выберите **Security** (Безопасность)
3. Найдите **2-Step Verification** (2FA)
4. Нажмите на неё и следуйте инструкциям

## Шаг 3: Создайте App Password

1. Перейдите на https://myaccount.google.com/apppasswords
2. В выпадающем меню **Select the app** (Выбрать приложение) выберите **Mail**
3. В выпадающем меню **Select the device** (Выбрать устройство) выберите **Windows Computer** (или ваше устройство)
4. Нажмите **Generate** (Создать)
5. Google создаст 16-символьный пароль (с пробелами)
6. **Скопируйте пароль** (без пробелов)

## Шаг 4: Добавьте в .env

Отредактируйте файл `backend/.env`:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

Замените:
- `your-email@gmail.com` на вашу Gmail адрес
- `xxxx-xxxx-xxxx-xxxx` на скопированный App Password (без пробелов)

Пример:
```env
GMAIL_USER=collegehub.support@gmail.com
GMAIL_APP_PASSWORD=ykfbsqktyceoyu hg
```

## Шаг 5: Перезапустите backend

```bash
cd backend
node server.js
```

## Результат

Теперь когда админ примет feedback в панели управления, email будет отправлен на адрес пользователя через ваш Gmail аккаунт.

## Для разработки (Development)

Если вы не хотите настраивать Gmail:
- Оставьте `GMAIL_USER` и `GMAIL_APP_PASSWORD` пустыми в `.env`
- Используется Ethereal тестовый сервис
- Email'ы можно просмотреть в консоли backend'а по ссылке

## Безопасность

⚠️ **Важно:**
- Никогда не коммитьте `.env` файл в Git (в `.gitignore` уже добавлен)
- App Password это не ваш обычный пароль Google
- App Password можно удалить в любой момент на https://myaccount.google.com/apppasswords
- Используйте разные App Passwords для разных приложений

## Troubleshooting

### "Invalid login: 535-5.7.8 Username and Password not accepted"

- ✓ Убедитесь что 2FA включена
- ✓ Используете App Password, а не обычный пароль
- ✓ Пароль скопирован правильно (без пробелов)
- ✓ Перезапустили backend после изменения .env

### Email не приходит

- ✓ Проверьте консоль backend'а - есть ли ошибки
- ✓ Убедитесь что email адрес пользователя правильный
- ✓ Проверьте папку Spam/Junk в Gmail

## Альтернативы

Если Gmail не подходит, можно использовать:
- SendGrid
- Mailgun
- AWS SES
- Любой SMTP сервис

Просто измените конфигурацию nodemailer в `backend/server.js`.
