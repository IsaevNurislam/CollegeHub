# Vercel Deployment & Environment Variables Guide

## Problem
Frontend data is being fetched from API but not displayed in UI on Vercel production. The issue is that `VITE_API_URL` environment variable is not properly set during Vercel deployment.

## Solution

### Step 1: Add Environment Variable in Vercel Dashboard

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Create a new environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://backend-college-hub.vercel.app`
   - **Select environments**: Check "Production"
   - Click **Add**

### Step 2: Trigger a Rebuild

After adding the environment variable:
1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **...** menu and select **Redeploy**
4. Wait for deployment to complete

### Alternative: Update vercel.json

If you want to hardcode this in version control, update `vercel.json`:

```json
{
  "env": {
    "VITE_API_URL": "https://backend-college-hub.vercel.app"
  }
}
```

However, this is NOT recommended for production URLs that may change.

## How It Works

1. **Build Time**: When Vercel builds the frontend, it reads `VITE_API_URL` from environment variables
2. **Vite Processing**: The `vite build` command replaces `import.meta.env.VITE_API_URL` with the actual value
3. **At Runtime**: The JavaScript has the hardcoded backend URL baked in

## Verification

To verify the environment variable is set correctly:

1. Deploy your app
2. Open browser DevTools → Console
3. You should see logs like:
   ```
   [ApiClient] Initialized with baseURL: https://backend-college-hub.vercel.app
   ```
4. Check Network tab for requests to `https://backend-college-hub.vercel.app/api/*`

## Troubleshooting

If data still doesn't display:

1. **Check CORS**: Ensure backend CORS configuration allows your Vercel frontend origin
   - Your frontend URL will be something like `https://college-space-*.vercel.app`
   - Backend must allow this origin in CORS configuration

2. **Check Response Format**: Backend `/api/clubs` endpoint should return an array, not wrapped object
   - ✅ Correct: `[{id: 1, name: "Club1"}, ...]`
   - ❌ Wrong: `{data: [{id: 1, name: "Club1"}, ...]}`

3. **Check Browser Console**:
   - Look for any error messages or failed XHR requests
   - Check the actual response data structure

4. **Check Backend Logs**:
   - Ensure backend is receiving requests
   - Ensure database is initialized with clubs data
