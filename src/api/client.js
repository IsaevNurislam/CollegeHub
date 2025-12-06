const API_BASE_URL = import.meta.env.VITE_API_URL?.trim?.() || '/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getToken() {
    const token = localStorage.getItem('authToken');
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
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

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
      if (response.status === 401) {
        this.clearToken();
      }

      const errorBody = parseJson();
      let message = isJson && errorBody
        ? errorBody.error || errorBody.message || JSON.stringify(errorBody)
        : text || `API Error: ${response.statusText}`;

      // Добавляем статус код для лучшей обработки
      if (response.status === 404) {
        message = message || 'User not found';
      }

      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    if (!text) {
      return null;
    }

    return isJson ? JSON.parse(text) : text;
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
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

    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

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

      let errorMessage = `Upload failed: ${response.statusText}`;

      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          if (errorData.details) {
            errorMessage = `${errorMessage} (${errorData.details})`;
          }
        } else {
          const text = await response.text();
          if (text) errorMessage = text;
        }
      } catch {
        // Keep default error message
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
