import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Box, Typography, Button, Slider, Stack, Divider,
    CircularProgress, Chip, Tooltip, Paper, IconButton,
    ToggleButtonGroup, ToggleButton
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TuneIcon from '@mui/icons-material/Tune';
import CompareIcon from '@mui/icons-material/Compare';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

/* ─── Defaults ─── */
const DEFAULT_ADJ = { brightness: 100, contrast: 100, saturation: 100, sharpness: 0, clarity: 0 };
const AUTO_PRESET = { brightness: 108, contrast: 115, saturation: 112, sharpness: 55, clarity: 40 };

/* ─── Core Image Processing ─── */
const applyUnsharpMask = (ctx, w, h, amount) => {
    try {
        // Unsharp mask: sharpen = original + amount*(original - blur)
        const original = ctx.getImageData(0, 0, w, h);
        if (!original) return;
        const origData = original.data;

        // Simple box blur (3x3 kernel)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w; tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.filter = `blur(${1 + amount * 1.5}px)`;
        tempCtx.drawImage(ctx.canvas, 0, 0);
        const blurData = tempCtx.getImageData(0, 0, w, h).data;

        const result = ctx.createImageData(w, h);
        const resultData = result.data;

        for (let i = 0, len = origData.length; i < len; i += 4) {
            resultData[i] = Math.max(0, Math.min(255, origData[i] + amount * (origData[i] - blurData[i])));
            resultData[i + 1] = Math.max(0, Math.min(255, origData[i+1] + amount * (origData[i+1] - blurData[i+1])));
            resultData[i + 2] = Math.max(0, Math.min(255, origData[i+2] + amount * (origData[i+2] - blurData[i+2])));
            resultData[i + 3] = origData[i + 3];
        }
        ctx.putImageData(result, 0, 0);
    } catch (e) {
        console.warn("Unsharp mask failed:", e);
    }
};

const applyClarity = (ctx, w, h, amount) => {
    try {
        // Local contrast enhancement (mid-tone sharpening)
        const original = ctx.getImageData(0, 0, w, h);
        if (!original) return;
        const origData = original.data;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w; tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.filter = `blur(${3 + amount * 4}px)`;
        tempCtx.drawImage(ctx.canvas, 0, 0);
        const blurData = tempCtx.getImageData(0, 0, w, h).data;

        const result = ctx.createImageData(w, h);
        const resultData = result.data;

        for (let i = 0, len = origData.length; i < len; i += 4) {
            const oR = origData[i];
            const midtoneFactor = 1 - Math.abs(oR - 128) / 128;
            const diff = amount * midtoneFactor * 0.5;

            resultData[i] = Math.max(0, Math.min(255, oR + diff * (oR - blurData[i])));
            resultData[i + 1] = Math.max(0, Math.min(255, origData[i+1] + diff * (origData[i+1] - blurData[i+1])));
            resultData[i + 2] = Math.max(0, Math.min(255, origData[i+2] + diff * (origData[i+2] - blurData[i+2])));
            resultData[i + 3] = origData[i + 3];
        }
        ctx.putImageData(result, 0, 0);
    } catch (e) {
        console.warn("Clarity filter failed:", e);
    }
};

const processImageWithAdj = (imgEl, adj, upscale = false) => {
    try {
        // Guard: image must be fully loaded with real dimensions
        if (!imgEl || !imgEl.naturalWidth || !imgEl.naturalHeight) {
            return imgEl?.src || null;
        }

        const scale = upscale ? 2 : 1;
        let targetW = imgEl.naturalWidth * scale;
        let targetH = imgEl.naturalHeight * scale;

        // Safety check: Limit max dimensions to prevent crash on large canvases
        const MAX_DIM = 1200; // Chrome/Common memory limit for heavy operations
        if (targetW > MAX_DIM || targetH > MAX_DIM) {
            const ratio = Math.min(MAX_DIM / targetW, MAX_DIM / targetH);
            targetW = Math.max(1, Math.round(targetW * ratio));
            targetH = Math.max(1, Math.round(targetH * ratio));
        }

        // Final guard: avoid 0-dimension canvas
        if (targetW < 1 || targetH < 1) return imgEl.src;

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error("missing canvas context");

        // Step 1: Apply CSS filters for brightness/contrast/saturation
        ctx.filter = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%)`;
        ctx.drawImage(imgEl, 0, 0, targetW, targetH);
        ctx.filter = 'none';

        // Step 2: Apply sharpness
        if (adj.sharpness > 0) {
            applyUnsharpMask(ctx, targetW, targetH, adj.sharpness / 100);
        }

        // Step 3: Apply clarity
        if (adj.clarity > 0) {
            applyClarity(ctx, targetW, targetH, adj.clarity / 100);
        }

        // Final check if canvas became invalid
        const finalData = canvas.toDataURL('image/jpeg', 0.85);
        if (!finalData || finalData === 'data:,' || finalData === 'data:image/jpeg;base64,') {
            console.error('toDataURL failed to produce an image.');
            return imgEl?.src || null;
        }
        return finalData;
    } catch (e) {
        console.error('Image processing error:', e);
        return imgEl?.src || null;
    }
};

/* ─── Main Component ─── */
const ImageEnhancerPanel = ({ originalImageSrc, onEnhancedImage, isUpscaled, onUpscaleChange }) => {
    const [adj, setAdj] = useState(DEFAULT_ADJ);
    const [processing, setProcessing] = useState(false);
    const [showBefore, setShowBefore] = useState(false);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [enhanced, setEnhanced] = useState(false);
    const [upscaledFlag, setUpscaledFlag] = useState(false);
    const [showManual, setShowManual] = useState(false); // Collapsible manual controls
    const imgRef = useRef(null);

    // Reset when image changes
    useEffect(() => {
        setAdj(DEFAULT_ADJ);
        setPreviewSrc(null);
        setEnhanced(false);
        setUpscaledFlag(false);
    }, [originalImageSrc]);

    const loadImg = useCallback(() => new Promise((resolve, reject) => {
        if (!originalImageSrc) return reject(new Error('no src'));
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = originalImageSrc;
    }), [originalImageSrc]);

    const runProcess = useCallback((adjOverride, doUpscale = false) => {
        setProcessing(true);
        // Use setTimeout(0) to yield to the browser so the spinner renders before heavy work
        setTimeout(async () => {
            try {
                const img = await loadImg();
                const result = processImageWithAdj(img, adjOverride || adj, doUpscale);
                if (result) {
                    setPreviewSrc(result);
                    onEnhancedImage(result);
                    setEnhanced(true);
                    setUpscaledFlag(doUpscale);
                    if (onUpscaleChange) onUpscaleChange(doUpscale);
                }
            } catch (e) {
                console.error('Enhancement failed', e);
            } finally {
                setProcessing(false);
            }
        }, 50);
    }, [adj, loadImg, onEnhancedImage, onUpscaleChange]);

    const handleSliderChange = (key, val) => {
        const newAdj = { ...adj, [key]: val };
        setAdj(newAdj);
    };

    const handleApplyAdjustments = () => runProcess(adj, upscaledFlag);
    const handleAutoEnhance = () => {
        setAdj(AUTO_PRESET);
        runProcess(AUTO_PRESET, false);
    };
    const handleAIUpscale = () => runProcess(adj, true);
    const handleEnhanceAndUpscale = () => {
        setAdj(AUTO_PRESET);
        runProcess(AUTO_PRESET, true);
    };
    const handleReset = () => {
        setAdj(DEFAULT_ADJ);
        setPreviewSrc(null);
        setEnhanced(false);
        setUpscaledFlag(false);
        onEnhancedImage(originalImageSrc);
        if (onUpscaleChange) onUpscaleChange(false);
    };

    if (!originalImageSrc) return null;

    const displaySrc = showBefore ? originalImageSrc : (previewSrc || originalImageSrc);

    return (
        <Box sx={{ mt: 1 }}>
            <Paper elevation={0} sx={{ bgcolor: 'rgba(102,126,234,0.05)', border: '1px solid rgba(102,126,234,0.15)', borderRadius: 2, p: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <AutoFixHighIcon sx={{ color: '#667eea', fontSize: 18 }} />
                        <Typography variant="caption" fontWeight="bold" color="primary">AI Enhancement</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        {enhanced && (
                            <Chip
                                label={upscaledFlag ? '2× HD' : 'Enhanced'}
                                size="small"
                                sx={{ bgcolor: 'primary.main', color: '#fff', fontSize: '8px', height: 16 }}
                            />
                        )}
                        {enhanced && (
                            <IconButton size="small" onClick={handleReset} sx={{ p: 0.2, '&:hover': { color: 'error.main' } }}>
                                <RestartAltIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        )}
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    {/* Left Side: Compact Controls */}
                    <Stack spacing={0.8} sx={{ flex: 1 }}>
                        <Button
                            variant="contained" size="small" fullWidth
                            disabled={processing}
                            onClick={handleAutoEnhance}
                            sx={{ bgcolor: '#667eea', fontSize: '9px', py: 0.4, minWidth: 0 }}
                        >
                            Auto
                        </Button>
                        <Button
                            variant="outlined" size="small" fullWidth
                            disabled={processing}
                            onClick={handleAIUpscale}
                            sx={{ borderColor: '#667eea', color: '#667eea', fontSize: '9px', py: 0.4, minWidth: 0 }}
                        >
                            2× HD
                        </Button>
                        <Button
                            variant="contained" size="small" fullWidth
                            disabled={processing}
                            onClick={handleEnhanceAndUpscale}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                fontSize: '9px', py: 0.8, lineHeight: 1.1, minWidth: 0
                            }}
                        >
                            Best Quality
                        </Button>

                        <Box 
                            onClick={() => setShowManual(!showManual)}
                            sx={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                cursor: 'pointer', py: 0.5, mt: 0.5, borderRadius: 1, border: '1px solid rgba(0,0,0,0.05)',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <TuneIcon sx={{ fontSize: 10, mr: 0.3, color: 'text.secondary' }} />
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '9px' }}>
                                {showManual ? 'Hide' : 'Manual'}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Right Side: Vertical Image Preview */}
                    <Box sx={{ position: 'relative' }}>
                        <Box sx={{
                            width: 90, height: 120, borderRadius: 1.2, overflow: 'hidden',
                            bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                            onMouseDown={() => setShowBefore(true)}
                            onMouseUp={() => setShowBefore(false)}
                            onMouseLeave={() => setShowBefore(false)}
                            onTouchStart={() => setShowBefore(true)}
                            onTouchEnd={() => setShowBefore(false)}
                        >
                            <img
                                src={displaySrc}
                                alt="preview"
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', imageRendering: upscaledFlag ? 'crisp-edges' : 'auto' }}
                            />
                            {processing && (
                                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress size={16} thickness={5} sx={{ color: '#667eea' }} />
                                </Box>
                            )}
                            <Box sx={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
                                <Typography sx={{ fontSize: '7px', fontWeight: 'bold', letterSpacing: 0.5, py: 0.1, bgcolor: 'rgba(0,0,0,0.7)', color: showBefore ? '#ff9800' : '#fff', textTransform: 'uppercase' }}>
                                    {showBefore ? 'Original' : 'Hold'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Stack>

                {showManual && (
                    <Box sx={{ mt: 1 }}>
                        <Stack spacing={1}>
                            {[
                                { key: 'brightness', label: 'Brightness', min: 50, max: 150 },
                                { key: 'contrast', label: 'Contrast', min: 50, max: 200 },
                                { key: 'saturation', label: 'Saturation', min: 0, max: 200 },
                                { key: 'sharpness', label: 'Sharpness', min: 0, max: 100 },
                                { key: 'clarity', label: 'Clarity', min: 0, max: 100 },
                            ].map(({ key, label, min, max }) => (
                                <Box key={key} sx={{ mb: 0.5 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '10px' }}>{label}</Typography>
                                        <Typography variant="caption" color="primary" sx={{ fontSize: '10px', fontWeight: 'bold' }}>{adj[key]}</Typography>
                                    </Stack>
                                    <Slider
                                        size="small"
                                        value={adj[key]}
                                        min={min} max={max}
                                        onChange={(_, v) => handleSliderChange(key, v)}
                                        sx={{ py: 0.2, color: '#667eea' }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                        <Button
                            variant="outlined" size="small" fullWidth
                            disabled={processing}
                            onClick={handleApplyAdjustments}
                            sx={{ mt: 1, borderColor: '#667eea', color: '#667eea', fontSize: '10px', py: 0.3 }}
                        >
                            Apply
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ImageEnhancerPanel;
