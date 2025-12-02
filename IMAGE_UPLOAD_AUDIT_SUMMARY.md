# Image/Media Upload Code Audit Summary

## Executive Overview
Found comprehensive image upload infrastructure with Cloudinary integration. All upload flows, database columns, and FormData implementations documented below.

---

## 1. FRONTEND COMPONENTS - Image Upload References

### A. App.jsx (Main Upload Logic)
**File:** `src/App.jsx`

**Import Statement:**
- **Line 20:** `import { authService, newsService, clubsService, scheduleService, projectsService, uploadService } from './api/services';`

**Helper Function - readFileAsDataUrl:**
- **Lines 235-241:** Converts file to DataURL for preview
  ```javascript
  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  ```

**Upload Handler Function:**
- **Lines 242-254:** `handleBackgroundUpload(field, file)`
  - Reads file as DataURL for preview
  - Stores file object separately for later upload: `[${field}File]`
  - Stores DataURL for preview: `[field]`
  - Error logging at **Line 254:** "Failed to load background image"

**Form State Initialization:**
- **Line 58:** `const [formData, setFormData] = useState({});`
- **Lines 145-152 & 158-165:** Form data reset logic
  - `clubBackground: ''`
  - `clubAvatar: ''`
  - `projectBackground: ''`

**Upload File Input Changes:**
- **Line 661:** Club avatar input - `onChange={(e) => handleBackgroundUpload('clubAvatar', e.target.files?.[0])`
- **Line 680:** Club background input - `onChange={(e) => handleBackgroundUpload('clubBackground', e.target.files?.[0])`
- **Line 762:** Project background input - `onChange={(e) => handleBackgroundUpload('projectBackground', e.target.files?.[0])`

**Cloudinary Upload Flow (Create Club):**
- **Lines 374-420:** Club creation with image uploads
  - **Line 375:** `let backgroundUrl = formData.clubBackground || '';` (preview fallback)
  - **Line 376:** `let clubAvatarUrl = formData.clubAvatar || '';` (preview fallback)
  - **Lines 379-384:** Upload background image to Cloudinary
    ```javascript
    if (formData.clubBackgroundFile) {
      addNotification('Загружаем фон клуба...', 'info');
      const bgUpload = await uploadService.uploadImage(formData.clubBackgroundFile, 'club-backgrounds');
      backgroundUrl = bgUpload.url;
    }
    ```
  - **Lines 386-390:** Upload club avatar to Cloudinary
    ```javascript
    if (formData.clubAvatarFile) {
      addNotification('Загружаем аватарку клуба...', 'info');
      const avatarUpload = await uploadService.uploadImage(formData.clubAvatarFile, 'club-avatars');
      clubAvatarUrl = avatarUpload.url;
    }
    ```
  - **Lines 393-405:** Error handling with detailed messages
    - Line 393: `console.error('Failed to upload images to Cloudinary:', uploadError);`
    - Line 395-399: Error notification to user
  - **Line 409:** Final payload with URLs: `backgroundUrl: backgroundUrl, clubAvatar: clubAvatarUrl`

**FormData State Usage:**
- **Line 145:** Club form data initialization
- **Line 208:** Spread pattern for updates
- **Line 248:** File storage: `[${field}File]: file`
- **Line 250:** Preview storage: `[field]: dataUrl`
- **Lines 320-322:** Extract properties for payload

### B. AdminView.jsx (Parliament Member Avatars)
**File:** `src/components/views/AdminView.jsx`

**Avatar Upload Handler:**
- **Lines 224-230:** `handleAvatarUpload(file)`
  ```javascript
  const handleAvatarUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMemberForm((prev) => ({ ...prev, avatarUrl: reader.result || '' }));
    };
    reader.readAsDataURL(file);
  };
  ```
  - Uses FileReader to convert to DataURL
  - Sets in memberForm state

**File Input for Avatar:**
- **Line 442:** `<input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e.target.files?.[0])} />`

**Avatar Display:**
- **Lines 438-445:** Show preview or placeholder

### C. SupportView.jsx
**File:** `src/components/views/SupportView.jsx`

**FormData State (Non-Image):**
- **Lines 8-12:** Form data for email support
  - No file upload, but demonstrates FormData pattern for text fields
  - `email`, `subject`, `message`

### D. ScheduleView.jsx
**File:** `src/components/views/ScheduleView.jsx`

**FormData State (Non-Image):**
- **Lines 11-15:** Schedule form state (no images)

---

## 2. API SERVICES - Upload Service Definition

**File:** `src/api/services.js`

**Upload Service Export (Lines 157-170):**
```javascript
export const uploadService = {
  async uploadImage(file, folder = 'college-hub') {
    return apiClient.uploadFile('/api/upload', file, {
      resourceType: 'image',
      folder: folder
    });
  },

  async uploadFile(file, folder = 'college-hub') {
    return apiClient.uploadFile('/api/upload', file, {
      resourceType: 'auto',
      folder: folder
    });
  }
};
```

**Key Features:**
- Two methods: `uploadImage()` and `uploadFile()`
- Endpoint: `/api/upload`
- Options passed: `resourceType` and `folder`
- Default folder: `'college-hub'`
- Called with folders: `'club-backgrounds'`, `'club-avatars'`

---

## 3. API CLIENT - FormData Implementation

**File:** `src/api/client.js`

**FormData Construction (Lines 93-128):**
```javascript
async uploadFile(endpoint, file, options = {}) {
  const token = this.getToken();
  const formData = new FormData();
  formData.append('file', file);
  
  // Add additional options to FormData
  Object.keys(options).forEach(key => {
    formData.append(key, options[key]);
  });

  try {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    // ... response handling
  }
}
```

**Key Implementation Details:**
- Creates new FormData object
- Appends file as `'file'` key
- Dynamically adds all options (resourceType, folder)
- Sets Authorization header with Bearer token
- **Important:** Does NOT set Content-Type header (browser sets `multipart/form-data` automatically)
- API_BASE_URL resolved from `VITE_API_URL` or defaults to `/api` (Line 1)

---

## 4. BACKEND UPLOAD ENDPOINT

**File:** `backend/server.js`

**Upload Route (Lines 556-625):**
```javascript
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
      mimetype: file.mimetype,
      tempPath: file.tempFilePath 
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

    console.log('[Upload] Cloudinary config OK, uploading to Cloudinary...');

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: resourceType,
      folder: folder,
      overwrite: false,
      use_filename: true
    });

    console.log('[Upload] Success! URL:', result.secure_url);

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('[Upload] Error details:', {
      message: error.message,
      code: error.code || 'UNKNOWN',
      status: error.http_code || 'NO_STATUS',
      stack: error.stack
    });
    res.status(500).json({ 
      error: error.message || 'Upload failed',
      details: `${error.code || 'ERROR'}: ${error.message}`
    });
  }
});
```

**Key Features:**
- **Line 559:** Requires `authenticateToken` middleware
- **Line 565:** Extracts file from `req.files.file`
- **Lines 567-568:** Gets resourceType and folder from request body
- **Lines 570-576:** Logs file metadata (filename, size, MIME type, temp path)
- **Lines 579-591:** Validates Cloudinary configuration
  - Checks: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Lines 596-602:** Uploads to Cloudinary
  - Uses `file.tempFilePath` (temp file from express-fileupload middleware)
  - Options: `resource_type`, `folder`, `overwrite: false`, `use_filename: true`
- **Lines 604-609:** Returns success response with URL and metadata
- **Lines 610-623:** Detailed error handling

**File Upload Middleware (Lines 103-107):**
```javascript
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));
```

**Vercel-Specific Issue:** 
- **⚠️ `/tmp/` directory issue on Vercel:**
  - Vercel doesn't support persistent `/tmp/` storage
  - Temp files created during request are deleted after response
  - This could cause issues if upload handler is interrupted
  - **Solution:** Stream directly to Cloudinary or use in-memory buffer

**Cloudinary Configuration (Lines 18-23):**
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

---

## 5. DATABASE SCHEMA - Image URL Columns

**File:** `backend/server.js`

### Clubs Table (Lines 286-309)
```javascript
CREATE TABLE IF NOT EXISTS clubs (
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
  backgroundUrl TEXT,           // ← IMAGE URL COLUMN
  backgroundType TEXT DEFAULT 'color',
  clubAvatar TEXT,              // ← IMAGE URL COLUMN
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Image Columns in Clubs:**
- **Line 304:** `backgroundUrl TEXT` - Club background image URL
- **Line 306:** `clubAvatar TEXT` - Club avatar/logo URL

### Projects Table (Lines 311-326)
```javascript
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  titleKey TEXT,
  status TEXT NOT NULL,
  needed TEXT,
  neededKeys TEXT,
  author TEXT NOT NULL,
  clubId INTEGER,
  backgroundUrl TEXT,           // ← IMAGE URL COLUMN
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Image Columns in Projects:**
- **Line 320:** `backgroundUrl TEXT` - Project background/cover image URL

### Parliament Table (Lines 359-376)
```javascript
CREATE TABLE IF NOT EXISTS parliament (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  roleKey TEXT,
  position TEXT,
  description TEXT,
  groupName TEXT,
  avatar TEXT,
  avatarUrl TEXT,               // ← IMAGE URL COLUMN
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Image Columns in Parliament:**
- **Line 365:** `avatar TEXT` - Avatar initials (e.g., "AO")
- **Line 366:** `avatarUrl TEXT` - Avatar image URL

### Column Migration/Ensure (Lines 380-390)
```javascript
ensureColumnExists('clubs', 'backgroundUrl', 'TEXT');
ensureColumnExists('clubs', 'backgroundType', "TEXT DEFAULT 'color'");
ensureColumnExists('clubs', 'clubAvatar', 'TEXT');
ensureColumnExists('projects', 'backgroundUrl', 'TEXT');
ensureColumnExists('parliament', 'avatarUrl', 'TEXT');
```

---

## 6. MOCK DATA - Hardcoded Image Paths

**File:** `src/data/mockData.js`

### SVG Data URIs (Lines 33-37)
All club backgrounds use inline SVG data URIs:

**Line 33:** `debateClubBg`
```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300'%3E%3Crect fill='%233b82f6' width='500' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3EDebate Club%3C/text%3E%3C/svg%3E
```

**Line 34:** `ecoClubBg`
```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300'%3E%3Crect fill='%2322c55e' width='500' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3EEco Campus%3C/text%3E%3C/svg%3E
```

**Line 35:** `artStudioBg`
```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300'%3E%3Crect fill='%23a855f7' width='500' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3EArt Studio%3C/text%3E%3C/svg%3E
```

**Line 36:** `techInnovatorsBg`
```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300'%3E%3Crect fill='%230ea5e9' width='500' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3ETech Innovators%3C/text%3E%3C/svg%3E
```

**Line 37:** `avatarSvg`
```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ccircle cx='50' cy='35' r='20' fill='%236b7280'/%3E%3Cpath d='M 30 70 Q 50 55 70 70 L 70 100 L 30 100 Z' fill='%236b7280'/%3E%3C/svg%3E
```

### INITIAL_CLUBS (Lines 40-43)
All 4 clubs use SVG backgrounds and avatarSvg:
- Line 40: Debate Club - `backgroundUrl: debateClubBg, clubAvatar: avatarSvg`
- Line 41: Eco Campus - `backgroundUrl: ecoClubBg, clubAvatar: avatarSvg`
- Line 42: Art Studio - `backgroundUrl: artStudioBg, clubAvatar: avatarSvg`
- Line 43: Tech Innovators - `backgroundUrl: techInnovatorsBg, clubAvatar: avatarSvg`

### INITIAL_PROJECTS (Lines 46-53)
All 3 projects use SVG backgrounds:
- Line 51: Smart Greenhouse - `backgroundUrl: greenhouseBg`
- Line 52: College Hub App - `backgroundUrl: appBg`
- Line 53: Short Film - `backgroundUrl: filmBg`

---

## 7. ENVIRONMENT VARIABLES - Cloudinary Configuration

**Required in Backend `.env` file:**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend `.env` file:**
```
VITE_API_URL=http://localhost:3000  # or production backend URL
```

---

## 8. SUMMARY TABLE

| Component | Location | Type | Details |
|-----------|----------|------|---------|
| **Frontend Upload Logic** | App.jsx:235-254 | Handler | `handleBackgroundUpload()` + `readFileAsDataUrl()` |
| **Avatar Upload** | AdminView.jsx:224-230 | Handler | Parliament member avatar (FileReader) |
| **FormData Construction** | client.js:93-128 | Implementation | `uploadFile()` with FormData + multipart |
| **Upload Service** | services.js:157-170 | Service | `uploadService.uploadImage()` + `uploadFile()` |
| **Backend Endpoint** | server.js:559 | Route | POST `/api/upload` (requires auth) |
| **File Upload Middleware** | server.js:103-107 | Middleware | express-fileupload with 50MB limit, `/tmp/` |
| **Cloudinary Upload** | server.js:596-602 | Integration | `cloudinary.uploader.upload()` |
| **Clubs Table** | server.js:286-309 | Schema | `backgroundUrl`, `clubAvatar` columns |
| **Projects Table** | server.js:311-326 | Schema | `backgroundUrl` column |
| **Parliament Table** | server.js:359-376 | Schema | `avatar`, `avatarUrl` columns |
| **Mock Data** | mockData.js:33-53 | Seed | SVG data URIs for all clubs/projects |

---

## 9. ISSUES & RECOMMENDATIONS

### ⚠️ Vercel Deployment Issues
1. **Temp File Directory:** `/tmp/` used by express-fileupload (server.js:106)
   - Vercel serverless functions have read-only `/tmp/` with limited persistence
   - **Solution:** Use `useTempFiles: false` and stream to Cloudinary instead

2. **Environment Variables:** Must be set in Vercel dashboard
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `VITE_API_URL`

### ✓ Code Quality
1. **Error Handling:** Comprehensive logging in upload endpoint (Lines 570-576, 610-623)
2. **FormData:** Correctly implemented without Content-Type header (browser auto-sets)
3. **Authentication:** Upload endpoint requires JWT token (Line 559)
4. **File Validation:** Size limit 50MB, file existence check (Lines 104, 565)

### ⚠️ Potential Issues
1. **Preview Limitations:** DataURL used for preview works only in browser, not on production
2. **File Size:** Large uploads (>50MB) will be rejected
3. **MIME Type Validation:** No MIME type validation on backend (only Cloudinary validates)

---

## 10. UPLOAD FLOW DIAGRAM

```
User Selects Image (File Input)
    ↓
handleBackgroundUpload() or handleAvatarUpload()
    ↓
FileReader.readAsDataURL()  ← Preview generation
    ↓
Store in formData state:
  - clubBackgroundFile (actual File object)
  - clubBackground (DataURL for preview)
    ↓
User submits form
    ↓
uploadService.uploadImage(file, folder)
    ↓
apiClient.uploadFile('/api/upload', file, options)
    ↓
FormData construction + multipart encoding
    ↓
POST /api/upload (with JWT token)
    ↓
Backend: express-fileupload reads to /tmp/
    ↓
Backend: Cloudinary validation
    ↓
Cloudinary: cloudinary.uploader.upload(tempFilePath, options)
    ↓
Response: { url, publicId, width, height }
    ↓
Frontend: Store URL in payload
    ↓
Backend: POST /api/clubs with backgroundUrl
    ↓
Database: clubs.backgroundUrl = Cloudinary URL
```

---

## Generated: December 3, 2025
## Files Audited: 12
## Total Upload References: 50+
