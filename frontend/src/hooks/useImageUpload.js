/**
 * useImageUpload
 * 
 * A hook that provides instant local image preview via object URLs
 * while uploading to the backend in the background.
 *
 * Key guarantees:
 * - Image appears on canvas INSTANTLY (no CORS issue, no server round-trip wait)
 * - Server URL is returned asynchronously for persistence / cart saving
 * - Object URLs are revoked on unmount to avoid memory leaks
 * - Falls back gracefully if backend upload fails (keeps local blob URL)
 */
import { useRef, useCallback, useEffect } from 'react';
import api from '../api/axios';

/**
 * @param {Object} options
 * @param {function} options.onLocalUrl   - Called immediately with blob URL (for canvas display)
 * @param {function} options.onServerUrl  - Called with { url, id } once backend responds
 * @param {function} options.onError      - Called with error string on upload failure
 * @param {function} options.onUploading  - Called with boolean when upload state changes
 * @param {string}   options.endpoint     - Backend endpoint (default: '/products/upload-customization')
 */
export function useImageUpload({
    onLocalUrl,
    onServerUrl,
    onError,
    onUploading,
    endpoint = '/products/upload-customization'
} = {}) {
    const objectUrlsRef = useRef([]);

    // Cleanup: revoke all created object URLs on unmount
    useEffect(() => {
        const urls = objectUrlsRef.current;
        return () => {
            urls.forEach(url => {
                try { URL.revokeObjectURL(url); } catch (_) { /* ignore */ }
            });
        };
    }, []);

    const upload = useCallback(async (file) => {
        if (!file) return;

        // 1. Create instant local preview
        const localUrl = URL.createObjectURL(file);
        objectUrlsRef.current.push(localUrl);
        onLocalUrl?.(localUrl);

        // 2. Upload to backend in background
        onUploading?.(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post(endpoint, formData);
            const serverUrl = res.data.image_url || res.data.url;
            onServerUrl?.({ localUrl, serverUrl, id: res.data.id });
        } catch (err) {
            console.error('[useImageUpload] Backend upload failed:', err);
            onError?.('Upload failed. Your image is shown locally but may not be saved.');
            // Intentionally NOT removing local preview – user still sees their image
        } finally {
            onUploading?.(false);
        }

        return localUrl;
    }, [endpoint, onLocalUrl, onServerUrl, onError, onUploading]);

    return { upload };
}

export default useImageUpload;
