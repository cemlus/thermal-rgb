import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  signup: async (email: string, password: string) => {
    const response = await api.post('/api/auth/signup', { email, password });
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Conversion API functions
export const conversionApi = {
  thermalToRgb: async (file: File): Promise<Blob> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    
    return response.data;
  },
  
  rgbToThermal: async (file: File): Promise<Blob> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/rgb-to-thermal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    
    return response.data;
  },
};

export default api;
