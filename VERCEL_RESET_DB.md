# 🔄 How to Reset Admin Password on Vercel

## Problem
Vercel is using old database with incorrect admin password hash (`admin123` instead of `Admin@2025`).

## Solution

After code is deployed, you need to reset the Vercel database. Use the admin reset endpoint:

### Option 1: Using cURL

```bash
curl -X POST \
  https://college-space-<YOUR_VERCEL_DOMAIN>.vercel.app/api/admin/reset-db \
  -H "Content-Type: application/json" \
  -d '{"adminToken":"admin-reset-2025"}'
```

### Option 2: Using Node.js Script

```bash
# Create this file and run it
node vercel-reset-db.js
```

### Option 3: From Browser Console

```javascript
fetch('https://college-space-<YOUR_VERCEL_DOMAIN>.vercel.app/api/admin/reset-db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ adminToken: 'admin-reset-2025' })
})
.then(r => r.json())
.then(data => console.log(data))
```

## After Reset

Then login with:
- **studentId:** `000001`
- **password:** `Admin@2025`

## Steps

1. Wait for Vercel to build and deploy (usually 2-3 minutes)
2. Execute the reset endpoint call above
3. You should get: `{ "success": true, "message": "Database reset and reseeded successfully" }`
4. Test login on https://college-space-<YOUR_VERCEL_DOMAIN>.vercel.app

---

**Note:** The ADMIN_RESET_TOKEN must match exactly. Default is `admin-reset-2025`.

You can also set a custom token via environment variable `ADMIN_RESET_TOKEN` in Vercel.
