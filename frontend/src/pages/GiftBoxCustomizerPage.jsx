import React, { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, Button, Paper, Tabs, Tab,
    Chip, Stack, Divider, TextField, Select, MenuItem, FormControl,
    InputLabel, IconButton, Tooltip, Alert, Snackbar, CircularProgress, Slider
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EditIcon from '@mui/icons-material/Edit';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import InstagramIcon from '@mui/icons-material/Instagram';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InventoryIcon from '@mui/icons-material/Inventory';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import GiftBoxCanvasEditor from '../components/Customization/GiftBox/GiftBoxCanvasEditor';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import api, { getPublicUrl } from '../api/axios';

import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import PremiumCustomizerLayout from '../components/Customization/Shared/PremiumCustomizerLayout';
import CustomizerStepManager from '../components/Customization/Shared/CustomizerStepManager';
import VisualOptionCard from '../components/Customization/Shared/VisualOptionCard';
import InstagramSupportButton from '../components/Shared/InstagramSupportButton';

const GiftBox3DPreview = lazy(() => import('../components/Customization/GiftBox/GiftBox3DPreview'));

/* ─── Constants ─── */
const BOX_TYPES = [
    { label: 'Small Gift Box', value: 'small', price: 199, icon: '📦', w: 90, d: 80, h: 60 },
    { label: 'Medium Gift Box', value: 'medium', price: 349, icon: '📦', w: 110, d: 100, h: 75 },
    { label: 'Large Gift Box', value: 'large', price: 549, icon: '📦', w: 140, d: 125, h: 95 }
];

const MATERIALS = [
    { label: 'Kraft Paper', value: 'kraft', price: 0 },
    { label: 'Premium Matte', value: 'matte', price: 50 },
    { label: 'Glossy Finish', value: 'glossy', price: 50 },
    { label: 'Velvet Texture', value: 'velvet', price: 150 },
    { label: 'Luxury Gold Foil', value: 'gold_foil', price: 200 }
];

const BOX_COLORS = [
    { label: 'Classic Red', value: '#e53935', swatch: '#e53935' },
    { label: 'Royal Blue', value: '#1565C0', swatch: '#1565C0' },
    { label: 'Midnight Black', value: '#1a1a2e', swatch: '#1a1a2e' },
    { label: 'Blush Pink', value: '#F48FB1', swatch: '#F48FB1' },
    { label: 'Mint Green', value: '#A5D6A7', swatch: '#A5D6A7' },
    { label: 'Gold', value: '#D4AF37', swatch: '#D4AF37' },
    { label: 'Kraft', value: '#C19A6B', swatch: '#C19A6B' }
];

const DECORATIONS = [
    { type: 'ribbon_cross', label: 'Cross Ribbon', category: 'Ribbon', price: 60, emoji: '🎀' },
    { type: 'ribbon_vert', label: 'Vertical Ribbon', category: 'Ribbon', price: 40, emoji: '🎀' },
    { type: 'ribbon_horiz', label: 'Horizontal Ribbon', category: 'Ribbon', price: 40, emoji: '🎀' },
    { type: 'sticker_bday', label: 'Birthday Sticker', category: 'Sticker', price: 20, emoji: '🎂' },
    { type: 'sticker_love', label: 'Love Sticker', category: 'Sticker', price: 20, emoji: '❤️' },
    { type: 'sticker_ty', label: 'Thank You Sticker', category: 'Sticker', price: 20, emoji: '🙏' },
    { type: 'flower_topper', label: 'Flower Topper', category: 'Top Decor', price: 99, emoji: '🌸' },
    { type: 'wax_seal', label: 'Wax Seal', category: 'Top Decor', price: 49, emoji: '🏮' },
    { type: 'tag_hanging', label: 'Hanging Tag', category: 'Tags', price: 35, emoji: '🏷️' }
];

const GIFT_ITEMS = [
    { type: 'dairy_milk', name: 'Dairy Milk', price: 50, emoji: '🍫' },
    { type: 'ferrero_rocher', name: 'Ferrero Rocher', price: 50, emoji: '🍬' },
    { type: 'teddy_bear', name: 'Teddy Bear', price: 50, emoji: '🧸' },
    { type: 'chocolates', name: 'Assorted Chocolates', price: 250, emoji: '🍫' },
    { type: 'perfume', name: 'Luxury Perfume', price: 899, emoji: '🌺' },
    { type: 'crystal_cube', name: 'Luxury Magic Gift Box', price: 499, emoji: '🎁' },
];

/* ─── Main Component ─── */
const GiftBoxCustomizerPage = () => {
    const { id, cartItemId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { updateCartItem } = useCart();

    const [boxType, setBoxType] = useState('small');
    const [material, setMaterial] = useState('matte');
    const [boxColor, setBoxColor] = useState('#1a1a2e');
    const [foamColor, setFoamColor] = useState('#f0dde8');
    const [activeFace, setActiveFace] = useState('insideBox');
    const [quantity, setQuantity] = useState(1);
    const [faceDesigns, setFaceDesigns] = useState({ insideBox: [] });
    const [selectedId, setSelectedId] = useState(null);
    const [previewTab, setPreviewTab] = useState(1); 
    const [currentStep, setCurrentStep] = useState(0);
    const [ribbonEnabled, setRibbonEnabled] = useState(true);
    const [ribbonStyle, setRibbonStyle] = useState('full'); 
    const [ribbonColor, setRibbonColor] = useState('#FFD93D');
    const [ribbonWidth, setRibbonWidth] = useState(20);
    const [showBow, setShowBow] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isUploading, setIsUploading] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const stageRef = useRef(null);

    const [config, setConfig] = useState({
        boxTypes: BOX_TYPES,
        materials: MATERIALS,
        decorations: DECORATIONS,
        items: GIFT_ITEMS
    });

    useEffect(() => {
        const fetchProductAndCartItem = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
                if (res.data.customization_schema) {
                    const schema = res.data.customization_schema;
                    const finalBoxTypes = ['small', 'medium', 'large'].map(val => {
                        const def = BOX_TYPES.find(b => b.value === val);
                        const sc = (schema.boxTypes || []).find(s => s.value === val);
                        return sc ? { ...def, ...sc } : def;
                    }).filter(Boolean);
                    setConfig(prev => ({ 
                        ...prev, 
                        boxTypes: finalBoxTypes,
                        materials: schema.materials ? [...MATERIALS, ...schema.materials] : MATERIALS,
                        decorations: schema.decorations ? [...DECORATIONS, ...schema.decorations] : DECORATIONS,
                        items: schema.items ? [...GIFT_ITEMS, ...schema.items] : GIFT_ITEMS
                    }));
                }

                if (cartItemId) {
                    try {
                        const cartRes = await api.get('/cart/');
                        const item = cartRes.data.items.find(i => i.id === parseInt(cartItemId));
                        if (item && item.customization_details) {
                            const details = item.customization_details;
                            if (details.box_type) setBoxType(details.box_type);
                            if (details.material) setMaterial(details.material);
                            if (details.box_color) setBoxColor(details.box_color);
                            if (details.foam_color) setFoamColor(details.foam_color);
                            if (item.quantity) setQuantity(item.quantity);
                            if (details.face_designs) {
                                const restored = { ...details.face_designs };
                                if (restored.insideBox) {
                                    restored.insideBox = restored.insideBox.map(d => ({
                                        ...d,
                                        photoUrl: d.photoUrl ? (d.photoUrl.startsWith('data:') ? d.photoUrl : getPublicUrl(d.photoUrl)) : null,
                                        originalPhotoPath: d.photoUrl
                                    }));
                                }
                                setFaceDesigns(restored);
                            }
                            if (details.ribbon) {
                                setRibbonEnabled(details.ribbon.enabled);
                                setRibbonStyle(details.ribbon.style);
                                setRibbonColor(details.ribbon.color);
                                setRibbonWidth(details.ribbon.width);
                                setShowBow(details.ribbon.showBow);
                            }
                        }
                    } catch (e) { console.error(e); }
                }
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchProductAndCartItem();
    }, [id, cartItemId]);

    const activeBoxType = config.boxTypes.find(b => b.value === boxType) || config.boxTypes[0];
    const totalPrice = (activeBoxType.price + faceDesigns.insideBox.reduce((sum, item) => {
        const cfg = config.items.find(i => i.type === item.type);
        return sum + (cfg?.price || 0) + (item.photoUrl ? 49 : 0);
    }, 0) + (ribbonEnabled ? 50 : 0)) * quantity;

    const handleAddItem = (type) => {
        const newItem = { id: `item-${Date.now()}`, type, x: 50 + Math.random() * 200, y: 50 + Math.random() * 200, rotation: 0, scale: 0.35, photoUrl: null };
        setFaceDesigns(prev => ({ ...prev, insideBox: [...prev.insideBox, newItem] }));
        setSnackbar({ open: true, message: 'Item added!', severity: 'success' });
    };

    const handlePhotoUpload = async (e, itemId) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/products/upload-customization', formData);
            const url = res.data.image_url || res.data.url;
            setFaceDesigns(prev => ({
                ...prev,
                insideBox: prev.insideBox.map(item => item.id === itemId ? { ...item, photoUrl: getPublicUrl(url), originalPhotoPath: url } : item)
            }));
            setSnackbar({ open: true, message: 'Photo added to item!', severity: 'success' });
        } catch (err) { setSnackbar({ open: true, message: 'Upload failed', severity: 'error' }); } finally { setIsUploading(false); }
    };

    const handleAddToCart = async () => {
        if (!user) { navigate('/login'); return; }
        setSnackbar({ open: true, message: 'Processing...', severity: 'info' });
        let previewUrl = null;
        try {
            const canvas = document.querySelector('.preview3d canvas');
            if (canvas) {
                const dataUrl = canvas.toDataURL('image/png');
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const fd = new FormData();
                fd.append('file', new File([blob], 'giftbox_preview.png', { type: 'image/png' }));
                const up = await api.post('/products/upload-customization', fd);
                previewUrl = up.data.url || up.data.image_url;
            }
        } catch (e) { console.warn(e); }

        const customization_details = {
            product: 'custom_gift_box',
            box_type: boxType,
            material,
            box_color: boxColor,
            foam_color: foamColor,
            face_designs: {
                insideBox: faceDesigns.insideBox.map(d => ({ ...d, photoUrl: d.originalPhotoPath || d.photoUrl }))
            },
            ribbon: { enabled: ribbonEnabled, style: ribbonStyle, color: ribbonColor, width: ribbonWidth, showBow },
            quantity
        };

        try {
            if (cartItemId) {
                await updateCartItem(parseInt(cartItemId), { quantity, customization_details, preview_image_url: previewUrl });
            } else {
                await api.post('/cart/items/', { product_id: parseInt(id), quantity, preview_image_url: previewUrl, customization_details });
            }
            navigate('/cart');
        } catch (err) { setSnackbar({ open: true, message: 'Failed to add to cart', severity: 'error' }); }
    };

    if (loading) return <LoadingState type="customizer" />;
    if (!product) return <ErrorState message="Product not found" onRetry={() => navigate('/shop')} />;

    const steps = [
        { id: 'box', label: 'Box Type', icon: <InventoryIcon /> },
        { id: 'items', label: 'Gift Items', icon: <AddIcon /> },
        { id: 'decor', label: 'Ribbons', icon: <ColorLensIcon /> },
        { id: 'style', label: 'Aesthetics', icon: <AutoFixHighIcon /> },
        { id: 'review', label: 'Review', icon: <ViewInArIcon /> },
    ];

    return (
        <>
            <PremiumCustomizerLayout
                title={product.name}
                subtitle="Curate the perfect luxury gift box"
                previewContent={
                    <>
                        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 1 }}>
                            <Button variant={previewTab === 0 ? "contained" : "outlined"} size="small" onClick={() => setPreviewTab(0)} sx={{ borderRadius: '12px' }}>2D Designer</Button>
                            <Button variant={previewTab === 1 ? "contained" : "outlined"} size="small" onClick={() => setPreviewTab(1)} sx={{ borderRadius: '12px' }}>3D Preview</Button>
                        </Box>
                        <Box sx={{ width: '100%', height: '100%' }}>
                            <Box sx={{ display: previewTab === 0 ? 'block' : 'none', p: 4, height: '100%' }}>
                                <GiftBoxCanvasEditor
                                    boxDimensions={activeBoxType}
                                    faceDesigns={faceDesigns}
                                    activeFace={activeFace}
                                    onDesignChange={(face, items) => setFaceDesigns(prev => ({ ...prev, [face]: items }))}
                                    onStageReady={stage => stageRef.current = stage}
                                    selectedId={selectedId}
                                    setSelectedId={setSelectedId}
                                />
                            </Box>
                            <Box sx={{ display: previewTab === 1 ? 'block' : 'none', width: '100%', height: '100%' }}>
                                <Suspense fallback={<CircularProgress />}>
                                    <GiftBox3DPreview
                                        boxDimensions={activeBoxType}
                                        boxColor={boxColor}
                                        material={material}
                                        faceDesigns={faceDesigns}
                                        foamColor={foamColor}
                                        ribbonSettings={{ enabled: ribbonEnabled, style: ribbonStyle, color: ribbonColor, width: ribbonWidth, showBow }}
                                    />
                                </Suspense>
                            </Box>
                        </Box>
                        {previewTab === 0 && (
                             <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10 }} className="glass">
                                <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'rgba(255,255,255,0.6)' }}>
                                    Drag items inside the box to arrange them.
                                </Typography>
                             </Box>
                        )}
                    </>
                }
                controlContent={
                    <CustomizerStepManager steps={steps} activeStep={currentStep} onStepChange={setCurrentStep}>
                        {currentStep === 0 && (
                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="h3" sx={{ mb: 2 }}>Box Size</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2 }}>
                                        {config.boxTypes.map(b => (
                                            <VisualOptionCard key={b.value} label={b.label} value={b.value} selected={boxType === b.value} onClick={setBoxType} price={b.price} emoji={b.icon} />
                                        ))}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="h3" sx={{ mb: 2 }}>Material</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2 }}>
                                        {config.materials.map(m => (
                                            <VisualOptionCard key={m.value} label={m.label} value={m.value} selected={material === m.value} onClick={setMaterial} price={m.price} />
                                        ))}
                                    </Box>
                                </Box>
                            </Stack>
                        )}
                        {currentStep === 1 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Pick Items</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                    {config.items.map(item => (
                                        <Button key={item.type} variant="outlined" startIcon={<Typography>{item.emoji}</Typography>} onClick={() => handleAddItem(item.type)} sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <Box sx={{ textAlign: 'left' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'primary.main' }}>+₹{item.price}</Typography>
                                            </Box>
                                        </Button>
                                    ))}
                                </Box>
                                {faceDesigns.insideBox.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.6 }}>Selected Items:</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxHeight: '200px', overflowY: 'auto' }}>
                                            {faceDesigns.insideBox.map(item => (
                                                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.05)', p: 1, borderRadius: '8px' }}>
                                                    <Typography variant="caption">{config.items.find(i => i.type === item.type)?.name}</Typography>
                                                    <IconButton size="small" onClick={() => setFaceDesigns(p => ({ ...p, insideBox: p.insideBox.filter(i => i.id !== item.id) }))}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        )}
                        {currentStep === 2 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Ribbon Decoration</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                    <Typography>Enable Ribbon</Typography>
                                    <Button size="small" variant={ribbonEnabled ? "contained" : "outlined"} onClick={() => setRibbonEnabled(!ribbonEnabled)}>{ribbonEnabled ? "On" : "Off"}</Button>
                                </Box>
                                {ribbonEnabled && (
                                    <>
                                        <Box>
                                            <Typography variant="caption">Ribbon Style</Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mt: 1 }}>
                                                {['top', 'side', 'cross', 'full', 'side_only'].map(s => (
                                                    <Button key={s} variant={ribbonStyle === s ? "contained" : "outlined"} onClick={() => setRibbonStyle(s)} size="small" sx={{ fontSize: '10px' }}>{s.replace('_',' ')}</Button>
                                                ))}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption">Ribbon Color</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                {['#FFD93D', '#FF4D94', '#E53935', '#2196F3', '#ffffff'].map(c => (
                                                    <Box key={c} onClick={() => setRibbonColor(c)} sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: c, border: ribbonColor === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        )}
                        {currentStep === 3 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Box Aesthetics</Typography>
                                <Box>
                                    <Typography variant="caption">Box Color</Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                                        {BOX_COLORS.map(c => (
                                            <Box key={c.value} onClick={() => setBoxColor(c.value)} sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: c.swatch, border: boxColor === c.value ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} />
                                        ))}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption">Interior Lining (Foam)</Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                                        {['#f0dde8', '#ffffff', '#1a1a1a', '#e53935', '#D4AF37'].map(c => (
                                            <Box key={c} onClick={() => setFoamColor(c)} sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: c, border: foamColor === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} />
                                        ))}
                                    </Box>
                                </Box>
                            </Stack>
                        )}
                        {currentStep === 4 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Luxury Check</Typography>
                                <Box className="glass" sx={{ p: 2, borderRadius: '16px' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Packaging:</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• {activeBoxType.label}: ₹{activeBoxType.price}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• {material.charAt(0).toUpperCase() + material.slice(1)} Material</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• Ribbon: {ribbonEnabled ? `${ribbonStyle} style` : 'None'}</Typography>
                                </Box>
                                <Box className="glass" sx={{ p: 2, borderRadius: '16px' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Items Inside ({faceDesigns.insideBox.length}):</Typography>
                                    {faceDesigns.insideBox.map(item => (
                                        <Typography key={item.id} variant="body2" sx={{ opacity: 0.7 }}>• {config.items.find(i => i.type === item.type)?.name}</Typography>
                                    ))}
                                </Box>
                            </Stack>
                        )}
                    </CustomizerStepManager>
                }
                actionBarContent={
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Total Est.</Typography>
                                <Typography sx={{ color: '#fff', fontSize: '24px', fontWeight: 800 }}>₹{totalPrice.toFixed(0)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '100px', px: 1 }}>
                                <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))} sx={{ color: '#fff' }}><RemoveIcon fontSize="small" /></IconButton>
                                <Typography sx={{ mx: 1.5, fontWeight: 700 }}>{quantity}</Typography>
                                <IconButton size="small" onClick={() => setQuantity(quantity + 1)} sx={{ color: '#fff' }}><AddIcon fontSize="small" /></IconButton>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Button fullWidth onClick={() => { setFaceDesigns({ insideBox: [] }); setSnackbar({ open: true, message: 'Reset done!', severity: 'info' }); }} sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 'auto', px: 2 }}><RestartAltIcon /></Button>
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

export default GiftBoxCustomizerPage;
