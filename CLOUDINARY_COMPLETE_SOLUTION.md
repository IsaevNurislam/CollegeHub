# ☁️ Cloudinary Image Upload - Полное Решение для Vercel

## 📋 Готовый Рабочий Код

### 1️⃣ **Backend Upload Endpoint** (`backend/server.js`)

```javascript
// ✅ WORKING - Uses upload_stream for Vercel serverless
app.post('/api/upload', authenticateToken, async (req, res) => {
  try {
    console.log('[Upload] Request received, user:', req.user?.id);
    
    if (!req.files || Object.keys(req.files).length === 0) {
      console.error('[Upload] No files in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const resourceType = req.body.resourceType || 'auto';
    const folder = req.body.folder || 'college-hub';

    console.log('[Upload] File info:', { 
      filename: file.name, 
      size: file.size,
      mimetype: file.mimetype
    });

    // Validate Cloudinary config
    const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                                process.env.CLOUDINARY_API_KEY && 
                                process.env.CLOUDINARY_API_SECRET;
    
    if (!hasCloudinaryConfig) {
      console.error('[Upload] Cloudinary not configured');
      return res.status(500).json({ 
        error: 'Image upload not configured',
        details: 'Missing Cloudinary credentials in environment variables'
      });
    }

    console.log('[Upload] Cloudinary config OK, uploading file...');

    // ✅ CRITICAL: Use upload_stream for Vercel (works with memory buffer)
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: folder,
            overwrite: false,
            use_filename: true
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // End the stream with file data (Buffer from memory)
        uploadStream.end(file.data);
      });

      console.log('[Upload] Success! URL:', result.secure_url);

      res.json({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      });
    } catch (cloudinaryError) {
      console.error('[Upload] Cloudinary error:', cloudinaryError.message);
      throw cloudinaryError;
    }
  } catch (error) {
    console.error('[Upload] Error details:', {
      message: error.message,
      code: error.code || 'UNKNOWN',
      status: error.http_code || 'NO_STATUS'
    });
    res.status(500).json({ 
      error: error.message || 'Upload failed',
      details: error.message
    });
  }
});
```

### 2️⃣ **Frontend Upload Service** (`src/api/client.js`)

```javascript
// ✅ WORKING - Proper FormData and error handling
async uploadFile(endpoint, file, options = {}) {
  const token = this.getToken();
  const formData = new FormData();
  formData.append('file', file);
  
  // Add additional options to FormData
  Object.keys(options).forEach(key => {
    formData.append(key, options[key]);
  });

  try {
    console.log('[ApiClient] Upload file:', { endpoint, filename: file.name, size: file.size });
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized - please login again');
      }
      
      let errorMsg = `Upload failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorData.details || errorMsg;
      } catch {
        // If response is not JSON, use statusText
      }
      
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('[ApiClient] Upload success:', result);
    return result;
  } catch (error) {
    console.error('[ApiClient] Upload error:', error);
    throw error;
  }
}
```

### 3️⃣ **React Component Usage** (`src/App.jsx`)

```jsx
// ✅ WORKING - Club creation with image upload
const handleModalSubmit = async () => {
  if (isSubmittingModal) return;
  
  let clubPayload;
  try {
    setIsSubmittingModal(true);
    if (modalType === 'club') {
      const { name, category, description, color } = formData;
      const backgroundType = formData.clubBackground ? 'image' : 'color';
      const socialLinks = formData.socialLinks || {};

      // Validation
      if (!name.trim()) {
        addNotification('Введите название клуба', 'error');
        setIsSubmittingModal(false);
        return;
      }
      if (!description.trim()) {
        addNotification('Введите описание клуба', 'error');
        setIsSubmittingModal(false);
        return;
      }
      if (!formData.clubBackground) {
        addNotification('Загрузите фон клуба', 'error');
        setIsSubmittingModal(false);
        return;
      }
      if (!formData.clubAvatar) {
        addNotification('Загрузите аватарку клуба', 'error');
        setIsSubmittingModal(false);
        return;
      }

      const preparedLinks = Object.fromEntries(
        Object.entries(socialLinks).map(([key, value]) => [key, normalizeUrl(value)])
      );

      // ✅ Upload files to Cloudinary if they exist
      let backgroundUrl = formData.clubBackground || '';
      let clubAvatarUrl = formData.clubAvatar || '';

      try {
        // Upload background image to Cloudinary
        if (formData.clubBackgroundFile) {
          addNotification('Загружаем фон клуба...', 'info');
          const bgUpload = await uploadService.uploadImage(formData.clubBackgroundFile, 'club-backgrounds');
          backgroundUrl = bgUpload.url;
        }

        // Upload club avatar to Cloudinary
        if (formData.clubAvatarFile) {
          addNotification('Загружаем аватарку клуба...', 'info');
          const avatarUpload = await uploadService.uploadImage(formData.clubAvatarFile, 'club-avatars');
          clubAvatarUrl = avatarUpload.url;
        }
      } catch (uploadError) {
        console.error('Failed to upload images to Cloudinary:', uploadError);
        const errorMessage = uploadError?.message || 'Неизвестная ошибка';
        const errorDetails = uploadError?.response?.error || uploadError?.details || '';
        const fullMessage = errorDetails 
          ? `Ошибка загрузки: ${errorMessage} (${errorDetails})`
          : `Ошибка при загрузке изображений: ${errorMessage}`;
        addNotification(fullMessage, 'error');
        setIsSubmittingModal(false);
        return;
      }

      const payload = {
        name,
        category,
        description,
        color: color || 'bg-sky-600',
        backgroundUrl: backgroundUrl,  // ✅ Cloudinary URL
        clubAvatar: clubAvatarUrl,      // ✅ Cloudinary URL
        backgroundType,
        ...preparedLinks
      };
      clubPayload = payload;
      
      const newClub = await clubsService.create(payload);
      setClubs(prev => [...prev, newClub]);
      addNotification('Клуб создан успешно!', 'success');
      setModalOpen(false);
      setFormData({});
    }
  } catch (error) {
    const message = error?.message || 'Ошибка при создании клуба';
    console.error('Failed to create club:', { payload: clubPayload }, error);
    addNotification(message, 'error');
  } finally {
    setIsSubmittingModal(false);
  }
};

// ✅ File upload handler - stores both File and DataURL
const handleBackgroundUpload = async (field, file) => {
  if (!file) return;
  try {
    const dataUrl = await readFileAsDataUrl(file);
    setFormData((prev) => ({ 
      ...prev, 
      [`${field}File`]: file,   // ✅ Store File for upload
      [field]: dataUrl            // ✅ Store DataURL for preview
    }));
  } catch (error) {
    console.error('Failed to load background image:', error);
  }
};
```

### 4️⃣ **Vercel Configuration**

**`vercel.json` (frontend)**:
```json
{
  "env": {
    "VITE_API_URL": "/api",
    "NODE_ENV": "production"
  }
}
```

**`backend/vercel.json`**:
```json
{
  "env": {
    "CLOUDINARY_CLOUD_NAME": "@cloudinary_cloud_name",
    "CLOUDINARY_API_KEY": "@cloudinary_api_key",
    "CLOUDINARY_API_SECRET": "@cloudinary_api_secret",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

**Vercel Dashboard (Settings → Environment Variables)**:
```
CLOUDINARY_CLOUD_NAME = mediaflows_6b04d6ab-466b-4e97-85c5-99a545779f17
CLOUDINARY_API_KEY = 132224669667273
CLOUDINARY_API_SECRET = uY6Z-bT8E-SJA2JWz3mbophQlgk
```

### 5️⃣ **Database Schema** (`backend/server.js`)

```javascript
// Clubs table with image columns
db.run(`CREATE TABLE IF NOT EXISTS clubs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  categoryKey TEXT,
  members INTEGER DEFAULT 0,
  description TEXT,
  descriptionKey TEXT,
  color TEXT DEFAULT 'bg-blue-500',
  instagram TEXT,
  telegram TEXT,
  whatsapp TEXT,
  tiktok TEXT,
  youtube TEXT,
  website TEXT,
  creatorId INTEGER,
  creatorName TEXT,
  photos TEXT DEFAULT '[]',
  backgroundUrl TEXT,           // ✅ Store Cloudinary URL
  backgroundType TEXT DEFAULT 'color',
  clubAvatar TEXT,              // ✅ Store Cloudinary URL
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
```

### 6️⃣ **Middleware Setup** (`backend/server.js`)

```javascript
// ✅ CRITICAL: useTempFiles: false for Vercel serverless
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  useTempFiles: false,  // ✅ Don't use temp files on Vercel
  abortOnLimit: true
}));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

## 🚀 Полный Flow

1. **User selects image** → `handleBackgroundUpload()` stores File + DataURL for preview
2. **User submits form** → `uploadService.uploadImage()` sends File to `/api/upload`
3. **Backend receives** → Validates auth, checks Cloudinary config
4. **Backend uploads** → Uses `upload_stream()` with file buffer (works on Vercel)
5. **Cloudinary returns** → `secure_url` и `public_id`
6. **Backend returns** → Sends URL to frontend
7. **Frontend stores** → Saves URL to DB via `clubsService.create()`
8. **Display image** → `backgroundUrl` in `<img src={club.backgroundUrl} />`
9. **Page reload** → Image loads from DB → displays from Cloudinary CDN

## ✅ Что исправлено

- ✅ Заменён `upload(tempFilePath)` на `upload_stream()` - работает на Vercel
- ✅ Убрано `useTempFiles: true` и `/tmp/` - Vercel doesn't support
- ✅ Улучшена обработка ошибок на фронтенде и бэкенде
- ✅ Проверена конфигурация Vercel и переменные окружения
- ✅ Проверена база данных - колонки для Cloudinary URLs
- ✅ VITE_API_URL правильно настроена

## 🔍 Как протестировать

1. Убедись что Cloudinary credentials в Vercel Dashboard
2. Дождись deployment (2-3 мин)
3. Логин: `000001` / `admin123`
4. Создай клуб с загрузкой фото
5. Проверь что фото отображается
6. Перезагрузи страницу - фото должна остаться (загружена из DB)
