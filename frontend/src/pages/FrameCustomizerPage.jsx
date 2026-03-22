import { useState, useEffect, useCallback, Suspense, lazy, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, CircularProgress,
    TextField, Slider, Divider, Chip, IconButton,
    Alert, Snackbar, Stack, Checkbox, FormControlLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import LayersIcon from '@mui/icons-material/Layers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InventoryIcon from '@mui/icons-material/Inventory';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import BrushIcon from '@mui/icons-material/Brush';

import api, { getPublicUrl } from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { Reorder } from 'framer-motion';

import FrameCanvasEditor from '../components/Customization/FrameBuilder/FrameCanvasEditor';
import { STICKER_ICONS, FONTS, LAYOUTS } from '../components/Customization/Shared/CustomizerConstants';
import ImageEnhancerPanel from '../components/Customization/Shared/ImageEnhancerPanel';
import PremiumCustomizerLayout from '../components/Customization/Shared/PremiumCustomizerLayout';
import CustomizerStepManager from '../components/Customization/Shared/CustomizerStepManager';
import VisualOptionCard from '../components/Customization/Shared/VisualOptionCard';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import UiverseCartButton from '../components/Shared/UiverseCartButton';

const Frame3DPreview = lazy(() => import('../components/Customization/FrameBuilder/Frame3DPreview'));

/* ─── Constants ─── */
const DEFAULT_FRAME_SIZES = [
    { label: "4x4 – Mini", value: "4x4 – Mini", width: 4, height: 4, price: 99, icon: '🖼️' },
    { label: "5x5 – Mini", value: "5x5 – Mini", width: 5, height: 5, price: 129, icon: '🖼️' },
    { label: "8x6 – A5", value: "8x6 – A5", width: 8, height: 6, price: 250, icon: '🖼️' },
    { label: "12x8 – A4", value: "12x8 – A4", width: 12, height: 8, price: 380, icon: '🖼️' },
    { label: "12x18 – A3", value: "12x18 – A3", width: 12, height: 18, price: 680, icon: '🖼️' },
    { label: "16.5x23.4 – A2", value: "16.5x23.4 – A2", width: 16.5, height: 23.4, price: 1499, icon: '🖼️' }
];

const DEFAULT_FRAME_STYLES = [
    { label: "Canvas Frame", type: "canvas", value: "canvas", description: "Minimalistic, no glass" },
    { label: "Wooden Frame", type: "wooden", value: "wooden", description: "Classic wood finish" },
    { label: "Normal Frame", type: "normal", value: "normal", description: "Glass front, plastic/metal" }
];

/* ─── Shared constants (LAYOUTS, FONTS, STICKER_ICONS) now imported ─── */

const STICKER_PACKS = [
    {
        name: 'Butterflies',
        category: 'butterfly',
        pack: [
            { url: 'https://img.icons8.com/color/512/butterfly.png', label: 'Monarch' },
            { url: 'https://img.icons8.com/color/512/insect.png', label: 'Blue Morpho' },
            { url: 'https://img.icons8.com/color/512/moth.png', label: 'Golden' }
        ]
    },
    {
        name: 'Flowers',
        category: 'floral',
        pack: [
            { url: 'https://img.icons8.com/color/512/sakura.png', label: 'Sakura' },
            { url: 'https://img.icons8.com/color/512/rose.png', label: 'Rose' },
            { url: 'https://img.icons8.com/color/512/sunflower.png', label: 'Sunflower' },
            { url: 'https://img.icons8.com/color/512/tulip.png', label: 'Tulip' }
        ]
    }
];

const INITIAL_DESIGN = {
    frameSize: '8x6 – A5',
    frameStyle: 'normal',
    frameColor: '#111111',
    layout: 'single',
    userImages: [],
    uploadedFileUrls: [],
    textLayers: [],
    stickers: [],
    layerOrder: ['img-0'],
    enhancedImages: [],
    imgProps: [],
    hiddenLayers: new Set(),
    borderDesign: 'minimal',
    matThickness: 0,
    matColor: '#ffffff',
    orientation: 'landscape',
    photoFilter: 'none',
    glassReflection: true,
    wallPreview: 'none',
    frameThickness: 1,
    innerSpacing: 20,
    outerPadding: 40,
    innerBorderColor: '#ffffff'
};

const FrameCustomizerPage = () => {
    const { id, cartItemId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { updateCartItem } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [previewTab, setPreviewTab] = useState(1); // 1 = 3D
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const stageRef = useRef(null);

    const [design, setDesign] = useState(INITIAL_DESIGN);
    const [history, setHistory] = useState([INITIAL_DESIGN]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [textureCanvas, setTextureCanvas] = useState(null);
    const [fitRevision, setFitRevision] = useState(0);
    const [lastUploadedLength, setLastUploadedLength] = useState(0);

    const saveHistory = useCallback((newDesign) => {
        const newHistory = history.slice(0, historyIndex + 1);
        if (newHistory.length > 50) newHistory.shift();
        newHistory.push(newDesign);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setDesign(newDesign);
    }, [history, historyIndex]);

    const updateDesign = useCallback((updates) => {
        const hasChange = Object.keys(updates).some(key => {
            const newVal = updates[key];
            const oldVal = design[key];
            if (newVal === oldVal) return false;
            // For objects/arrays, we do a simple string comparison for safety against loops
            if (typeof newVal === 'object' && newVal !== null) {
                return JSON.stringify(newVal) !== JSON.stringify(oldVal);
            }
            return true;
        });
        if (hasChange) {
            saveHistory({ ...design, ...updates });
        }
    }, [design, saveHistory]);

    const setTextLayers = (val) => {
        const newVal = typeof val === 'function' ? val(design.textLayers) : val;
        updateDesign({ textLayers: newVal });
    };

    const setStickers = (val) => {
        const newVal = typeof val === 'function' ? val(design.stickers) : val;
        updateDesign({ stickers: newVal });
    };

    const setImgProps = (val) => {
        const newVal = typeof val === 'function' ? val(design.imgProps) : val;
        updateDesign({ imgProps: newVal });
    };

    const handleUndo = () => historyIndex > 0 && (setHistoryIndex(historyIndex - 1), setDesign(history[historyIndex - 1]));
    const handleRedo = () => historyIndex < history.length - 1 && (setHistoryIndex(historyIndex + 1), setDesign(history[historyIndex + 1]));

    const handleImageUpload = async (e) => {
        if (!user) { navigate('/login'); return; }
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/products/upload-customization', formData);
            const url = res.data.image_url || res.data.url;
            const absoluteUrl = getPublicUrl(url);
            updateDesign({ 
                uploadedFileUrls: [...design.uploadedFileUrls, absoluteUrl], 
                originalPaths: [...(design.originalPaths || []), url] 
            });
            setSelectedImageIdx(design.uploadedFileUrls.length); // Point to the newly uploaded image
            setSnackbar({ open: true, message: 'Image uploaded!', severity: 'success' });
        } catch (err) { setSnackbar({ open: true, message: 'Upload failed', severity: 'error' }); } finally { setIsUploading(false); }
    };

    useEffect(() => {
        // Automatically fill empty slots when images are uploaded
        if (design.uploadedFileUrls.length > lastUploadedLength) {
            const slotsCount = design.layerOrder.filter(id => id.startsWith('img-')).length;
            const newImgProps = [...design.imgProps];
            let changed = false;
            
            for (let i = 0; i < slotsCount; i++) {
                if (i < design.uploadedFileUrls.length && !newImgProps[i]) {
                    newImgProps[i] = { imageIdx: i }; 
                    changed = true;
                }
            }
            
            if (changed) {
                updateDesign({ imgProps: newImgProps });
                setFitRevision(v => v + 1);
            }
            setLastUploadedLength(design.uploadedFileUrls.length);
        }
    }, [design.uploadedFileUrls, design.layerOrder, lastUploadedLength, design.imgProps, updateDesign]);

    useEffect(() => {
        const fetchProductAndCartItem = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
                const schema = res.data.customization_schema || {};
                const sizes = schema.frameSizes || DEFAULT_FRAME_SIZES;
                const styles = schema.frameStyles || DEFAULT_FRAME_STYLES;
                
                let initial = { ...INITIAL_DESIGN, frameSize: sizes[2]?.value, frameStyle: styles[2]?.value };
                
                if (cartItemId) {
                    try {
                        const cartRes = await api.get('/cart/');
                        const item = cartRes.data.items.find(i => i.id === parseInt(cartItemId));
                        if (item && item.customization_details) {
                            const details = item.customization_details;
                            initial = {
                                ...initial,
                                ...details,
                                frameSize: details.frame_size || details.frameSize,
                                frameStyle: details.frame_style || details.frameStyle,
                                uploadedFileUrls: (details.uploadedFileUrls || []).map(u => u.startsWith('data:') ? u : getPublicUrl(u)),
                                textLayers: details.textLayers || [],
                                stickers: details.stickers || [],
                                hiddenLayers: new Set(details.hiddenLayers || []),
                                layerOrder: details.layerOrder || (details.layout === 'single' ? ['img-0'] : [])
                            };
                        }
                    } catch (e) { console.error(e); }
                }
                setDesign(initial);
                setHistory([initial]);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchProductAndCartItem();
    }, [id, cartItemId]);

    const handleAddToCart = async () => {
        if (!user) { navigate('/login'); return; }
        setSnackbar({ open: true, message: 'Processing...', severity: 'info' });
        let previewUrl = null;
        try {
            const canvas = textureCanvas || stageRef.current?.toCanvas();
            if (canvas) {
                const dataUrl = canvas.toDataURL('image/png');
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const fd = new FormData();
                fd.append('file', new File([blob], 'frame_preview.png', { type: 'image/png' }));
                const up = await api.post('/products/upload-customization', fd);
                previewUrl = up.data.url || up.data.image_url;
            }
        } catch (e) { console.warn(e); }

        const customization_details = {
            ...design,
            hiddenLayers: Array.from(design.hiddenLayers),
            product_type: 'custom_frame',
            model_3d_screenshot: previewUrl
        };

        try {
            if (cartItemId) {
                await updateCartItem(parseInt(cartItemId), { quantity: 1, customization_details, preview_image_url: previewUrl });
            } else {
                await api.post('/cart/items/', { product_id: parseInt(id), quantity: 1, preview_image_url: previewUrl, customization_details });
            }
            navigate('/cart');
        } catch (err) { setSnackbar({ open: true, message: 'Failed to add to cart', severity: 'error' }); }
    };

    const memoizedUserImages = useMemo(() => {
        return design.uploadedFileUrls.map(url => {
            const base = getPublicUrl(url);
            // Add a cache-buster to prevent browser from using the non-CORS 
            // cached thumbnail for the CORS-required canvas image.
            return base.includes('?') ? `${base}&t=canvas` : `${base}?t=canvas`;
        });
    }, [design.uploadedFileUrls]);

    if (loading) return <LoadingState type="customizer" />;
    if (!product) return <ErrorState message="Product not found" onRetry={() => navigate('/shop')} />;

    const steps = [
        { id: 'type', label: 'Setup', icon: <InventoryIcon /> },
        { id: 'photo', label: 'Photos', icon: <PhotoLibraryIcon /> },
        { id: 'layers', label: 'Layers', icon: <LayersIcon /> },
        { id: 'text', label: 'Decorate', icon: <TextFieldsIcon /> },
        { id: 'style', label: 'Finish', icon: <BrushIcon /> },
        { id: 'review', label: 'Order', icon: <ViewInArIcon /> }
    ];

    const currentSize = DEFAULT_FRAME_SIZES.find(s => s.value === design.frameSize) || DEFAULT_FRAME_SIZES[2];
    const totalPrice = currentSize.price + (design.frameStyle === 'wooden' ? 200 : design.frameStyle === 'canvas' ? 100 : 0);

    return (
        <>
            <PremiumCustomizerLayout
                title={product.name}
                subtitle="Design your masterpiece frame in 3D"
                previewContent={
                    <>
                        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 1 }}>
                            <Button variant="outlined" size="small" onClick={() => setFitRevision(v => v + 1)} sx={{ borderRadius: '12px', borderStyle: 'dashed' }} startIcon={<RestartAltIcon />}>Refresh</Button>
                            <Button variant={previewTab === 0 ? "contained" : "outlined"} size="small" onClick={() => setPreviewTab(0)} sx={{ borderRadius: '12px' }}>2D Designer</Button>
                            <Button variant={previewTab === 1 ? "contained" : "outlined"} size="small" onClick={() => setPreviewTab(1)} sx={{ borderRadius: '12px' }}>3D Preview</Button>
                        </Box>
                        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                            <Box sx={{ display: previewTab === 0 ? 'flex' : 'none', p: 4, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <FrameCanvasEditor
                                    {...design}
                                    frameSize={currentSize}
                                    userImages={memoizedUserImages}
                                    setTextLayers={setTextLayers}
                                    setStickers={setStickers}
                                    setImgProps={setImgProps}
                                    selectedId={selectedId}
                                    setSelectedId={setSelectedId}
                                    onStageReady={s => stageRef.current = s}
                                    onTextureUpdate={setTextureCanvas}
                                    fitRevision={fitRevision}
                                />
                            </Box>
                            <Box sx={{ display: previewTab === 1 ? 'block' : 'none', width: '100%', height: '100%' }}>
                                <Suspense fallback={<CircularProgress />}>
                                    <Frame3DPreview
                                        {...design}
                                        frameSize={currentSize}
                                        textureCanvas={textureCanvas}
                                    />
                                </Suspense>
                            </Box>
                        </Box>
                        <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10, display: 'flex', gap: 1 }}>
                            <IconButton onClick={handleUndo} disabled={historyIndex === 0} className="glass"><RestartAltIcon sx={{ transform: 'scaleX(-1)' }} /></IconButton>
                            <IconButton onClick={handleRedo} disabled={historyIndex === history.length - 1} className="glass"><RestartAltIcon /></IconButton>
                        </Box>
                    </>
                }
                controlContent={
                    <CustomizerStepManager steps={steps} activeStep={currentStep} onStepChange={setCurrentStep}>
                        {currentStep === 0 && (
                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="h3" sx={{ mb: 2 }}>Select Size</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2 }}>
                                        {DEFAULT_FRAME_SIZES.map(s => (
                                            <VisualOptionCard key={s.value} label={s.label} value={s.value} selected={design.frameSize === s.value} onClick={v => updateDesign({ frameSize: v })} price={s.price} emoji={s.icon} />
                                        ))}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="h3" sx={{ mb: 2 }}>Orientation</Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <VisualOptionCard label="Landscape" value="landscape" selected={design.orientation === 'landscape'} onClick={v => updateDesign({ orientation: v })} emoji="↔️" />
                                        <VisualOptionCard label="Portrait" value="portrait" selected={design.orientation === 'portrait'} onClick={v => updateDesign({ orientation: v })} emoji="↕️" />
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.6, mb: 2 }}>Setup your basic frame properties before adding photos.</Typography>
                                    <Button fullWidth variant="contained" onClick={() => setCurrentStep(1)} sx={{ borderRadius: '12px', py: 1.5 }}>Continue to Photos & Layout</Button>
                                </Box>
                            </Stack>
                        )}
                        {currentStep === 1 && (
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="h3" sx={{ mb: 1 }}>Layout & Photos</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 2 }}>Select how many photos you want to display.</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                                        {LAYOUTS.map(l => (
                                            <Chip 
                                                key={l.value} 
                                                label={l.label} 
                                                onClick={() => {
                                                    const slots = l.slots || 1;
                                                    const imgLayers = Array.from({length: slots}, (_, i) => `img-${i}`);
                                                    const decorations = design.layerOrder.filter(id => !id.startsWith('img-'));
                                                    updateDesign({ 
                                                        layout: l.value, 
                                                        layerOrder: [...imgLayers, ...decorations] 
                                                    });
                                                }} 
                                                variant={design.layout === l.value ? 'filled' : 'outlined'} 
                                                color={design.layout === l.value ? 'primary' : 'default'} 
                                                sx={{ borderRadius: '10px' }}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Upload Photos</Typography>
                                    <Button fullWidth variant="outlined" component="label" startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />} sx={{ py: 4, borderStyle: 'dashed', borderRadius: '20px', borderColor: 'rgba(255,255,255,0.2)' }}>
                                        {isUploading ? "Uploading..." : "Add New Photo"}
                                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                    </Button>
                                </Box>

                                {design.uploadedFileUrls.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Photo Library (Click to Enhance)</Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 1.5 }}>
                                            {design.uploadedFileUrls.map((url, i) => {
                                                const displayUrl = getPublicUrl(url);
                                                
                                                return (
                                                    <Box 
                                                        key={i} 
                                                        onClick={() => setSelectedImageIdx(i)}
                                                        sx={{ 
                                                            position: 'relative', 
                                                            pt: '100%', 
                                                            borderRadius: '12px', 
                                                            overflow: 'hidden', 
                                                            cursor: 'pointer',
                                                            border: selectedImageIdx === i ? '2px solid #7B61FF' : '1px solid rgba(255,255,255,0.1)',
                                                            transform: selectedImageIdx === i ? 'scale(1.05)' : 'none',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <img 
                                                            src={displayUrl} 
                                                            alt={`upload-${i}`} 
                                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                                            onError={(e) => { e.target.src = 'https://placehold.co/100?text=Error'; }}
                                                        />
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newUrls = design.uploadedFileUrls.filter((_, idx) => idx !== i);
                                                                updateDesign({ uploadedFileUrls: newUrls });
                                                                if (selectedImageIdx >= newUrls.length) setSelectedImageIdx(Math.max(0, newUrls.length - 1));
                                                            }} 
                                                            sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', p: 0.5 }}
                                                        >
                                                            <DeleteIcon sx={{ fontSize: 12, color: '#fff' }} />
                                                        </IconButton>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                )}

                                {design.uploadedFileUrls.length > 0 && (
                                    <Box sx={{ pt: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <AutoFixHighIcon sx={{ fontSize: 18, color: '#7B61FF' }} />
                                            <Typography variant="subtitle2">Image Enhancer (AI)</Typography>
                                        </Box>
                                        <ImageEnhancerPanel 
                                            originalImageSrc={design.uploadedFileUrls[selectedImageIdx]}
                                            onEnhancedImage={(newUrl) => {
                                                const newUrls = [...design.uploadedFileUrls];
                                                newUrls[selectedImageIdx] = newUrl;
                                                updateDesign({ uploadedFileUrls: newUrls });
                                            }}
                                        />
                                    </Box>
                                )}
                                <Button fullWidth variant="contained" onClick={() => setCurrentStep(2)} sx={{ mt: 2, borderRadius: '12px', py: 1.5 }}>Continue to Layers</Button>
                            </Stack>
                        )}
                        {currentStep === 2 && (
                            <Stack spacing={3}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LayersIcon sx={{ fontSize: 18, color: '#7B61FF' }} />
                                        <Typography variant="h3">Object Layers</Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 3 }}>
                                        Manage your photos and decorations. Drag to reorder.
                                    </Typography>
                                </Box>

                                <Box sx={{ mt: 1 }}>
                                    <Reorder.Group axis="y" values={design.layerOrder} onReorder={(newOrder) => updateDesign({ layerOrder: newOrder })}>
                                        <Stack spacing={1.5}>
                                            {design.layerOrder.map(layerId => {
                                                const isText = layerId.startsWith('text-');
                                                const isSticker = layerId.startsWith('sticker-');
                                                const isImg = layerId.startsWith('img-');
                                                
                                                let label = "Unknown Layer";
                                                let icon = <LayersIcon />;
                                                
                                                if (isText) {
                                                    const t = design.textLayers.find(l => l.id === layerId);
                                                    label = t?.text || "Text Layer";
                                                    icon = <TextFieldsIcon />;
                                                } else if (isSticker) {
                                                    const s = design.stickers.find(l => l.id === layerId);
                                                    label = `Sticker: ${STICKER_ICONS[s?.type] || (s?.type === 'url' ? 'Image' : s?.type) || 'Decor'}`;
                                                    icon = <AutoFixHighIcon />;
                                                } else if (isImg) {
                                                    const idx = parseInt(layerId.split('-')[1]);
                                                    label = `Photo Slot ${idx + 1}`;
                                                    icon = <PhotoLibraryIcon />;
                                                }

                                                const isHidden = design.hiddenLayers.has(layerId);

                                                return (
                                                    <Reorder.Item key={layerId} value={layerId}>
                                                        <Box className="glass" sx={{ 
                                                            px: 2, py: 1.5, borderRadius: '16px', 
                                                            display: 'flex', alignItems: 'center', gap: 2,
                                                            cursor: 'grab', '&:active': { cursor: 'grabbing' },
                                                            border: '1px solid rgba(255,255,255,0.08)',
                                                            opacity: isHidden ? 0.5 : 1,
                                                            bgcolor: selectedId === layerId ? 'rgba(123, 97, 255, 0.1)' : 'transparent',
                                                            borderColor: selectedId === layerId ? '#7B61FF' : 'rgba(255,255,255,0.08)'
                                                        }} onClick={() => setSelectedId(layerId)}>
                                                            <Box sx={{ color: 'rgba(255,255,255,0.4)' }}>{icon}</Box>
                                                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                {isText ? (
                                                                    <Stack spacing={1}>
                                                                        <TextField 
                                                                            variant="standard"
                                                                            size="small" 
                                                                            fullWidth 
                                                                            value={label} 
                                                                            onChange={e => {
                                                                                const newLayers = design.textLayers.map(l => l.id === layerId ? { ...l, text: e.target.value } : l);
                                                                                updateDesign({ textLayers: newLayers });
                                                                            }}
                                                                            InputProps={{ disableUnderline: true, sx: { fontSize: '13px', fontWeight: 600 } }}
                                                                        />
                                                                        <Stack direction="row" spacing={1}>
                                                                            <select 
                                                                                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '10px', opacity: 0.6 }}
                                                                                value={design.textLayers.find(l => l.id === layerId)?.fontFamily || 'Poppins'}
                                                                                onChange={e => {
                                                                                    const newLayers = design.textLayers.map(l => l.id === layerId ? { ...l, fontFamily: e.target.value } : l);
                                                                                    updateDesign({ textLayers: newLayers });
                                                                                }}
                                                                            >
                                                                                {FONTS.map(f => <option key={f} value={f} style={{ color: '#000' }}>{f}</option>)}
                                                                            </select>
                                                                            <input 
                                                                                type="color" 
                                                                                style={{ width: 15, height: 15, border: 'none', padding: 0, borderRadius: 2 }}
                                                                                value={design.textLayers.find(l => l.id === layerId)?.color || '#000000'}
                                                                                onChange={e => {
                                                                                    const newLayers = design.textLayers.map(l => l.id === layerId ? { ...l, color: e.target.value } : l);
                                                                                    updateDesign({ textLayers: newLayers });
                                                                                }}
                                                                            />
                                                                        </Stack>
                                                                    </Stack>
                                                                ) : (
                                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{label}</Typography>
                                                                )}
                                                            </Box>

                                                            <Stack direction="row" spacing={0.5}>
                                                                {isImg && (
                                                                    <IconButton 
                                                                        size="small" 
                                                                        title="Auto Fit"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const idx = parseInt(layerId.split('-')[1]);
                                                                            const newProps = [...design.imgProps];
                                                                            newProps[idx] = null; // Clear props to trigger auto-fit
                                                                            updateDesign({ imgProps: newProps });
                                                                            setFitRevision(v => v + 1);
                                                                            setSnackbar({ open: true, message: 'Auto-adjusting image...', severity: 'info' });
                                                                        }}
                                                                    >
                                                                        <AutoFixHighIcon sx={{ fontSize: 18, color: '#7B61FF' }} />
                                                                    </IconButton>
                                                                )}
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const hidden = new Set(design.hiddenLayers);
                                                                        if (hidden.has(layerId)) hidden.delete(layerId);
                                                                        else hidden.add(layerId);
                                                                        updateDesign({ hiddenLayers: hidden });
                                                                    }}
                                                                >
                                                                    {isHidden ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                                                                </IconButton>
                                                                {isImg && (
                                                                    <IconButton
                                                                        size="small"
                                                                        title="Assign Image"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const slotIdx = parseInt(layerId.split('-')[1]);
                                                                            const currentImageIdx = design.imgProps[slotIdx]?.imageIdx ?? slotIdx;
                                                                            const nextImageIdx = (currentImageIdx + 1) % design.uploadedFileUrls.length;
                                                                            const newImgProps = [...design.imgProps];
                                                                            newImgProps[slotIdx] = { ...newImgProps[slotIdx], imageIdx: nextImageIdx };
                                                                            updateDesign({ imgProps: newImgProps });
                                                                        }}
                                                                    >
                                                                        <PhotoLibraryIcon sx={{ fontSize: 18, color: '#7B61FF' }} />
                                                                    </IconButton>
                                                                )}
                                                                {!isImg && (
                                                                    <IconButton 
                                                                        size="small" 
                                                                        color="error" 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            updateDesign({ 
                                                                                textLayers: design.textLayers.filter(l => l.id !== layerId), 
                                                                                stickers: design.stickers.filter(s => s.id !== layerId),
                                                                                layerOrder: design.layerOrder.filter(id => id !== layerId)
                                                                            });
                                                                        }}
                                                                    >
                                                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    </Reorder.Item>
                                                );
                                            })}
                                        </Stack>
                                    </Reorder.Group>
                                </Box>
                                {design.layerOrder.length === 0 && (
                                    <Box sx={{ py: 6, textAlign: 'center', opacity: 0.5 }}>
                                        <LayersIcon sx={{ fontSize: 48, mb: 1 }} />
                                        <Typography>No layers yet. Add photos or text!</Typography>
                                    </Box>
                                )}
                                <Button fullWidth variant="contained" onClick={() => setCurrentStep(3)} sx={{ mt: 2, borderRadius: '12px' }}>Add More Elements</Button>
                            </Stack>
                        )}
                        {currentStep === 3 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Messages & Elements</Typography>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Button fullWidth variant="outlined" startIcon={<TextFieldsIcon />} onClick={() => {
                                        const id = `text-${Date.now()}`;
                                        updateDesign({ 
                                            textLayers: [...design.textLayers, { id, text: 'Your Message', fontFamily: 'Poppins', fontSize: 40, color: '#000000', x: 200, y: 200, rotation: 0 }],
                                            layerOrder: [...design.layerOrder, id]
                                        });
                                        setCurrentStep(2); // Jump to layers
                                    }} sx={{ py: 1.5, borderRadius: '12px', borderStyle: 'dashed' }}>Add Text</Button>
                                    <Button fullWidth variant="outlined" startIcon={<AutoFixHighIcon />} onClick={() => setPreviewTab(0)} sx={{ py: 1.5, borderRadius: '12px', borderStyle: 'dashed' }}>Stickers</Button>
                                </Box>
                                
                                <Box>
                                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Quick Emojis</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                                        {Object.entries(STICKER_ICONS).map(([key, emoji]) => (
                                            <IconButton key={key} onClick={() => {
                                                const id = `sticker-${Date.now()}`;
                                                updateDesign({ 
                                                    stickers: [...design.stickers, { id, type: key, x: 150, y: 150, size: 80, rot: 0, opacity: 1 }],
                                                    layerOrder: [...design.layerOrder, id]
                                                });
                                                setCurrentStep(2); // Jump to layers
                                            }} sx={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', minWidth: '48px', height: '48px', bgcolor: 'rgba(255,255,255,0.02)' }}>
                                                {emoji}
                                            </IconButton>
                                        ))}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ mb: 1.5, display: 'block' }}>Decorative Sticker Packs</Typography>
                                    {STICKER_PACKS.map(pack => (
                                        <Box key={pack.name} sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, mb: 1 }}>{pack.name}</Typography>
                                            <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                                                {pack.pack.map((s, idx) => (
                                                    <Box 
                                                        key={idx} 
                                                        onClick={() => {
                                                            const id = `sticker-${Date.now()}`;
                                                            updateDesign({ 
                                                                stickers: [...design.stickers, { id, url: getPublicUrl(s.url), type: 'url', x: 200, y: 200, size: 100, rot: 0, opacity: 1 }],
                                                                layerOrder: [...design.layerOrder, id]
                                                            });
                                                            setCurrentStep(2); // Jump to layers
                                                        }}
                                                        sx={{ 
                                                            minWidth: 60, height: 60, borderRadius: '12px', 
                                                            bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                                                        }}
                                                    >
                                                        <img src={s.url} alt={s.label} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                                <Button fullWidth variant="contained" onClick={() => setCurrentStep(4)} sx={{ mt: 2, borderRadius: '12px' }}>Next: Style Frame</Button>
                            </Stack>
                        )}
                        {currentStep === 4 && (
                            <Stack spacing={4}>
                                <Typography variant="h3">Advanced Styling</Typography>
                                
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Material & Color</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2, mt: 1.5 }}>
                                        {DEFAULT_FRAME_STYLES.map(s => (
                                            <VisualOptionCard key={s.value} label={s.label} value={s.value} selected={design.frameStyle === s.value} onClick={v => updateDesign({ frameStyle: v })} subtitle={s.description} />
                                        ))}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
                                        {['#111111', '#ffffff', '#8B4513', '#FFD700', '#C0C0C0'].map(c => (
                                            <Box key={c} onClick={() => updateDesign({ frameColor: c })} sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: c, border: design.frameColor === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} />
                                        ))}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Border Design</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1.5 }}>
                                        {['minimal', 'vintage', 'floral', 'modern geometric'].map(b => (
                                            <VisualOptionCard key={b} label={b.charAt(0).toUpperCase() + b.slice(1)} value={b} selected={design.borderDesign === b} onClick={v => updateDesign({ borderDesign: v })} />
                                        ))}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Inner Matting (Border)</Typography>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.5 }}>
                                        <Typography variant="body2" sx={{ minWidth: 40, fontWeight: 700 }}>{design.matThickness}px</Typography>
                                        <Slider value={design.matThickness} min={0} max={60} onChange={(_, v) => updateDesign({ matThickness: v })} />
                                    </Stack>
                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1.5 }}>
                                        {['#ffffff', '#000000', '#f5f5dc', '#e6e6fa', '#f0fff0'].map(c => (
                                            <Box key={c} onClick={() => updateDesign({ matColor: c })} sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: c, border: design.matColor === c ? '2px solid #7B61FF' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} />
                                        ))}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Photo Filters</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                                        {['none', 'bw', 'vintage', 'warm', 'cool'].map(f => (
                                            <Chip key={f} label={f.toUpperCase()} onClick={() => updateDesign({ photoFilter: f })} variant={design.photoFilter === f ? 'filled' : 'outlined'} color={design.photoFilter === f ? 'primary' : 'default'} sx={{ borderRadius: '8px' }} />
                                        ))}
                                    </Box>
                                </Box>

                                <Divider sx={{ opacity: 0.1 }} />

                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Realistic Preview</Typography>
                                    <FormControlLabel control={<Checkbox checked={design.glassReflection} onChange={e => updateDesign({ glassReflection: e.target.checked })} />} label={<Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.8 }}>3D Glass Reflections</Typography>} />
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 1, fontSize: '0.75rem', opacity: 0.7, fontWeight: 700 }}>Show on Wall:</Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {['none', 'living room', 'bedroom', 'office'].map(w => (
                                                <Button key={w} size="small" variant={design.wallPreview === w ? "contained" : "outlined"} onClick={() => updateDesign({ wallPreview: w })} sx={{ fontSize: '11px', borderRadius: '10px', textTransform: 'capitalize' }}>{w}</Button>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            </Stack>
                        )}
                        {currentStep === 5 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Preview Ready</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Button size="small" variant="outlined" startIcon={<RestartAltIcon />} onClick={() => setFitRevision(v => v + 1)} sx={{ borderRadius: '10px', fontSize: '11px' }}>Refresh Display</Button>
                                    <Button size="small" variant="outlined" startIcon={<LayersIcon />} onClick={() => setCurrentStep(2)} sx={{ borderRadius: '10px', fontSize: '11px' }}>Manage Layers</Button>
                                </Box>
                                
                                <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden', borderRadius: '24px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: '#7B61FF' }}>Design Summary:</Typography>
                                    <Stack spacing={1}>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>• Size: <b>{design.frameSize}</b></Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>• Style: <b>{design.frameStyle}</b></Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>• Layout: <b>{design.layout}</b></Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>• Photos: <b>{design.uploadedFileUrls.length}</b></Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>• Decorations: <b>{design.textLayers.length + design.stickers.length}</b></Typography>
                                    </Stack>
                                </Box>
                                <Alert severity="info" variant="outlined" sx={{ borderRadius: '16px', color: '#fff', '& .MuiAlert-icon': { color: '#7B61FF' } }}>
                                    Your 3D design is ready! Use the toggle above to switch between 2D Editor and 3D Showcase.
                                </Alert>
                            </Stack>
                        )}
                    </CustomizerStepManager>
                }
                actionBarContent={
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Total Price</Typography>
                                <Typography sx={{ color: '#fff', fontSize: '24px', fontWeight: 800 }}>₹{totalPrice.toFixed(0)}</Typography>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button onClick={() => { setDesign(INITIAL_DESIGN); setHistory([INITIAL_DESIGN]); setHistoryIndex(0); }} sx={{ color: 'rgba(255,255,255,0.4)', minWidth: '48px', height: '48px', borderRadius: '14px', '&:hover': { background: 'rgba(255,255,255,0.05)' } }}><RestartAltIcon /></Button>
                            <UiverseCartButton 
                                onClick={handleAddToCart} 
                                text={cartItemId ? "Update Cart" : "Add to Cart"}
                            />
                        </Stack>
                    </>
                }
            />
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '12px' }}>{snackbar.message}</Alert>
            </Snackbar>
        </>
    );
};

export default FrameCustomizerPage;
