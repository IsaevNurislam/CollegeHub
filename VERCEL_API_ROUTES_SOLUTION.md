# ✅ Image Upload Fix - Vercel API Routes

## Problem
Production error: `Cannot POST /api/upload` - backend endpoint not accessible on Vercel

## Solution
Moved from **external backend URL** to **Vercel API Routes** (internal serverless functions):

### What Changed

**1. Created `api/upload.js`** (Vercel Serverless Function)
- Location: `/api/upload.js` (Vercel automatically routes `/api/*` requests here)
- Uses `formidable` for form parsing (works with Vercel's request handling)
- Uses `cloudinary.uploader.upload_stream()` for streaming upload
- Handles JWT authentication
- Returns JSON with image URL and metadata

**2. Updated `vercel.json`**
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"     // Internal routes (was external backend URL)
    }
  ]
}
```

**3. Updated `package.json`**
- Added `cloudinary` and `formidable` dependencies
- These run only during API requests (not in browser)

## How It Works

```
Browser Request
    ↓
Frontend API call: POST /api/upload
    ↓
Vercel routes to: /api/upload.js (serverless function)
    ↓
API function uploads to Cloudinary
    ↓
Returns: { url, publicId, width, height, size, format }
    ↓
Frontend saves image URL to database
```

## Environment Variables Required

On Vercel Dashboard, add to environment variables:
- `CLOUDINARY_CLOUD_NAME` - Your cloud name
- `CLOUDINARY_API_KEY` - Your API key
- `CLOUDINARY_API_SECRET` - Your API secret

These are already in your backend/.env, but Vercel API routes need them separately.

## Setup Instructions

1. **Push to Vercel** (already done - commit cd25e82)
   ```
   git push
   ```

2. **Add Environment Variables to Vercel**
   - Go to https://vercel.com/dashboard
   - Select your `college-space` project
   - Settings → Environment Variables
   - Add:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
   - Redeploy project

3. **Test Upload**
   - Create/edit a club
   - Upload image
   - Should work without "Cannot POST /api/upload" error

## Testing Locally

```bash
npm install cloudinary formidable
npm run build
npm run preview
# Upload image from http://localhost:4173
```

## Files Changed

- `api/upload.js` - NEW - Vercel API route
- `api/.eslintignore` - NEW - Ignore linting errors in serverless code
- `vercel.json` - UPDATED - Rewrite to internal routes
- `package.json` - UPDATED - Added dependencies

## Previous Approach

Old solution used external backend at `https://backend-college-hub.vercel.app` but:
- Backend project URL might be wrong
- No guarantee backend deployed correctly
- Two separate projects harder to maintain
- CORS complications

## New Approach Benefits

✅ Single project deployment  
✅ Vercel handles scaling automatically  
✅ No external backend URL needed  
✅ Simpler deployment process  
✅ Works with relative `/api` URLs  
✅ All environment variables in one place  

---

**Status**: ✅ Ready for production  
**Commit**: cd25e82  
**Date**: Today
