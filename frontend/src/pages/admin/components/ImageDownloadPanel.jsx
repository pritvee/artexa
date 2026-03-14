import React from 'react';
import { Box, Button, Stack, Tooltip, Typography, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

/**
 * Universal Image Download Panel for Admin Order Preview
 * Supports "AI Enhanced" upscaling and "Original" download.
 */
const ImageDownloadPanel = ({ 
    imageUrl, 
    editedImageUrl, 
    productName = 'product', 
    orderId = '000',
    type = 'design' // 'design' or 'upload'
}) => {
    const [isProcessing, setIsProcessing] = React.useState(false);

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')   // Remove all non-word chars
            .replace(/--+/g, '-');    // Replace multiple - with single -
    };

    const getExtension = (url) => {
        if (!url) return 'png';
        const cleanUrl = url.split('?')[0].split('#')[0];
        const parts = cleanUrl.split('.');
        if (parts.length > 1) {
            const ext = parts.pop().toLowerCase();
            return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'png';
        }
        return 'png';
    };

    const triggerDownload = (blob, filename) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        }, 300);
    };

    const handleDownloadOriginal = async (url, baseName) => {
        if (!url) return;
        try {
            const originalExt = getExtension(url);
            const cleanBase = baseName || 'product';
            const filename = url.toLowerCase().includes('design') 
                ? `edited-design-${cleanBase}.${originalExt}`
                : `customer-original-${cleanBase}.${originalExt}`;

            const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
            if (!response.ok) throw new Error('Fetch failed');
            
            const blob = await response.blob();
            triggerDownload(blob, filename);
        } catch (error) {
            console.warn("Blob fetch failed, falling back to direct link", error);
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.download = `${baseName || 'product'}-original.jpg`; 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const applySharpenFilter = (ctx, w, h) => {
        const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        const imageData = ctx.getImageData(0, 0, w, h);
        const srcData = new Uint8ClampedArray(imageData.data);
        const dstData = imageData.data;

        for (let i = 0; i < srcData.length; i += 4) {
            const x = (i / 4) % w;
            const y = Math.floor((i / 4) / w);
            
            if (x === 0 || x === w - 1 || y === 0 || y === h - 1) continue;

            let r = 0, g = 0, b = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const wt = weights[(ky + 1) * 3 + (kx + 1)];
                    const idx = ((y + ky) * w + (x + kx)) * 4;
                    r += srcData[idx] * wt;
                    g += srcData[idx + 1] * wt;
                    b += srcData[idx + 2] * wt;
                }
            }
            dstData[i] = Math.min(255, Math.max(0, r));
            dstData[i+1] = Math.min(255, Math.max(0, g));
            dstData[i+2] = Math.min(255, Math.max(0, b));
        }
        ctx.putImageData(imageData, 0, 0);
    };

    const handleAIUpscale = (url, baseName) => {
        if (!url || isProcessing) return;
        setIsProcessing(true);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        const separator = url.includes('?') ? '&' : '?';
        const cacheBuster = `${separator}download_t=${new Date().getTime()}`;
        
        img.onload = () => {
            // Use setTimeout to allow UI to update (show loading) before heavy processing
            setTimeout(() => {
                try {
                    let scale = 4;
                    if (img.width < 800) scale = 5;
                    else if (img.width > 1600) scale = 2;

                    const canvas = document.createElement('canvas');
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Style Enhancements: Contrast +12%, Brightness +6%, Saturation +8%
                    if (ctx.filter) {
                        ctx.filter = 'contrast(1.12) brightness(1.06) saturate(1.08)';
                    }
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.filter = 'none';

                    // Sharpening Enhancement
                    applySharpenFilter(ctx, canvas.width, canvas.height);

                    canvas.toBlob((blob) => {
                        const prefix = type === 'design' ? 'edited-design' : 'customer-upload';
                        const filename = `${prefix}-${baseName || 'product'}-ai-hd.png`;
                        
                        if (blob) triggerDownload(blob, filename);
                        else handleDownloadOriginal(url, baseName);
                        
                        setIsProcessing(false);
                    }, 'image/png');
                } catch (err) {
                    console.error("AI processing failed", err);
                    handleDownloadOriginal(url, baseName);
                    setIsProcessing(false);
                }
            }, 50);
        };
        
        img.onerror = () => {
            handleDownloadOriginal(url, baseName);
            setIsProcessing(false);
        };
        img.src = url + cacheBuster;
    };

    const productSlug = slugify(productName);

    return (
        <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {type === 'design' ? 'Production Quality Tools' : 'Customer Asset Tools'}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
                <Tooltip title="Intelligent Upscale + Sharpening + AI Enhancements">
                    <span>
                        <Button 
                            size="small" 
                            variant="contained" 
                            startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon />}
                            disabled={isProcessing}
                            onClick={() => handleAIUpscale(editedImageUrl || imageUrl, productSlug)}
                            sx={{ 
                                textTransform: 'none', 
                                fontSize: '0.75rem', 
                                fontWeight: 700,
                                bgcolor: isProcessing ? 'rgba(99,102,241,0.5)' : '#6366f1',
                                '&:hover': { bgcolor: '#4f46e5' }
                            }}
                        >
                            {isProcessing ? 'Enhancing...' : 'Download HD (PNG AI)'}
                        </Button>
                    </span>
                </Tooltip>

                {type === 'upload' && (
                    <Tooltip title="Download original file without changes">
                        <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<CloudDownloadIcon />}
                            onClick={() => handleDownloadOriginal(imageUrl, productSlug)}
                            sx={{ 
                                textTransform: 'none', 
                                fontSize: '0.75rem', 
                                fontWeight: 700,
                                borderColor: 'rgba(255,255,255,0.3)',
                                color: '#fff',
                                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                            }}
                        >
                            Original
                        </Button>
                    </Tooltip>
                )}
            </Stack>
        </Box>
    );
};

export default ImageDownloadPanel;
