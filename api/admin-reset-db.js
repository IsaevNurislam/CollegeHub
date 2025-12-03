/**
 * Vercel API Route: Admin Database Reset
 * Endpoint: /api/admin-reset-db
 * 
 * This endpoint resets the admin database to fix password hash issues
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminToken } = req.body;
    const ADMIN_RESET_TOKEN = process.env.ADMIN_RESET_TOKEN || 'admin-reset-2025';

    if (!adminToken || adminToken !== ADMIN_RESET_TOKEN) {
      console.log('[Admin-Reset-API] Reset attempt with invalid token');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const backendUrl = process.env.BACKEND_URL || 'https://backend-college-hub.vercel.app';
    
    console.log('[Admin-Reset-API] Forwarding to backend:', backendUrl);

    const response = await fetch(`${backendUrl}/api/admin/reset-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adminToken: ADMIN_RESET_TOKEN })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Admin-Reset-API] Backend error:', response.status, data);
      return res.status(response.status).json(data);
    }

    console.log('[Admin-Reset-API] ✅ Database reset successful');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);

  } catch (error) {
    console.error('[Admin-Reset-API] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to reset database',
      details: error.message 
    });
  }
}
