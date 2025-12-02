# Fix: 404 Not Found on Vercel After Page Refresh

## Problem
When deploying a React + Vite SPA to Vercel, navigating through the app works fine, but refreshing the page or directly accessing routes like `/clubs`, `/projects`, `/activity` results in **404 Not Found**.

**Root Cause**: Vercel wasn't configured to return `index.html` for all routes, causing SPA routing issues.

---

## Solution Applied

### 1. Fixed `vite.config.js`

**Changed**:
```javascript
// ❌ OLD
base: './',

// ✅ NEW  
base: '/',
```

**Why**: 
- `'./'` causes relative path issues on production with absolute routes
- `'/'` ensures all assets load with absolute paths from root
- Added explicit `build` configuration for clarity

**Added to build config**:
```javascript
build: {
  outDir: 'dist',
  sourcemap: false,
}
```

### 2. Updated `vercel.json` for SPA Routing

**Key Changes**:

#### a) Added Header Cache Control
```json
{
  "source": "/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=0, must-revalidate"
    }
  ]
}
```
- Prevents HTML caching to ensure fresh routing on refresh
- Assets in `/assets/` still use long cache (31536000 seconds = 1 year)

#### b) Optimized Rewrites Order
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "https://backend-college-hub.vercel.app/api/$1"
  },
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

**Why this order matters**:
1. **First rule**: `/api/*` requests bypass SPA routing and go directly to backend
2. **Second rule**: All other requests (including `/clubs`, `/projects`) → `index.html` → React Router handles
3. **Critical**: API requests must be caught before the catch-all route!

### 3. React Router Configuration (No Changes Needed)

Your current React Router setup is **perfect** for SPA:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

<Router>
  <Routes>
    <Route path="/" element={<HomeView />} />
    <Route path="/clubs" element={<ClubsView />} />
    <Route path="/projects" element={<ProjectsView />} />
    <Route path="/activity" element={<ActivityView />} />
    <Route path="/schedule" element={<ScheduleView />} />
    <Route path="/parliament" element={<ParliamentView />} />
    <Route path="/admin" element={<AdminView />} />
    <Route path="/support" element={<SupportView />} />
    <Route path="*" element={<Navigate to="/" replace />} /> {/* Fallback */}
  </Routes>
</Router>
```

---

## How It Works Now

```
User Action: Refresh /clubs
     ↓
Browser: GET /clubs
     ↓
Vercel rewrites match:
  ├─ /api/* ? → backend
  └─ /* ? → /index.html ✅
     ↓
Vercel serves: /index.html
     ↓
Vite loads:
  ├─ CSS
  ├─ JavaScript
  └─ Loads /src/main.jsx
     ↓
React Router:
  ├─ Parses pathname: /clubs
  ├─ Matches route: /clubs
  ├─ Renders: <ClubsView />
     ↓
✅ Page displays correctly!
```

---

## Files Changed

### 1. `vite.config.js`
- `base: './'` → `base: '/'`
- Added `build` configuration
- No other changes needed

### 2. `vercel.json`
- Added cache control header for HTML files
- Added API route rewrite (important!)
- Kept asset cache headers (1 year for immutable files)
- Catch-all rewrite stays last

### 3. React Router
- ✅ No changes - already correct!
- BrowserRouter wraps whole app
- Fallback route handles unknown paths

---

## Testing Locally

```bash
# Test dev mode (Vite proxy handles routing)
npm run dev

# Test production build locally
npm run build
npm run preview

# In preview mode:
# 1. Navigate to http://localhost:4173/clubs
# 2. Refresh the page
# 3. Should NOT show 404
# 4. Clubs page should load normally
```

---

## Deployment Instructions

1. **Push changes**:
   ```bash
   git add vite.config.js vercel.json
   git commit -m "Fix: 404 Not Found on Vercel after page refresh - SPA routing fix"
   git push origin main
   ```

2. **Vercel automatically redeploys** when main branch updated

3. **Test on production**:
   - Visit: `https://college-space-*.vercel.app/clubs`
   - Refresh page (F5)
   - Should see clubs, NOT 404

---

## Key Configuration Files

### ✅ `vite.config.js` (FIXED)
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/',  // ← CHANGED
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {    // ← ADDED
    outDir: 'dist',
    sourcemap: false,
  },
})
```

### ✅ `vercel.json` (FIXED)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "cleanUrls": true,
  "trailingSlash": false,
  "env": {
    "VITE_API_URL": "@vite_api_url"
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }]
    },
    {
      "source": "/(.*)",
      "headers": [{
        "key": "Cache-Control",
        "value": "public, max-age=0, must-revalidate"  // ← ADDED
      }]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://backend-college-hub.vercel.app/api/$1"  // ← ADDED
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### ✅ `src/App.jsx` - Router (NO CHANGES NEEDED)
Already correctly configured with `BrowserRouter` and catch-all fallback route.

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Still getting 404 on Vercel | Old build cached | Clear Vercel cache & redeploy |
| Works locally, fails on Vercel | Different config | Verify vercel.json saved and pushed |
| API calls fail | Rewrite broken | Check `/api/` rewrite before catch-all |
| Assets not loading | Wrong base path | Verify `base: '/'` in vite.config.js |
| Infinite redirect | Route misconfiguration | Check fallback route: `<Navigate to="/" replace />` |

---

## Verification Checklist

- [x] `vite.config.js`: `base: '/'` set
- [x] `vercel.json`: API rewrite before catch-all
- [x] `vercel.json`: HTML cache control added
- [x] React Router: BrowserRouter wraps app
- [x] React Router: Fallback route handles unknown paths
- [x] Build succeeds: `npm run build` ✓
- [x] No ESLint errors
- [ ] Deploy to Vercel and test `/clubs` with refresh
- [ ] Test all routes: `/clubs`, `/projects`, `/activity`, `/schedule`
- [ ] Test direct URL access: `https://your-app.vercel.app/clubs`

---

## References

- [Vite - Base URL Configuration](https://vitejs.dev/config/features.html#base)
- [Vercel - Rewrites Configuration](https://vercel.com/docs/edge-network/rewrites-and-redirects)
- [React Router - Basic Usage](https://reactrouter.com/docs/en/v6/start/installation)
- [SPA Routing Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/History_API)

---

**Status**: ✅ Ready for Production Deployment

**Last Updated**: 2025-12-02
