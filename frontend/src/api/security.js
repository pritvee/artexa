/**
 * Security utilities for the frontend.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes a URL to prevent XSS (javascript: attacks).
 * This implementation uses a strict allow-list of safe protocols (http, https, mailto, tel, blob)
 * and safe data:image/ base64 URLs.
 * @param {string} url - The URL to sanitize.
 * @param {string} defaultValue - The fallback URL if the input is unsafe.
 * @returns {string} - The sanitized URL.
 */
export const sanitizeUrl = (url, defaultValue = 'about:blank') => {
    if (!url || typeof url !== 'string') return defaultValue;
    
    const cleanUrl = url.trim();
    if (!cleanUrl) return defaultValue;

    // Use DOMPurify to sanitize the URL string
    const sanitized = DOMPurify.sanitize(cleanUrl, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    
    // Check for safe protocols: http, https, mailto, tel, blob, data (images only), or relative paths
    const safeProtocolMatch = /^(https?|mailto|tel|blob|#|\/)/i.test(sanitized);
    
    if (safeProtocolMatch) {
        return sanitized;
    }

    // Special check for safe data:image types
    if (/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/i.test(sanitized)) {
        return sanitized;
    }

    // Check for relative paths starting with .
    if (sanitized.startsWith('./') || sanitized.startsWith('../')) {
        return sanitized;
    }
    
    return defaultValue;
};

/**
 * Sanitizes a filename to prevent path traversal or other issues.
 */
export const sanitizeFilename = (filename) => {
    if (!filename) return 'download.png';
    return filename.replace(/[^a-z0-9._-]/gi, '_');
};
