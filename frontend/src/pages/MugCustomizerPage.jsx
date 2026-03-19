import React, { useState, useEffect, useCallback, Suspense, lazy, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, Button, CircularProgress,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Slider, Divider, Paper, Tabs, Tab, Chip, IconButton,
    Tooltip, Alert, Snackbar, Checkbox, FormControlLabel,
    Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import EditIcon from '@mui/icons-material/Edit';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import api, { getPublicUrl } from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { sanitizeUrl } from '../api/security';
import InstagramSupportButton from '../components/Shared/InstagramSupportButton';
import MugCanvasEditor from '../components/Customization/MugBuilder/MugCanvasEditor';
import ImageEnhancerPanel from '../components/Customization/Shared/ImageEnhancerPanel';

import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import PremiumCustomizerLayout from '../components/Customization/Shared/PremiumCustomizerLayout';
import CustomizerStepManager from '../components/Customization/Shared/CustomizerStepManager';
import VisualOptionCard from '../components/Customization/Shared/VisualOptionCard';
import { useCart } from '../store/CartContext';

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
const MugCustomizerPage = () => {
    const { id, cartItemId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { updateCartItem } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Preview mode
    const [previewTab, setPreviewTab] = useState(1); // Default to 3D for "WOW" factor
    const [autoRotate, setAutoRotate] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    // Customization state
    const [mugColor, setMugColor] = useState('White');
    const [mugType, setMugType] = useState('Classic Mug (11oz)');
    const [userImageSrc, setUserImageSrc] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [textProps, setTextProps] = useState({
        text: '',
        fontFamily: 'Poppins',
        fontSize: 28,
        color: '#000000'
    });
    const [imageScale, setImageScale] = useState(100);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [enhancedImageSrc, setEnhancedImageSrc] = useState(null);
    const [itemQuantity, setItemQuantity] = useState(1);

    const [imgProps, setImgProps] = useState({ x: 100, y: 80, width: 300, height: 250, rotation: 0 });
    const [txtTransform, setTxtTransform] = useState({ x: 150, y: 350, rotation: 0, scaleX: 1, scaleY: 1 });

    const [textureCanvas, setTextureCanvas] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const stageRef = useRef(null);

    const [totalPrice, setTotalPrice] = useState(0);
    const [basePrice, setBasePrice] = useState(0);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isUploading, setIsUploading] = useState(false);

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
                                    fontFamily: details.font || 'Poppins',
                                    fontSize: details.text_size || 28,
                                    color: details.text_color || '#000000'
                                });
                            }
                            if (details.image_scale) setImageScale(details.image_scale);
                        }
                    } catch (e) { console.error(e); }
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchProductAndCartItem();
    }, [id, cartItemId]);

    useEffect(() => {
         if (!basePrice || !product) return;
         const schemaTypes = (product?.customization_schema?.mugTypes || MUG_TYPES).filter(t => t.enabled !== false);
         const typeExtra = schemaTypes.find(t => t.value === mugType)?.price || 0;
         setTotalPrice((basePrice + parseFloat(typeExtra)) * itemQuantity);
     }, [mugType, mugColor, basePrice, product, itemQuantity]);

    const handleImageUpload = async (e) => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please login to upload photos.', severity: 'warning' });
            setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
            return;
        }
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setUserImageSrc(reader.result);
            setIsImageLoaded(false);
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('file', file);
        setIsUploading(true);
        try {
            const res = await api.post('/products/upload-customization', formData);
            setUploadedImageUrl(res.data.image_url || res.data.url);
            setSnackbar({ open: true, message: 'Photo uploaded!', severity: 'success' });
            setCurrentStep(2); // Auto-advance to next step
        } catch (err) {
            setSnackbar({ open: true, message: 'Upload failed.', severity: 'error' });
        } finally { setIsUploading(false); }
    };

    const handleAddToCart = async () => {
        if (!user) { setSnackbar({ open: true, message: 'Please login first', severity: 'warning' }); return; }
        setSelectedId(null);
        setSnackbar({ open: true, message: 'Processing...', severity: 'info' });

        let flatDesignUrl = null, modelSnapshotUrl = null;
        try {
            if (stageRef.current) {
                const trs = stageRef.current.find('Transformer');
                trs.forEach(t => t.hide());
                const dataUrl = stageRef.current.toDataURL({ pixelRatio: 3 });
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const fd = new FormData();
                fd.append('file', new File([blob], 'mug_print.png', { type: 'image/png' }));
                const up = await api.post('/products/upload-customization', fd);
                flatDesignUrl = up.data.url || up.data.image_url;
            }
            const threeCanvas = document.getElementById('three-canvas') || document.querySelector('.mug-3d-preview-container canvas');
            if (threeCanvas) {
                const dataUrl = threeCanvas.toDataURL('image/png');
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const fd = new FormData();
                fd.append('file', new File([blob], 'mug_3d.png', { type: 'image/png' }));
                const up = await api.post('/products/upload-customization', fd);
                modelSnapshotUrl = up.data.url || up.data.image_url;
            }
        } catch (e) { console.warn(e); }

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
                image_scale: imageScale,
            };

            if (cartItemId) {
                await updateCartItem(parseInt(cartItemId), { quantity: itemQuantity, customization_details: finalCustomization, preview_image_url: modelSnapshotUrl || flatDesignUrl });
            } else {
                await api.post('/cart/items/', { product_id: parseInt(id), quantity: itemQuantity, preview_image_url: modelSnapshotUrl || flatDesignUrl, customization_details: finalCustomization });
            }
            navigate('/cart');
        } catch (error) { setSnackbar({ open: true, message: 'Failed to add to cart', severity: 'error' }); }
    };

    const handleReset = () => {
        setImgProps({ x: 100, y: 80, width: 300, height: 250, rotation: 0 });
        setTxtTransform({ x: 150, y: 350, rotation: 0, scaleX: 1, scaleY: 1 });
        setImageScale(100);
        setTextProps({ text: '', fontFamily: 'Poppins', fontSize: 28, color: '#000000' });
        setSnackbar({ open: true, message: 'Design reset!', severity: 'info' });
    };

    if (loading) return <LoadingState type="customizer" />;
    if (!product) return <ErrorState message="Product not found" onRetry={() => navigate('/shop')} />;

    const steps = [
        { id: 'type', label: 'Type & Color', icon: <ColorLensIcon /> },
        { id: 'photo', label: 'Upload Photo', icon: <CloudUploadIcon /> },
        { id: 'text', label: 'Add Text', icon: <TextFieldsIcon /> },
        { id: 'review', label: 'Review Design', icon: <ViewInArIcon /> },
    ];

    const activeMugColors = (product?.customization_schema?.mugColors || MUG_COLORS).filter(c => c.enabled !== false);
    const activeMugTypes = (product?.customization_schema?.mugTypes || MUG_TYPES).filter(t => t.enabled !== false);

    return (
        <>
            <PremiumCustomizerLayout
                title={product.name}
                subtitle="Personalize your mug in high-definition 3D"
                previewContent={
                    <>
                        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 1 }}>
                            <Button variant={previewTab === 0 ? "contained" : "outlined"} size="small" startIcon={<EditIcon />} onClick={() => setPreviewTab(0)} sx={{ borderRadius: '12px' }}>2D</Button>
                            <Button variant={previewTab === 1 ? "contained" : "outlined"} size="small" startIcon={<ViewInArIcon />} onClick={() => setPreviewTab(1)} sx={{ borderRadius: '12px' }}>3D</Button>
                        </Box>
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box sx={{ display: previewTab === 0 ? 'block' : 'none' }}>
                                <MugCanvasEditor
                                    userImageSrc={enhancedImageSrc || userImageSrc}
                                    textProps={textProps} mugColor={mugColor}
                                    onStageReady={(s) => stageRef.current = s}
                                    onTextureUpdate={setTextureCanvas}
                                    selectedId={selectedId} setSelectedId={setSelectedId}
                                    imageScale={imageScale} onImageScaleChange={setImageScale}
                                    imgProps={imgProps} setImgProps={setImgProps}
                                    txtTransform={txtTransform} setTxtTransform={setTxtTransform}
                                    isImageLoaded={isImageLoaded} setIsImageLoaded={setIsImageLoaded}
                                />
                            </Box>
                            <Box sx={{ display: previewTab === 1 ? 'block' : 'none', width: '100%', height: '100%' }}>
                                <Suspense fallback={<CircularProgress />}>
                                    <Mug3DPreview
                                        mugColor={mugColor}
                                        insideColor={mugColor.toLowerCase().includes('red') ? '#cc3333' : mugColor.toLowerCase().includes('blue') ? '#3366cc' : null}
                                        textureUrl={textureCanvas?.toDataURL()}
                                        mugType={mugType}
                                        autoRotate={autoRotate}
                                    />
                                </Suspense>
                            </Box>
                        </Box>
                        {previewTab === 1 && (
                            <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}>
                                <Button variant="contained" size="small" onClick={() => setAutoRotate(!autoRotate)} sx={{ borderRadius: '10px', bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>{autoRotate ? "Pause" : "Rotate"}</Button>
                            </Box>
                        )}
                    </>
                }
                controlContent={
                    <CustomizerStepManager steps={steps} activeStep={currentStep} onStepChange={setCurrentStep}>
                        {currentStep === 0 && (
                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="h3" sx={{ mb: 2 }}>Mug Type</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2 }}>
                                        {activeMugTypes.map(t => (
                                            <VisualOptionCard key={t.value} label={t.label} value={t.value} selected={mugType === t.value} onClick={setMugType} price={t.price} />
                                        ))}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="h3" sx={{ mb: 2 }}>Base Color</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        {activeMugColors.map(c => (
                                            <Box key={c.value} onClick={() => setMugColor(c.value)} sx={{
                                                width: 50, height: 50, borderRadius: '50%', bgcolor: c.hex, border: '2px solid',
                                                borderColor: mugColor === c.value ? 'primary.main' : 'rgba(255,255,255,0.1)', cursor: 'pointer',
                                                transition: '0.2s', transform: mugColor === c.value ? 'scale(1.1)' : 'scale(1)',
                                                boxShadow: mugColor === c.value ? '0 0 15px rgba(123, 97, 255, 0.5)' : 'none'
                                            }} />
                                        ))}
                                    </Box>
                                </Box>
                            </Stack>
                        )}
                        {currentStep === 1 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Upload Memory</Typography>
                                <Button fullWidth variant="outlined" component="label" startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />} sx={{ py: 6, borderStyle: 'dashed', borderRadius: '20px', borderColor: 'rgba(255,255,255,0.2)' }}>
                                    {isUploading ? "Uploading..." : "Click to select a photo"}
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                </Button>
                                {userImageSrc && (
                                    <Box className="glass" sx={{ p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 60, height: 60, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {(() => {
                                            const safeMugImg = sanitizeUrl(userImageSrc);
                                            return <img src={safeMugImg} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                        })()}
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="caption">Scale: {imageScale}%</Typography>
                                        <Slider value={imageScale} min={20} max={200} onChange={(_,v) => setImageScale(v)} size="small" />
                                    </Box>
                                </Box>
                                )}
                                {userImageSrc && <ImageEnhancerPanel originalImageSrc={userImageSrc} onEnhancedImage={setEnhancedImageSrc} />}
                            </Stack>
                        )}
                        {currentStep === 2 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Add Message</Typography>
                                <TextField fullWidth label="Your Text" variant="outlined" value={textProps.text} onChange={(e) => setTextProps(p => ({ ...p, text: e.target.value }))} placeholder="Type something..." />
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Font</InputLabel>
                                        <Select value={textProps.fontFamily} label="Font" onChange={(e) => setTextProps(p => ({ ...p, fontFamily: e.target.value }))}>
                                            {FONTS.map(f => <MenuItem key={f} value={f} sx={{ fontFamily: f }}>{f}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {TEXT_COLORS.slice(0, 4).map(c => (
                                            <Box key={c.value} onClick={() => setTextProps(p => ({ ...p, color: c.value }))} sx={{
                                                width: 30, height: 30, borderRadius: '50%', bgcolor: c.value, cursor: 'pointer',
                                                border: textProps.color === c.value ? '2px solid #fff' : 'none'
                                            }} />
                                        ))}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption">Font Size: {textProps.fontSize}px</Typography>
                                    <Slider value={textProps.fontSize} min={12} max={72} onChange={(_,v) => setTextProps(p => ({ ...p, fontSize: v }))} size="small" />
                                </Box>
                            </Stack>
                        )}
                        {currentStep === 3 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Perfect!</Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary' }}>Review your customization in the 3D viewer. You can rotate and zoom to see every detail before adding to cart.</Typography>
                                <Box className="glass" sx={{ p: 2, borderRadius: '16px' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Design Summary:</Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>• {mugType}</Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>• {mugColor} Color</Typography>
                                    {textProps.text && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>• Text: "{textProps.text}"</Typography>}
                                    {userImageSrc && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>• Custom Photo Included</Typography>}
                                </Box>
                            </Stack>
                        )}
                    </CustomizerStepManager>
                }
                actionBarContent={
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Price</Typography>
                                <Typography sx={{ color: '#fff', fontSize: '24px', fontWeight: 800 }}>₹{totalPrice.toFixed(0)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '100px', px: 1 }}>
                                <IconButton size="small" onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))} sx={{ color: '#fff' }}><RemoveIcon fontSize="small" /></IconButton>
                                <Typography sx={{ mx: 1.5, fontWeight: 700 }}>{itemQuantity}</Typography>
                                <IconButton size="small" onClick={() => setItemQuantity(itemQuantity + 1)} sx={{ color: '#fff' }}><AddIcon fontSize="small" /></IconButton>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Button fullWidth onClick={handleReset} sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 'auto', px: 2 }}><RestartAltIcon /></Button>
                            <Button variant="contained" startIcon={<ShoppingCartIcon />} onClick={handleAddToCart} sx={{ height: '56px', borderRadius: '16px', fontSize: '15px', fontWeight: 600, background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', boxShadow: '0 8px 24px rgba(236,72,153,0.3)', textTransform: 'none', letterSpacing: '0.5px', px: 4, whiteSpace: 'nowrap' }}>Add to Cart</Button>
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

export default MugCustomizerPage;
