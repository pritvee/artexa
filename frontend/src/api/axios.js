import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
});

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
