import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/artexa.in/', // Updated to match new repository name
    server: {
        host: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                ws: true,
            },
            '/uploads': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            }
        }
    }
})