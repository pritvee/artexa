import React, { useState, useEffect, useCallback, Suspense, lazy, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, Button, CircularProgress,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Slider, Divider, Paper, Tabs, Tab, Chip, IconButton,
    Tooltip, Alert, Snackbar, Checkbox, FormControlLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import EditIcon from '@mui/icons-material/Edit';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import api, { getPublicUrl } from '../api/axios';
import { useAuth } from '../store/AuthContext';
import InstagramSupportButton from '../components/Shared/InstagramSupportButton';
import MugCanvasEditor from '../components/Customization/MugBuilder/MugCanvasEditor';
import ImageEnhancerPanel from '../components/Customization/Shared/ImageEnhancerPanel';

const Mug3DPreview = lazy(() => import('../components/Customization/MugBuilder/Mug3DPreview'));

/* ─── Constants ─── */
const MUG_COLORS = [
    { label: 'White', value: 'White', hex: '#f5f5f0', textColor: '#333' },
    { label: 'Black', value: 'Black', hex: '#222222', textColor: '#fff' },
    { label: 'Red Inside', value: 'Red Inside', hex: '#cc3333', textColor: '#fff' },
    { label: 'Blue Inside', value: 'Blue Inside', hex: '#3366cc', textColor: '#fff' }
];

const MUG_TYPES = [
    { label: 'Classic Mug (11oz)', value: 'Classic Mug (11oz)', price: 0 },
    { label: 'Large Mug (15oz)', value: 'Large Mug (15oz)', price: 3 },
    { label: 'Travel Mug', value: 'Travel Mug', price: 8 },
];

const FONTS = [
    'Arial', 'Times New Roman', 'Courier New', 'Impact',
    'Georgia', 'Verdana', 'Comic Sans MS', 'Poppins'
];

const TEXT_COLORS = [
    { label: 'Black', value: '#000000' },
    { label: 'White', value: '#FFFFFF' },
    { label: 'Red', value: '#FF0000' },
    { label: 'Blue', value: '#0000FF' },
    { label: 'Gold', value: '#FFD700' },
    { label: 'Pink', value: '#FF69B4' },
    { label: 'Green', value: '#228B22' },
];

/* ─── Main Component ─── */
import { useCart } from '../store/CartContext';

const MugCustomizerPage = () => {
    const { id, cartItemId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { updateCartItem } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Preview mode
    const [previewTab, setPreviewTab] = useState(0); // 0 = 2D Editor, 1 = 3D Preview
    const [autoRotate, setAutoRotate] = useState(true);

    // Customization state
    const [mugColor, setMugColor] = useState('White');
    const [mugType, setMugType] = useState('Classic Mug (11oz)');
    const [userImageSrc, setUserImageSrc] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [textProps, setTextProps] = useState({
        text: '',
        fontFamily: 'Arial',
        fontSize: 28,
        color: '#000000'
    });
    const [imageScale, setImageScale] = useState(100);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [enhancedImageSrc, setEnhancedImageSrc] = useState(null); // Result from AI enhancer
    const [itemQuantity, setItemQuantity] = useState(1);

    // Persisted transform states so they survive tab switches
    const [imgProps, setImgProps] = useState({
        x: 100, y: 80, width: 300, height: 250, rotation: 0
    });
    const [txtTransform, setTxtTransform] = useState({
        x: 150, y: 350, rotation: 0, scaleX: 1, scaleY: 1
    });

    const handleResetDesign = () => {
        setImgProps({ x: 100, y: 80, width: 300, height: 250, rotation: 0 });
        setTxtTransform({ x: 150, y: 350, rotation: 0, scaleX: 1, scaleY: 1 });
        setImageScale(100);
        setSnackbar({ open: true, message: 'Design positions reset!', severity: 'info' });
    };

    // 3D texture canvas & Konva Stage ref for HQ snapshots
    const [textureCanvas, setTextureCanvas] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const stageRef = useRef(null);

    // Pricing
    const [totalPrice, setTotalPrice] = useState(0);
    const [basePrice, setBasePrice] = useState(0);

    // Feedback
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isUploading, setIsUploading] = useState(false);

    // Fetch product
    useEffect(() => {
        const fetchProductAndCartItem = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
                setBasePrice(response.data.price);
                setTotalPrice(response.data.price);

                const schemaColors = (response.data.customization_schema?.mugColors || MUG_COLORS).filter(c => c.enabled !== false);
                const schemaTypes = (response.data.customization_schema?.mugTypes || MUG_TYPES).filter(t => t.enabled !== false);
                if (schemaColors.length > 0) setMugColor(schemaColors[0].value);
                if (schemaTypes.length > 0) setMugType(schemaTypes[0].value);

                if (cartItemId) {
                    try {
                        const cartRes = await api.get('/cart/');
                        const item = cartRes.data.items.find(i => i.id === parseInt(cartItemId));
                        if (item && item.customization_details) {
                            const details = item.customization_details;
                            if (details.mug_color) setMugColor(details.mug_color);
                            if (details.mug_type) setMugType(details.mug_type);
                             if (details.image) {
                                 const imgUrl = details.image.startsWith('data:') ? details.image : getPublicUrl(details.image);
                                 setUserImageSrc(imgUrl);
                                 setUploadedImageUrl(details.image);
                             }
                             if (item.quantity) setItemQuantity(item.quantity);
                            if (details.text) {
                                setTextProps({
                                    text: details.text || '',
                                    fontFamily: details.font || 'Arial',
                                    fontSize: details.text_size || 28,
                                    color: details.text_color || '#000000'
                                });
                            }
                            if (details.image_scale) setImageScale(details.image_scale);
                        }
                    } catch (e) {
                        console.error("Failed to fetch cart item for re-edit", e);
                    }
                }
            } catch (error) {
                console.error('Error fetching product', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductAndCartItem();
    }, [id, cartItemId]);

    // Dynamic pricing
    useEffect(() => {
         if (!basePrice || !product) return;
         const schemaTypes = (product?.customization_schema?.mugTypes || MUG_TYPES).filter(t => t.enabled !== false);
         const typeExtra = schemaTypes.find(t => t.value === mugType)?.price || 0;
         setTotalPrice((basePrice + parseFloat(typeExtra)) * itemQuantity);
     }, [mugType, mugColor, basePrice, product, itemQuantity]);

    // Photo upload handler
    const handleImageUpload = async (e) => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please login to upload photos.', severity: 'warning' });
            setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
            return;
        }
        const file = e.target.files[0];
        if (!file) return;

        // Local preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setUserImageSrc(reader.result);
            setIsImageLoaded(false); // Will trigger auto-resize in Canvas component
        };
        reader.readAsDataURL(file);

        // Backend upload
        const formData = new FormData();
        formData.append('file', file);
        setIsUploading(true);
        try {
            const res = await api.post('/products/upload-customization', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadedImageUrl(res.data.image_url || res.data.url);
            setSnackbar({ open: true, message: 'Photo uploaded successfully!', severity: 'success' });
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'Upload failed. Please try again.', severity: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    // Stage ready callback - receive stage for snapshots
    const handleStageReady = useCallback((stage) => {
        stageRef.current = stage;
    }, []);

    // Canvas update callback - receive texture for 3D preview
    const handleTextureUpdate = useCallback((canvas) => {
        setTextureCanvas(canvas);
    }, []);

    const uploadContextCanvas = async (source, filename, isStage = false) => {
        if (!source) return null;
        try {
            let canvas = null;
            let dataUrl = null;

            if (isStage) {
                // Konva Stage (2D)
                const transformers = source.find('Transformer');
                transformers.forEach(s => s.hide());
                const bleeds = source.find('Rect');
                bleeds.forEach(r => r.hide());
                dataUrl = source.toDataURL({ pixelRatio: 3, mimeType: 'image/png' });
                transformers.forEach(s => s.show());
                bleeds.forEach(r => r.show());
            } else {
                // HTML Canvas or R3F Container
                if (source instanceof HTMLCanvasElement) {
                    canvas = source;
                } else if (source.domElement instanceof HTMLCanvasElement) {
                    canvas = source.domElement; // R3F gl
                } else {
                    // It might be the DIV container from R3F
                    canvas = source.querySelector('canvas');
                }

                if (!canvas || typeof canvas.toDataURL !== 'function') {
                    console.error("Source is not a valid HTMLCanvasElement and contains no canvas");
                    return null;
                }
                dataUrl = canvas.toDataURL('image/png');
            }

            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], filename, { type: mime });
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/products/upload-customization', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.image_url || res.data.url;
        } catch (e) {
            console.error("Snapshot upload failed", e);
            return null;
        }
    };

    // Add to cart
    const handleAddToCart = async () => {
        // Deselect elements so blue lines (transformers) are not in the snapshot
        setSelectedId(null);

        if (!user) {
            setSnackbar({ open: true, message: 'Please login to add items to cart.', severity: 'warning' });
            setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
            return;
        }

        setSnackbar({ open: true, message: 'Generating HQ Print files...', severity: 'info' });

        let flatDesignUrl = null;
        let modelSnapshotUrl = null;

        try {
            if (stageRef.current) {
                flatDesignUrl = await uploadContextCanvas(stageRef.current, 'flat_texture.png', true);
            } else if (textureCanvas) {
                flatDesignUrl = await uploadContextCanvas(textureCanvas, 'flat_texture.png', false);
            }
            const threeCanvas = document.getElementById('three-canvas');
            if (threeCanvas) modelSnapshotUrl = await uploadContextCanvas(threeCanvas, '3d_render.png', false);
        } catch (e) {
            console.warn("Could not capture preview snapshots.");
        }

        setSnackbar({ open: true, message: 'Processing cart...', severity: 'info' });

        try {
            const finalCustomization = {
                product: 'custom_mug',
                image: uploadedImageUrl || null,
                flat_design_image: flatDesignUrl,
                model_3d_screenshot: modelSnapshotUrl,
                text: textProps.text,
                font: textProps.fontFamily,
                text_color: textProps.color,
                text_size: textProps.fontSize,
                mug_color: mugColor,
                mug_type: mugType,
                model: 'Ceramic-Mug-11oz',
                placement: 'center',
                image_scale: imageScale,
            };

                    if (cartItemId) {
                 await updateCartItem(parseInt(cartItemId), {
                     customization_details: finalCustomization,
                     quantity: itemQuantity,
                     preview_image_url: modelSnapshotUrl || flatDesignUrl
                 });
                 setSnackbar({ open: true, message: 'Mug customization updated!', severity: 'success' });
             } else {
                 await api.post('/cart/items/', {
                     product_id: parseInt(id),
                     quantity: itemQuantity,
                     preview_image_url: modelSnapshotUrl || flatDesignUrl,
                     customization_details: finalCustomization
                 });
                 setSnackbar({ open: true, message: 'Customized mug added to cart!', severity: 'success' });
             }
            setTimeout(() => navigate('/cart'), 1500);
        } catch (error) {
            console.error('Failed to process cart request', error);
            setSnackbar({ open: true, message: 'Failed to add to cart. Please try again.', severity: 'error' });
        }
    };

    /* ─── Helpers ─── */
    const getInsideColor = () => {
        if (mugColor.toLowerCase().includes('red')) return '#cc3333';
        if (mugColor.toLowerCase().includes('blue')) return '#3366cc';
        return null;
    };

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress size={48} /></Container>;
    if (!product) return <Container sx={{ py: 8 }}><Typography variant="h5">Product not found.</Typography></Container>;

    const activeMugColors = (product?.customization_schema?.mugColors || MUG_COLORS).filter(c => c.enabled !== false);
    const activeMugTypes = (product?.customization_schema?.mugTypes || MUG_TYPES).filter(t => t.enabled !== false);

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    ☕ Customize Your Mug
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Design your perfect mug — upload photos, add text, pick colors, and preview in 3D!
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* ─── LEFT: Preview Panel ─── */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        {/* Tab Switcher & Header Controls */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
                            <Tabs
                                value={previewTab}
                                onChange={(_, v) => setPreviewTab(v)}
                                sx={{ '& .MuiTab-root': { fontWeight: 600, py: 1.5 } }}
                            >
                                <Tab icon={<EditIcon />} label="2D Editor" iconPosition="start" />
                                <Tab icon={<ViewInArIcon />} label="3D Preview" iconPosition="start" />
                            </Tabs>
                            <Tooltip title="Reset Image & Text Positions">
                                <Button size="small" variant="outlined" startIcon={<RestartAltIcon />} onClick={handleResetDesign}>
                                    Reset Layout
                                </Button>
                            </Tooltip>
                        </Box>

                        {/* Preview Content */}
                        <Box className="preview3d glass" sx={{
                            position: 'relative',
                            width: '100%',
                            minHeight: '520px',
                            bgcolor: '#0a0a1a',
                            backgroundImage: previewTab === 0 ? 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)' : 'none',
                            backgroundSize: '24px 24px',
                            backgroundPosition: 'center center',
                            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8)',
                            transition: 'all 0.3s ease',
                            overflow: 'hidden',
                            borderRadius: '12px'
                        }}>
                            {/* Layer 1: 2D Editor */}
                            <Box 
                                inert={previewTab !== 0 ? '' : undefined}
                                sx={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    display: previewTab === 0 ? 'flex' : 'none', 
                                    alignItems: 'center', justifyContent: 'center',
                                    zIndex: previewTab === 0 ? 2 : 1,
                                    transition: 'opacity 0.3s'
                                }}
                            >
                                <MugCanvasEditor
                                    userImageSrc={enhancedImageSrc || userImageSrc}
                                    textProps={textProps}
                                    mugColor={mugColor}
                                    onStageReady={handleStageReady}
                                    onTextureUpdate={handleTextureUpdate}
                                    selectedId={selectedId}
                                    setSelectedId={setSelectedId}
                                    imageScale={imageScale}
                                    onImageScaleChange={setImageScale}
                                    imgProps={imgProps}
                                    setImgProps={setImgProps}
                                    txtTransform={txtTransform}
                                    setTxtTransform={setTxtTransform}
                                    isImageLoaded={isImageLoaded}
                                    setIsImageLoaded={setIsImageLoaded}
                                />
                            </Box>

                            {/* Layer 2: 3D Preview (Always Mounted for snapshot processing) */}
                            <Box 
                                inert={previewTab !== 1 ? '' : undefined}
                                sx={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    display: previewTab === 1 ? 'block' : 'none',
                                    zIndex: previewTab === 1 ? 2 : 1,
                                    transition: 'opacity 0.3s'
                                }}
                            >
                                <Suspense fallback={
                                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress sx={{ color: '#fff' }} />
                                        <Typography sx={{ color: '#aaa', mt: 2 }}>Loading 3D Preview...</Typography>
                                    </Box>
                                }>
                                    <Box sx={{ width: '100%', height: '100%' }}>
                                        <Mug3DPreview
                                            mugColor={mugColor}
                                            insideColor={getInsideColor()}
                                            textureCanvas={textureCanvas}
                                            mugType={mugType}
                                            autoRotate={autoRotate}
                                        />
                                    </Box>
                                </Suspense>
                            </Box>
                            
                            {previewTab === 1 && (
                                <Box sx={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10 }}>
                                    <FormControlLabel
                                        control={<Checkbox checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: '#667eea' } }} />}
                                        label={<Typography sx={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>Auto-Rotate</Typography>}
                                        sx={{ bgcolor: 'rgba(0,0,0,0.6)', pl: 1, pr: 2, m: 0, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' }}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Hint */}
                        <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary">
                                {previewTab === 0
                                    ? '💡 Click elements to select. Drag to move. Use handles to resize & rotate.'
                                    : '💡 Click & drag to rotate the mug. Scroll to zoom. Design updates live!'
                                }
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* ─── RIGHT: Controls Panel ─── */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ position: 'sticky', top: 80 }}>
                        {/* Product Info */}
                        <Paper elevation={0} className="glass" sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography variant="h5" fontWeight="bold">{product.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 1 }}>
                                <Typography variant="h4" color="primary" fontWeight="bold" sx={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    ₹{totalPrice.toFixed(2)}
                                </Typography>
                                {totalPrice > basePrice && (
                                    <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                        ₹{basePrice.toFixed(2)}
                                    </Typography>
                                )}
                            </Box>
                        </Paper>

                        {/* Controls */}
                        <Paper elevation={0} className="glass" sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
                            {/* ── Photo Upload ── */}
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    📸 Upload Photo
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    component="label" 
                                    fullWidth 
                                    startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />} 
                                    disabled={isUploading}
                                    sx={{ py: 1.5, borderStyle: 'dashed', borderRadius: '12px' }}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload New Photo'}
                                    <input type="file" hidden accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} disabled={isUploading} />
                                </Button>
                                {userImageSrc && (
                                    <Box sx={{ mt: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" gutterBottom>
                                            Image Scale: {imageScale}%
                                        </Typography>
                                        <Slider
                                            value={imageScale}
                                            onChange={(_, v) => setImageScale(v)}
                                            min={20}
                                            max={200}
                                            step={5}
                                            size="small"
                                            valueLabelDisplay="auto"
                                        />
                                    </Box>
                                )}
                            </Box>

                            {/* AI Image Enhancer Panel */}
                            {userImageSrc && (
                                <ImageEnhancerPanel
                                    originalImageSrc={userImageSrc}
                                    onEnhancedImage={(src) => {
                                        setEnhancedImageSrc(src);
                                        setIsImageLoaded(false); // trigger re-fit in canvas
                                    }}
                                />
                            )}

                            <Divider />

                            {/* ── Custom Text ── */}
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    <TextFieldsIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                    Add Custom Text
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Your Text"
                                    variant="outlined"
                                    placeholder="e.g. Happy Birthday!"
                                    value={textProps.text}
                                    onChange={(e) => setTextProps(p => ({ ...p, text: e.target.value }))}
                                    sx={{ mb: 2 }}
                                    size="small"
                                />
                                <Grid container spacing={1.5}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Font</InputLabel>
                                            <Select
                                                value={textProps.fontFamily}
                                                label="Font"
                                                onChange={(e) => setTextProps(p => ({ ...p, fontFamily: e.target.value }))}
                                            >
                                                {FONTS.map(f => (
                                                    <MenuItem key={f} value={f} sx={{ fontFamily: f }}>
                                                        {f}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Color</InputLabel>
                                            <Select
                                                value={textProps.color}
                                                label="Color"
                                                onChange={(e) => setTextProps(p => ({ ...p, color: e.target.value }))}
                                            >
                                                {TEXT_COLORS.map(c => (
                                                    <MenuItem key={c.value} value={c.value}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{
                                                                width: 16, height: 16, borderRadius: '50%',
                                                                bgcolor: c.value, border: '1px solid #ccc'
                                                            }} />
                                                            {c.label}
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Font Size: {textProps.fontSize}px
                                    </Typography>
                                    <Slider
                                        value={textProps.fontSize}
                                        onChange={(_, v) => setTextProps(p => ({ ...p, fontSize: v }))}
                                        min={12}
                                        max={72}
                                        step={2}
                                        size="small"
                                        valueLabelDisplay="auto"
                                    />
                                </Box>
                            </Box>

                            <Divider />

                            {/* ── Mug Color ── */}
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    <ColorLensIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                    Mug Color
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {activeMugColors.map(c => (
                                        <Chip
                                            key={c.value}
                                            label={c.label}
                                            onClick={() => setMugColor(c.value)}
                                            variant={mugColor === c.value ? 'filled' : 'outlined'}
                                            sx={{
                                                bgcolor: mugColor === c.value ? c.hex : 'transparent',
                                                color: mugColor === c.value ? c.textColor : 'text.primary',
                                                borderColor: c.hex,
                                                fontWeight: mugColor === c.value ? 700 : 400,
                                                transition: 'all 0.2s',
                                                '&:hover': { bgcolor: c.hex, color: c.textColor, transform: 'scale(1.05)' }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            <Divider />

                            {/* ── Mug Type ── */}
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    ☕ Mug Type
                                </Typography>
                                <FormControl fullWidth size="small">
                                        <Select
                                            value={mugType}
                                            onChange={(e) => setMugType(e.target.value)}
                                        >
                                            {activeMugTypes.map(t => (
                                                <MenuItem key={t.value} value={t.value}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                        <Typography variant="body2">{t.label}</Typography>
                                                        {parseFloat(t.price) > 0 && (
                                                            <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 700 }}>
                                                                +₹{t.price}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                </FormControl>
                            </Box>

                            <Divider />

                            {/* ── Instagram Support ── */}
                            <InstagramSupportButton />

                            {/* ── Add to Cart ─ */}
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                startIcon={<ShoppingCartIcon />}
                                onClick={handleAddToCart}
                                sx={{
                                    py: 1.8,
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                                    boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #6D28D9 0%, #DB2777 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 20px rgba(124, 58, 237, 0.35)',
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                Add to Cart — ₹{totalPrice.toFixed(2)}
                            </Button>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MugCustomizerPage;
