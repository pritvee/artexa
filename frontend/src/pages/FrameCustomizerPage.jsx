import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy, useRef, useReducer } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, Button, CircularProgress,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Slider, Divider, Paper, Tabs, Tab, Chip, IconButton,
    Tooltip, Alert, Snackbar, Stack, Checkbox, FormControlLabel, Skeleton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import EditIcon from '@mui/icons-material/Edit';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import LayersIcon from '@mui/icons-material/Layers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InventoryIcon from '@mui/icons-material/Inventory';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import BrushIcon from '@mui/icons-material/Brush';

import api, { getPublicUrl } from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { sanitizeUrl } from '../api/security';
import { useCart } from '../store/CartContext';
import { Reorder } from 'framer-motion';

import FrameCanvasEditor, { STICKER_ICONS } from '../components/Customization/FrameBuilder/FrameCanvasEditor';
import ImageEnhancerPanel from '../components/Customization/Shared/ImageEnhancerPanel';
import PremiumCustomizerLayout from '../components/Customization/Shared/PremiumCustomizerLayout';
import CustomizerStepManager from '../components/Customization/Shared/CustomizerStepManager';
import VisualOptionCard from '../components/Customization/Shared/VisualOptionCard';
import InstagramSupportButton from '../components/Shared/InstagramSupportButton';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';

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

const LAYOUTS = [
    { label: 'Single', value: 'single', slots: 1 },
    { label: 'Two-Photo', value: 'two-photo', slots: 2 },
    { label: 'Collage (3)', value: 'collage-3', slots: 3 },
    { label: 'Grid (4)', value: 'grid-4', slots: 4 }
];

const FONTS = [
    'Poppins', 'Inter', 'Outfit', 
    'Pacifico', 'Dancing Script', 'Great Vibes', 'Sacramento',
    'Playfair Display', 'Cormorant Garamond', 'Impact'
];

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
    layerOrder: [],
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
    const location = useLocation();
    const { user } = useAuth();
    const { updateCartItem } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [previewTab, setPreviewTab] = useState(1); // 1 = 3D
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isUploading, setIsUploading] = useState(false);
    const stageRef = useRef(null);

    const [design, setDesign] = useState(INITIAL_DESIGN);
    const [history, setHistory] = useState([INITIAL_DESIGN]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [textureCanvas, setTextureCanvas] = useState(null);

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
                                layerOrder: details.layerOrder || []
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

    const saveHistory = useCallback((newDesign) => {
        const newHistory = history.slice(0, historyIndex + 1);
        if (newHistory.length > 50) newHistory.shift();
        newHistory.push(newDesign);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setDesign(newDesign);
    }, [history, historyIndex]);

    const handleUndo = () => historyIndex > 0 && (setHistoryIndex(historyIndex - 1), setDesign(history[historyIndex - 1]));
    const handleRedo = () => historyIndex < history.length - 1 && (setHistoryIndex(historyIndex + 1), setDesign(history[historyIndex + 1]));

    const updateDesign = (updates) => saveHistory({ ...design, ...updates });

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
            updateDesign({ uploadedFileUrls: [...design.uploadedFileUrls, getPublicUrl(url)], originalPaths: [...(design.originalPaths || []), url] });
            setSnackbar({ open: true, message: 'Image uploaded!', severity: 'success' });
            if (currentStep === 1) setCurrentStep(2);
        } catch (err) { setSnackbar({ open: true, message: 'Upload failed', severity: 'error' }); } finally { setIsUploading(false); }
    };

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

    if (loading) return <LoadingState type="customizer" />;
    if (!product) return <ErrorState message="Product not found" onRetry={() => navigate('/shop')} />;

    const steps = [
        { id: 'type', label: 'Frame Type', icon: <InventoryIcon /> },
        { id: 'photo', label: 'Upload Photo', icon: <PhotoLibraryIcon /> },
        { id: 'text', label: 'Messages', icon: <TextFieldsIcon /> },
        { id: 'style', label: 'Frame Style', icon: <BrushIcon /> },
        { id: 'review', label: 'Review', icon: <ViewInArIcon /> }
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
                            <Button variant={previewTab === 0 ? "contained" : "outlined"} size="small" onClick={() => setPreviewTab(0)} sx={{ borderRadius: '12px' }}>2D Designer</Button>
                            <Button variant={previewTab === 1 ? "contained" : "outlined"} size="small" onClick={() => setPreviewTab(1)} sx={{ borderRadius: '12px' }}>3D Preview</Button>
                        </Box>
                        <Box sx={{ width: '100%', height: '100%' }}>
                            <Box sx={{ display: previewTab === 0 ? 'block' : 'none', p: 4, height: '100%' }}>
                                <FrameCanvasEditor
                                    {...design}
                                    frameSize={currentSize}
                                    userImages={design.uploadedFileUrls}
                                    setTextLayers={setTextLayers}
                                    setStickers={setStickers}
                                    setImgProps={setImgProps}
                                    selectedId={selectedId}
                                    setSelectedId={setSelectedId}
                                    onStageReady={s => stageRef.current = s}
                                    onTextureUpdate={setTextureCanvas}
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
                                    <Typography variant="h3" sx={{ mb: 2 }}>Layout</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        {LAYOUTS.map(l => (
                                            <Chip key={l.value} label={l.label} onClick={() => {
                                                const slots = l.slots || 1;
                                                const layerOrder = Array.from({length: slots}, (_, i) => `img-${i}`);
                                                updateDesign({ layout: l.value, layerOrder });
                                            }} variant={design.layout === l.value ? 'filled' : 'outlined'} color={design.layout === l.value ? 'primary' : 'default'} />
                                        ))}
                                    </Box>
                                </Box>
                            </Stack>
                        )}
                        {currentStep === 1 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Upload Photos</Typography>
                                <Button fullWidth variant="outlined" component="label" startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />} sx={{ py: 6, borderStyle: 'dashed', borderRadius: '20px', borderColor: 'rgba(255,255,255,0.2)' }}>
                                    {isUploading ? "Uploading..." : "Click to select a photo"}
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                </Button>
                                {design.uploadedFileUrls.length > 0 && (
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                                        {design.uploadedFileUrls.map((url, i) => {
                                            const safeFrameUrl = sanitizeUrl(url);
                                            return (
                                                <Box key={i} sx={{ position: 'relative', pt: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <img 
                                                        src={safeFrameUrl} 
                                                        alt="upload" 
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    />
                                                    <IconButton size="small" onClick={() => updateDesign({ uploadedFileUrls: design.uploadedFileUrls.filter((_, idx) => idx !== i) })} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.5)' }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}
                                <ImageEnhancerPanel 
                                    originalImage={design.uploadedFileUrls[design.uploadedFileUrls.length - 1]}
                                    onEnhanced={(newUrl) => {
                                        const newUrls = [...design.uploadedFileUrls];
                                        newUrls[newUrls.length - 1] = newUrl;
                                        updateDesign({ uploadedFileUrls: newUrls });
                                    }}
                                />
                            </Stack>
                        )}
                        {currentStep === 2 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Add Messages & Stickers</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button fullWidth variant="outlined" startIcon={<TextFieldsIcon />} onClick={() => {
                                        const id = `text-${Date.now()}`;
                                        updateDesign({ 
                                            textLayers: [...design.textLayers, { id, text: 'New Message', fontFamily: 'Poppins', fontSize: 40, color: '#000000', x: 200, y: 200, rotation: 0 }],
                                            layerOrder: [...design.layerOrder, id]
                                        });
                                    }} sx={{ py: 1.5, borderRadius: '12px' }}>Add Text</Button>
                                    <Button fullWidth variant="outlined" startIcon={<AutoFixHighIcon />} onClick={() => {
                                        setPreviewTab(0);
                                        // Open sticker selector logic could go here, but let's just add a sample one for now or show a list
                                    }} sx={{ py: 1.5, borderRadius: '12px' }}>Stickers</Button>
                                </Box>
                                
                                <Box>
                                    <Typography variant="caption">Sticker Collection</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mt: 1 }}>
                                        {Object.entries(STICKER_ICONS).map(([key, emoji]) => (
                                            <IconButton key={key} onClick={() => {
                                                const id = `sticker-${Date.now()}`;
                                                updateDesign({ 
                                                    stickers: [...design.stickers, { id, type: key, x: 150, y: 150, size: 80, rot: 0, opacity: 1 }],
                                                    layerOrder: [...design.layerOrder, id]
                                                });
                                            }} sx={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', minWidth: '48px' }}>
                                                {emoji}
                                            </IconButton>
                                        ))}
                                    </Box>
                                </Box>

                                {design.textLayers.length > 0 && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="caption">Active Layers</Typography>
                                        <Reorder.Group axis="y" values={design.layerOrder} onReorder={(newOrder) => updateDesign({ layerOrder: newOrder })}>
                                            {design.layerOrder.map(layerId => {
                                                const isText = layerId.startsWith('text-');
                                                const isSticker = layerId.startsWith('sticker-');
                                                if (!isText && !isSticker) return null;
                                                const item = isText ? design.textLayers.find(l => l.id === layerId) : design.stickers.find(s => s.id === layerId);
                                                if (!item) return null;

                                                return (
                                                    <Reorder.Item key={layerId} value={layerId}>
                                                        <Box className="glass" sx={{ p: 1.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                            <LayersIcon sx={{ fontSize: 16, opacity: 0.5 }} />
                                                            {isText ? (
                                                                <TextField size="small" fullWidth value={item.text} onChange={e => {
                                                                    const newLayers = design.textLayers.map(l => l.id === layerId ? { ...l, text: e.target.value } : l);
                                                                    updateDesign({ textLayers: newLayers });
                                                                }} />
                                                            ) : (
                                                                <Typography variant="body2" sx={{ flexGrow: 1 }}>Sticker: {STICKER_ICONS[item.type]}</Typography>
                                                            )}
                                                            <IconButton size="small" color="error" onClick={() => {
                                                                const newLayers = isText ? design.textLayers.filter(l => l.id !== layerId) : design.textLayers;
                                                                const newStickers = isSticker ? design.stickers.filter(s => s.id !== layerId) : design.stickers;
                                                                updateDesign({ 
                                                                    textLayers: newLayers, 
                                                                    stickers: newStickers,
                                                                    layerOrder: design.layerOrder.filter(id => id !== layerId)
                                                                });
                                                            }}><DeleteIcon /></IconButton>
                                                        </Box>
                                                    </Reorder.Item>
                                                );
                                            })}
                                        </Reorder.Group>
                                    </Box>
                                )}
                            </Stack>
                        )}
                        {currentStep === 3 && (
                            <Stack spacing={4}>
                                <Typography variant="h3">Advanced Styling</Typography>
                                
                                <Box>
                                    <Typography variant="caption">Border Design</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}>
                                        {['minimal', 'vintage', 'floral', 'modern geometric'].map(b => (
                                            <VisualOptionCard key={b} label={b.charAt(0).toUpperCase() + b.slice(1)} value={b} selected={design.borderDesign === b} onClick={v => updateDesign({ borderDesign: v })} />
                                        ))}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption">Matting (Inner Border)</Typography>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                        <Typography variant="body2" sx={{ minWidth: 40 }}>{design.matThickness}px</Typography>
                                        <Slider value={design.matThickness} min={0} max={60} onChange={(_, v) => updateDesign({ matThickness: v })} />
                                    </Stack>
                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1.5 }}>
                                        {['#ffffff', '#000000', '#f5f5dc', '#e6e6fa', '#f0fff0'].map(c => (
                                            <Box key={c} onClick={() => updateDesign({ matColor: c })} sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: c, border: design.matColor === c ? '2px solid #7B61FF' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} />
                                        ))}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption">Material & Color</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2, mt: 1 }}>
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
                                    <Typography variant="caption">Photo Filter</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                        {['none', 'bw', 'vintage', 'warm', 'cool'].map(f => (
                                            <Chip key={f} label={f.toUpperCase()} onClick={() => updateDesign({ photoFilter: f })} variant={design.photoFilter === f ? 'filled' : 'outlined'} color={design.photoFilter === f ? 'primary' : 'default'} size="small" />
                                        ))}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption">Advanced Spacing & Thickness</Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2" sx={{ fontSize: '10px', opacity: 0.6 }}>Frame Thickness</Typography>
                                        <Slider value={design.frameThickness} min={0.5} max={2} step={0.1} onChange={(_, v) => updateDesign({ frameThickness: v })} />
                                    </Box>
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2" sx={{ fontSize: '10px', opacity: 0.6 }}>Image Spacing</Typography>
                                        <Slider value={design.innerSpacing} min={0} max={100} onChange={(_, v) => updateDesign({ innerSpacing: v })} />
                                    </Box>
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2" sx={{ fontSize: '10px', opacity: 0.6 }}>Outer Padding</Typography>
                                        <Slider value={design.outerPadding} min={0} max={100} onChange={(_, v) => updateDesign({ outerPadding: v })} />
                                    </Box>
                                </Box>

                                <Divider sx={{ opacity: 0.1 }} />

                                <Box>
                                    <Typography variant="caption">Preview Settings</Typography>
                                    <FormControlLabel control={<Checkbox checked={design.glassReflection} onChange={e => updateDesign({ glassReflection: e.target.checked })} />} label={<Typography variant="body2">Realistic Glass Reflection</Typography>} />
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2" sx={{ mb: 1, fontSize: '0.75rem', opacity: 0.7 }}>Wall Environment</Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {['none', 'living room', 'bedroom', 'office'].map(w => (
                                                <Button key={w} size="small" variant={design.wallPreview === w ? "contained" : "outlined"} onClick={() => updateDesign({ wallPreview: w })} sx={{ fontSize: '10px', borderRadius: '8px' }}>{w}</Button>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            </Stack>
                        )}
                        {currentStep === 4 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Preview Ready</Typography>
                                <Box className="glass" sx={{ p: 2, borderRadius: '16px' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Design Summary:</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• Size: {design.frameSize}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• Style: {design.frameStyle}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• Layout: {design.layout}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• Photos: {design.uploadedFileUrls.length}</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>Butter smooth 3D preview is active. Rotate to see the depth.</Typography>
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
                        <Stack direction="row" spacing={2}>
                            <Button fullWidth onClick={() => { setDesign(INITIAL_DESIGN); setHistory([INITIAL_DESIGN]); setHistoryIndex(0); }} sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 'auto', px: 2 }}><RestartAltIcon /></Button>
                            <Button variant="contained" startIcon={<ShoppingCartIcon />} onClick={handleAddToCart} sx={{ borderRadius: '16px', px: 4, fontWeight: 800, whiteSpace: 'nowrap' }}>Add to Cart</Button>
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
