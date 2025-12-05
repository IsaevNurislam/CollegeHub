const API_BASE_URL = import.meta.env.VITE_API_URL?.trim?.() || '/api';
console.log('[ApiClient Init] VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('[ApiClient Init] Resolved API_BASE_URL:', API_BASE_URL);

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('[ApiClient] Initialized with baseURL:', this.baseURL);
  }

  getToken() {
    const token = localStorage.getItem('authToken');
    // Ensure we never return "N/A" or "null" strings as valid tokens
    if (!token || token === 'N/A' || token === 'null' || token === 'undefined') {
      return null;
    }
    return token;
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken() {
    localStorage.removeItem('authToken');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      // Only add Authorization if we have a valid token
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      console.log('[ApiClient] Sending request...');
      console.log('[ApiClient] URL:', `${this.baseURL}${endpoint}`);
      console.log('[ApiClient] Method:', options.method);
      console.log('[ApiClient] Headers:', {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers.Authorization ? '(Bearer token present)' : '(NONE - not included in request)'
      });
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      console.log('[ApiClient] Response received');
      console.log('[ApiClient] Status:', response.status, response.statusText);
      console.log('[ApiClient] Headers:', Object.fromEntries(response.headers));

      const text = await response.text();
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const parseJson = () => {
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      };

      if (!response.ok) {
        console.warn('[ApiClient] ❌ Response not OK (status:', response.status + ')');
        
        // ⚠️ IMPORTANT: Do NOT auto-reload on 401
        // Let the frontend handle it gracefully
        if (response.status === 401) {
          console.warn('[ApiClient] Unauthorized (401) - token cleared, frontend will handle');
          this.clearToken();
        }
        
        const errorBody = parseJson();
        const message = (isJson && errorBody)
          ? errorBody.error || errorBody.message || JSON.stringify(errorBody)
          : text || `API Error: ${response.statusText}`;
        
        console.error('[ApiClient] Error message:', message);
        throw new Error(message);
      }

      if (!text) {
        console.log('[ApiClient] ✓ Empty response (OK)');
        return null;
      }
      
      const result = isJson ? JSON.parse(text) : text;
      console.log('[ApiClient] ✓ Response parsed successfully');
      console.log('[ApiClient] Response data:', result);
      
      return result;
    } catch (error) {
      console.error('[ApiClient] ❌ Request failed:', error.message);
      console.error('[ApiClient] Stack:', error.stack);
      throw error;
    }
  }

  async get(endpoint) {
    console.log('[ApiClient] GET request:', `${this.baseURL}${endpoint}`);
    const result = await this.request(endpoint, { method: 'GET' });
    console.log('[ApiClient] GET response:', result);
    return result;
  }

  post(endpoint, data) {
    console.log('\n[ApiClient] ═══════════════════════════════════════════');
    console.log('[ApiClient] POST Request:', endpoint);
    console.log('[ApiClient] Endpoint:', `${this.baseURL}${endpoint}`);
    console.log('[ApiClient] Request Body:', data);
    console.log('[ApiClient] Content-Type:', 'application/json');
    console.log('[ApiClient] ═══════════════════════════════════════════');
    
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

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

      console.log('[ApiClient] Upload response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Unauthorized - please login again');
        }
        
        let errorMsg = `Upload failed: ${response.statusText}`;
        let errorDetails = '';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            console.error('[ApiClient] Backend error response:', errorData);
            errorMsg = errorData.error || errorData.message || errorMsg;
            errorDetails = errorData.details || '';
          } else {
            const text = await response.text();
            console.error('[ApiClient] Backend error text:', text);
            errorMsg = text || errorMsg;
          }
        } catch (parseError) {
          console.error('[ApiClient] Error parsing response:', parseError);
        }
        
        const fullError = errorDetails ? `${errorMsg} (${errorDetails})` : errorMsg;
        console.error('[ApiClient] Full error:', fullError);
        throw new Error(fullError);
      }

      const result = await response.json();
      console.log('[ApiClient] Upload success:', result);
      return result;
    } catch (error) {
      console.error('[ApiClient] Upload error:', error.message);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
