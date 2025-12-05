/**
 * Vercel Serverless Function: Admin Login Proxy
 * Endpoint: /api/auth/login
 * 
 * This endpoint handles login with a hardcoded admin bypass.
 * It proxies to the backend but overrides the admin case.
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Login-Proxy-Version', 'v1-bypass');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentId, password, firstName, lastName } = req.body;
    
    console.log('[Login Proxy] Request received:', { studentId, hasPassword: !!password });

    // ADMIN BYPASS: If studentId is 000001 and password is Admin@2025, return success immediately
    const ADMIN_ID = '000001';
    const ADMIN_PASSWORD = 'Admin@2025';
    
    if (studentId === ADMIN_ID && password === ADMIN_PASSWORD) {
      console.log('[Login Proxy] ⚡ Admin bypass triggered - returning hardcoded success');
      
      // Generate a simple token (timestamp + admin marker)
      const timestamp = Date.now();
      const token = `admin.${timestamp}.bypass`;
      
      return res.status(200).json({
        token: token,
        user: {
          id: 1,
          studentId: ADMIN_ID,
          name: 'Админ Колледжа',
          role: 'Администратор',
          avatar: 'АК',
          isAdmin: true,
          joinedClubs: [],
          joinedProjects: []
        }
      });
    }

    // For non-admin users, proxy to the backend
    const backendUrl = 'https://backend-college-hub.vercel.app';
    
    console.log('[Login Proxy] Forwarding to backend:', backendUrl);

    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {  
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId, password, firstName, lastName })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Login Proxy] Backend error:', response.status, data);
      return res.status(response.status).json(data);
    }

    console.log('[Login Proxy] ✅ Backend login successful');
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('[Login Proxy] ❌ Error:', error);
    return res.status(500).json({ 
      error: 'Login service temporarily unavailable',
      details: error.message 
    });
  }
}
