import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const getPublicUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
};

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add a response interceptor to handle 401 errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Remove token to ensure clean state
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');
            // Redirect depending on if they are in admin panel or regular flow. 
            // Simple generic redirect for now.
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
