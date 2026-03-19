import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.origin + '/api/v1');
export const BASE_URL = API_BASE_URL ? API_BASE_URL.replace(/\/api\/v1\/?$/, '') : window.location.origin;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export const getPublicUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Check if it's a frontend asset (typically in /assets/ or /images/ or /models/)
    const isFrontendAsset = cleanPath.startsWith('/assets/') || 
                            cleanPath.startsWith('/images/') || 
                            cleanPath.startsWith('/models/');

    if (isFrontendAsset) {
        const viteBase = import.meta.env.BASE_URL || '/';
        const base = viteBase.endsWith('/') ? viteBase.slice(0, -1) : viteBase;
        return `${base}${cleanPath}`;
    }

    // Otherwise, assume it's a backend asset (like /uploads/...)
    // If BASE_URL is empty (relative API), it will naturally be relative to frontend
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
            // Simple generic redirect for now, keeping the current path for redirect back
            const currentPath = window.location.pathname;
            window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(error);
    }
);

export default api;
