import React from 'react';
import { Box, Button, Stack, Tooltip, Typography, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { sanitizeUrl, sanitizeFilename } from '../../../api/security';

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
        if (!blob) return;
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Use a strictly local check for the blob URL
        if (blobUrl && blobUrl.startsWith('blob:')) {
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = blobUrl;
            link.download = sanitizeFilename(filename);
            
            // Programmatically trigger download
            link.click();
            
            // Cleanup
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 300);
        }
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
            const safeUrl = sanitizeUrl(url);
            if (safeUrl !== 'about:blank') {
                const link = document.createElement('a');
                link.href = safeUrl;
                link.target = '_blank';
                link.download = `${sanitizeFilename(baseName || 'product')}-original.jpg`; 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
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
        <Box 
            sx={{ 
                mt: 2, 
                p: 2, 
                borderRadius: '24px', 
                background: 'rgba(255, 255, 255, 0.02)', 
                backdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
        >
            <Typography 
                variant="caption" 
                sx={{ 
                    display: 'block', 
                    mb: 1.5, 
                    color: 'rgba(255,255,255,0.4)', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontSize: '0.65rem'
                }}
            >
                {type === 'design' ? 'Production Quality Assets' : 'Customer Raw Assets'}
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap gap={1}>
                <Tooltip title="Neural Upscale + Intelligent Sharpness Enhancement">
                    <span>
                        <Button 
                            size="medium" 
                            variant="contained" 
                            startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon sx={{ fontSize: 18 }} />}
                            disabled={isProcessing}
                            onClick={() => handleAIUpscale(editedImageUrl || imageUrl, productSlug)}
                            sx={{ 
                                textTransform: 'none', 
                                fontSize: '0.8rem', 
                                fontWeight: 800,
                                borderRadius: '12px',
                                px: 2,
                                py: 1,
                                background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)',
                                boxShadow: '0 8px 16px rgba(108, 99, 255, 0.3)',
                                '&:hover': { 
                                    background: 'linear-gradient(135deg, #7C74FF 0%, #FF66AD 100%)',
                                    boxShadow: '0 12px 24px rgba(108, 99, 255, 0.4)',
                                    transform: 'translateY(-2px)'
                                },
                                '&:active': { transform: 'translateY(0)' },
                                '&.Mui-disabled': { opacity: 0.6, background: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            {isProcessing ? 'Enhancing...' : 'Download HD (AI Preview)'}
                        </Button>
                    </span>
                </Tooltip>

                {type === 'upload' && (
                    <Tooltip title="Download original customer-uploaded file">
                        <Button 
                            size="medium" 
                            variant="outlined" 
                            startIcon={<CloudDownloadIcon sx={{ fontSize: 18 }} />}
                            onClick={() => handleDownloadOriginal(imageUrl, productSlug)}
                            sx={{ 
                                textTransform: 'none', 
                                fontSize: '0.8rem', 
                                fontWeight: 700,
                                borderRadius: '12px',
                                px: 2,
                                py: 1,
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': { 
                                    borderColor: 'rgba(255, 255, 255, 0.3)', 
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    color: '#fff',
                                    transform: 'translateY(-2px)'
                                },
                                '&:active': { transform: 'translateY(0)' }
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
