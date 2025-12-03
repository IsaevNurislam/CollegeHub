/**
 * Vercel API Route: Admin Database Reset
 * Endpoint: /api/admin-reset-db
 * 
 * This endpoint resets the admin database to fix password hash issues
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminToken } = req.body;
    const ADMIN_RESET_TOKEN = process.env.ADMIN_RESET_TOKEN || 'admin-reset-2025';

    if (!adminToken || adminToken !== ADMIN_RESET_TOKEN) {
      console.log('[Admin] Reset attempt with invalid token');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Since we can't directly manipulate SQLite on Vercel API Routes,
    // we need to call the actual backend server
    // Forward the request to the backend
    
    const backendUrl = process.env.BACKEND_URL || 'https://backend-college-hub.vercel.app';
    
    console.log('[Admin-Reset-API] Forwarding reset request to backend:', backendUrl);

    const response = await fetch(`${backendUrl}/api/admin/reset-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adminToken: ADMIN_RESET_TOKEN })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Admin-Reset-API] Backend error:', data);
      return res.status(response.status).json(data);
    }

    console.log('[Admin-Reset-API] ✅ Database reset successful');
    res.json(data);

  } catch (error) {
    console.error('[Admin-Reset-API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to reset database',
      details: error.message 
    });
  }
}
