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
import { sanitizeUrl } from '../../../api/security';

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
        <Box sx={{ mt: 2 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '24px', 
                    p: 2.5,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ p: 0.8, borderRadius: '10px', bgcolor: 'rgba(108, 99, 255, 0.1)', display: 'flex' }}>
                            <AutoFixHighIcon sx={{ color: '#6C63FF', fontSize: 20 }} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
                            AI ENHANCER
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {enhanced && (
                            <Chip
                                label={upscaledFlag ? '2× HD ACTIVE' : 'ENHANCED'}
                                size="small"
                                sx={{ 
                                    background: 'linear-gradient(135deg, #6C63FF, #FF4D9D)', 
                                    color: '#fff', 
                                    fontSize: '9px', 
                                    fontWeight: 900,
                                    height: 20,
                                    px: 0.5
                                }}
                            />
                        )}
                        {enhanced && (
                            <IconButton 
                                size="small" 
                                onClick={handleReset} 
                                sx={{ 
                                    color: 'rgba(255,255,255,0.4)',
                                    '&:hover': { color: '#FF4D4D', bgcolor: 'rgba(255,77,77,0.1)' } 
                                }}
                            >
                                <RestartAltIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        )}
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={2.5} alignItems="flex-start">
                    {/* Left Side: Compact Controls */}
                    <Stack spacing={1.2} sx={{ flex: 1 }}>
                        <Button
                            variant="contained" 
                            size="small" 
                            fullWidth
                            disabled={processing}
                            onClick={handleAutoEnhance}
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '10px', 
                                py: 0.8,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' }
                            }}
                        >
                            Auto Balance
                        </Button>
                        <Button
                            variant="outlined" 
                            size="small" 
                            fullWidth
                            disabled={processing}
                            onClick={handleAIUpscale}
                            sx={{ 
                                borderColor: 'rgba(108, 99, 255, 0.4)', 
                                color: '#6C63FF', 
                                fontWeight: 700,
                                fontSize: '10px', 
                                py: 0.8,
                                '&:hover': { borderColor: '#6C63FF', bgcolor: 'rgba(108, 99, 255, 0.05)' }
                            }}
                        >
                            2× HD Upscale
                        </Button>
                        <Button
                            variant="contained" 
                            size="small" 
                            fullWidth
                            disabled={processing}
                            onClick={handleEnhanceAndUpscale}
                            sx={{
                                background: 'linear-gradient(135deg, #6C63FF, #FF4D9D)',
                                fontSize: '11px', 
                                fontWeight: 900,
                                py: 1.2, 
                                boxShadow: '0 8px 16px rgba(108, 99, 255, 0.3)',
                                '&:hover': { 
                                    background: 'linear-gradient(135deg, #7C74FF, #FF66AD)',
                                    boxShadow: '0 12px 24px rgba(108, 99, 255, 0.4)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Best Quality AI
                        </Button>

                        <Box 
                            onClick={() => setShowManual(!showManual)}
                            sx={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                cursor: 'pointer', py: 0.8, mt: 1, borderRadius: '12px', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                bgcolor: 'rgba(255,255,255,0.02)',
                                transition: 'all 0.3s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }
                            }}
                        >
                            <TuneIcon sx={{ fontSize: 14, mr: 0.8, color: 'rgba(255,255,255,0.6)' }} />
                            <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                                {showManual ? 'HIDE MANUAL' : 'MANUAL TUNE'}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Right Side: Vertical Image Preview */}
                    <Box sx={{ position: 'relative' }}>
                        <Box sx={{
                            width: 110, height: 140, borderRadius: '16px', overflow: 'hidden',
                            bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'scale(1.02)' }
                        }}
                            onMouseDown={() => setShowBefore(true)}
                            onMouseUp={() => setShowBefore(false)}
                            onMouseLeave={() => setShowBefore(false)}
                            onTouchStart={() => setShowBefore(true)}
                            onTouchEnd={() => setShowBefore(false)}
                        >
                                {(() => {
                                    const safeEnhancementPreview = sanitizeUrl(displaySrc);
                                    return (
                                        <img
                                            src={safeEnhancementPreview}
                                            alt="preview"
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', imageRendering: upscaledFlag ? 'crisp-edges' : 'auto' }}
                                        />
                                    );
                                })()}
                            {processing && (
                                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress size={24} thickness={5} sx={{ color: '#6C63FF' }} />
                                </Box>
                            )}
                            <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
                                <Typography sx={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.05em', py: 0.5, bgcolor: showBefore ? 'rgba(255,152,0,0.9)' : 'rgba(0,0,0,0.7)', color: '#fff', textTransform: 'uppercase' }}>
                                    {showBefore ? 'ORIGINAL' : 'HOLD TO COMPARE'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Stack>

                {showManual && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Stack spacing={2}>
                            {[
                                { key: 'brightness', label: 'Brightness', min: 50, max: 150 },
                                { key: 'contrast', label: 'Contrast', min: 50, max: 200 },
                                { key: 'saturation', label: 'Saturation', min: 0, max: 200 },
                                { key: 'sharpness', label: 'Sharpness', min: 0, max: 100 },
                                { key: 'clarity', label: 'Clarity', min: 0, max: 100 },
                            ].map(({ key, label, min, max }) => (
                                <Box key={key}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                                        <Typography variant="caption" sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{label.toUpperCase()}</Typography>
                                        <Typography variant="caption" sx={{ fontSize: '10px', color: '#6C63FF', fontWeight: 900 }}>{adj[key]}%</Typography>
                                    </Stack>
                                    <Slider
                                        size="small"
                                        value={adj[key]}
                                        min={min} max={max}
                                        onChange={(_, v) => handleSliderChange(key, v)}
                                        sx={{ 
                                            py: 0.5, 
                                            color: '#6C63FF',
                                            '& .MuiSlider-thumb': { width: 12, height: 12, border: '2px solid #fff' },
                                            '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.1)' }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Stack>
                        <Button
                            variant="contained" 
                            size="small" 
                            fullWidth
                            disabled={processing}
                            onClick={handleApplyAdjustments}
                            sx={{ 
                                mt: 2, 
                                bgcolor: 'rgba(108, 99, 255, 0.8)', 
                                color: '#fff', 
                                fontWeight: 800,
                                fontSize: '11px', 
                                py: 1,
                                borderRadius: '12px',
                                '&:hover': { bgcolor: '#6C63FF' }
                            }}
                        >
                            APPLY CUSTOM TUNE
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ImageEnhancerPanel;
