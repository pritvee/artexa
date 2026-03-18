import React, { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Container, Grid, Box, Typography, Button, Paper, Tabs, Tab,
    Chip, Stack, Divider, TextField, Select, MenuItem, FormControl,
    InputLabel, IconButton, Tooltip, Alert, Snackbar, Badge,
    CircularProgress, Slider
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EditIcon from '@mui/icons-material/Edit';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InventoryIcon from '@mui/icons-material/Inventory';
import CakeIcon from '@mui/icons-material/Cake';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

import api, { getPublicUrl } from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { sanitizeUrl } from '../api/security';
import { useCart } from '../store/CartContext';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import PremiumCustomizerLayout from '../components/Customization/Shared/PremiumCustomizerLayout';
import CustomizerStepManager from '../components/Customization/Shared/CustomizerStepManager';
import VisualOptionCard from '../components/Customization/Shared/VisualOptionCard';
import InstagramSupportButton from '../components/Shared/InstagramSupportButton';
import ChocolateHamperCanvasEditor from '../components/Customization/ChocolateHamper/ChocolateHamperCanvasEditor';
import ImageEnhancerPanel from '../components/Customization/Shared/ImageEnhancerPanel';

const ChocolateHamper3DPreview = lazy(() => import('../components/Customization/ChocolateHamper/ChocolateHamper3DPreview'));

/* ─── Constants ─── */
const HAMPER_SIZES = [
    { label: 'Small', value: 'small', maxChoc: 5, price: 249, emoji: '🧺' },
    { label: 'Medium', value: 'medium', maxChoc: 10, price: 449, emoji: '🎁' },
    { label: 'Premium', value: 'premium', maxChoc: 20, price: 1099, emoji: '💝' },
];

const CONTAINER_STYLES = [
    { label: 'Wooden Box', value: 'wooden_box', emoji: '🪵', color: '#6D4C22' },
    { label: 'Luxury Box', value: 'luxury_box', emoji: '🎁', color: '#1a1a2e' },
    { label: 'Gift Basket', value: 'gift_basket', emoji: '🧺', color: '#966F33' },
];

const CHOCOLATES = [
    { type: 'dairymilk', name: 'Dairy Milk', emoji: '🍫', price: 60, color: '#6A1B9A' },
    { type: 'kitkat', name: 'KitKat', emoji: '🍬', price: 45, color: '#C62828' },
    { type: 'ferrero', name: 'Ferrero Rocher', emoji: '🟡', price: 110, color: '#F9A825' },
    { type: 'snickers', name: 'Snickers', emoji: '🍫', price: 55, color: '#4E342E' },
    { type: 'lindt', name: 'Lindt', emoji: '🔴', price: 130, color: '#AD1457' },
    { type: 'toblerone', name: 'Toblerone', emoji: '🔺', price: 180, color: '#E65100' },
];

const DECORATIONS = [
    { type: 'flower', label: 'Flowers', emoji: '🌸', price: 49 },
    { type: 'wrapping', label: 'Gift Wrap', emoji: '🎁', price: 99 },
    { type: 'ribbon', label: 'Satin Ribbon', emoji: '🎀', price: 59 },
    { type: 'confetti', label: 'Confetti', emoji: '🎊', price: 29 },
    { type: 'heart', label: 'Heart Decor', emoji: '❤️', price: 39 },
];

const THEMES = [
    { label: 'Birthday', value: 'birthday', emoji: '🎂' },
    { label: 'Anniversary', value: 'anniversary', emoji: '💑' },
    { label: 'Valentine', value: 'valentine', emoji: '💕' },
    { label: 'Friendship', value: 'friendship', emoji: '🤝' },
    { label: 'Celebration', value: 'celebration', emoji: '🎉' },
];

const ChocolateHamperPage = () => {
    const { id, cartItemId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { updateCartItem } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [previewTab, setPreviewTab] = useState(1);
    const [hamperSize, setHamperSize] = useState('medium');
    const [containerStyle, setContainer] = useState('gift_basket');
    const [theme, setTheme] = useState('birthday');
    const [hamperColor, setHamperColor] = useState('#8B6914');
    const [quantity, setQuantity] = useState(1);
    const [selectedChocolates, setSelectedChocolates] = useState([]);
    const [selectedDecorations, setSelectedDecorations] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isUploading, setIsUploading] = useState(false);
    const stageRef = useRef(null);

    useEffect(() => {
        const fetchProductAndCartItem = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
                
                if (cartItemId) {
                    try {
                        const cartRes = await api.get('/cart/');
                        const item = cartRes.data.items.find(i => i.id === parseInt(cartItemId));
                        if (item && item.customization_details) {
                            const details = item.customization_details;
                            if (details.hamper_size) setHamperSize(details.hamper_size);
                            if (details.container_style) setContainer(details.container_style);
                            if (details.theme) setTheme(details.theme);
                            if (details.hamper_color) setHamperColor(details.hamper_color);
                            if (item.quantity) setQuantity(item.quantity);
                            if (details.chocolates) setSelectedChocolates(details.chocolates);
                            if (details.decorations) setSelectedDecorations(details.decorations);
                            if (details.photos) {
                                setPhotos(details.photos.map(p => ({
                                    ...p,
                                    url: p.url ? (p.url.startsWith('data:') ? p.url : getPublicUrl(p.url)) : null,
                                    originalUrl: p.url
                                })));
                            }
                        }
                    } catch (e) { console.error(e); }
                }
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchProductAndCartItem();
    }, [id, cartItemId]);

    const activeSize = HAMPER_SIZES.find(s => s.value === hamperSize) || HAMPER_SIZES[1];
    const totalPrice = (activeSize.price + selectedChocolates.reduce((sum, c) => sum + (CHOCOLATES.find(ch => ch.type === c.type)?.price || 0) * (c.count || 1), 0) + selectedDecorations.reduce((sum, d) => sum + (DECORATIONS.find(de => de.type === d.type)?.price || 0), 0)) * quantity;

    const handleAddChoc = (choc) => {
        const totalCount = selectedChocolates.reduce((s, c) => s + c.count, 0);
        if (totalCount >= activeSize.maxChoc) {
            setSnackbar({ open: true, message: `Max ${activeSize.maxChoc} chocolates for this size!`, severity: 'warning' });
            return;
        }
        setSelectedChocolates(prev => {
            const existing = prev.find(c => c.type === choc.type);
            if (existing) return prev.map(c => c.type === choc.type ? { ...c, count: c.count + 1 } : c);
            return [...prev, { ...choc, count: 1, id: `choc-${Date.now()}`, x: 50 + Math.random() * 200, y: 50 + Math.random() * 200, rotation: 0 }];
        });
    };

    const handleAddDecor = (decor) => {
        if (selectedDecorations.some(d => d.type === decor.type)) {
            setSnackbar({ open: true, message: 'Already added!', severity: 'info' });
            return;
        }
        setSelectedDecorations(prev => [...prev, { ...decor, id: `decor-${Date.now()}`, x: 50 + Math.random() * 200, y: 50 + Math.random() * 200, rotation: 0, scale: 0.5 }]);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/products/upload-customization', formData);
            const url = res.data.image_url || res.data.url;
            setPhotos(prev => [...prev, { id: `photo-${Date.now()}`, url: getPublicUrl(url), originalUrl: url, x: 100, y: 100, rotation: 0, scale: 0.4 }]);
            setSnackbar({ open: true, message: 'Photo uploaded!', severity: 'success' });
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
                fd.append('file', new File([blob], 'hamper_preview.png', { type: 'image/png' }));
                const up = await api.post('/products/upload-customization', fd);
                previewUrl = up.data.url || up.data.image_url;
            }
        } catch (e) { console.warn(e); }

        const customization_details = {
            product: 'custom_hamper',
            hamper_size: hamperSize,
            container_style: containerStyle,
            theme,
            hamper_color: hamperColor,
            chocolates: selectedChocolates,
            decorations: selectedDecorations,
            photos: photos.map(p => ({ ...p, url: p.originalUrl || p.url })),
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
        { id: 'size', label: 'Size & Styles', icon: <InventoryIcon /> },
        { id: 'choc', label: 'Chocolates', icon: <AddIcon /> },
        { id: 'decor', label: 'Decorations', icon: <AutoFixHighIcon /> },
        { id: 'photo', label: 'Memories', icon: <PhotoLibraryIcon /> },
        { id: 'review', label: 'Review', icon: <ViewInArIcon /> }
    ];

    return (
        <>
            <PremiumCustomizerLayout
                title={product.name}
                subtitle="Build your premium chocolate hamper"
                previewContent={
                    <>
                        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 1 }}>
                            <Button variant={previewTab === 0 ? "contained" : "outlined"} size="small" onClick={() => setPreviewTab(0)} sx={{ borderRadius: '12px' }}>2D Designer</Button>
                            <Button variant={previewTab === 1 ? "contained" : "outlined"} size="small" onClick={() => setPreviewTab(1)} sx={{ borderRadius: '12px' }}>3D Preview</Button>
                        </Box>
                        <Box sx={{ width: '100%', height: '100%' }}>
                            <Box sx={{ display: previewTab === 0 ? 'block' : 'none', p: 4, height: '100%' }}>
                                <ChocolateHamperCanvasEditor
                                    hamperSize={hamperSize}
                                    chocolates={selectedChocolates}
                                    decorations={selectedDecorations}
                                    photos={photos}
                                    containerStyle={containerStyle}
                                    onUpdateChoc={setSelectedChocolates}
                                    onUpdateDecor={setSelectedDecorations}
                                    onUpdatePhotos={setPhotos}
                                    selectedId={selectedId}
                                    setSelectedId={setSelectedId}
                                    onStageReady={s => stageRef.current = s}
                                />
                            </Box>
                            <Box sx={{ display: previewTab === 1 ? 'block' : 'none', width: '100%', height: '100%' }}>
                                <Suspense fallback={<CircularProgress />}>
                                    <ChocolateHamper3DPreview
                                        hamperSize={hamperSize}
                                        containerStyle={containerStyle}
                                        chocolates={selectedChocolates}
                                        decorations={selectedDecorations}
                                        photos={photos}
                                        hamperColor={hamperColor}
                                    />
                                </Suspense>
                            </Box>
                        </Box>
                    </>
                }
                controlContent={
                    <CustomizerStepManager steps={steps} activeStep={currentStep} onStepChange={setCurrentStep}>
                        {currentStep === 0 && (
                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="h3" sx={{ mb: 2 }}>Hamper Size</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2 }}>
                                        {HAMPER_SIZES.map(s => (
                                            <VisualOptionCard key={s.value} label={s.label} value={s.value} selected={hamperSize === s.value} onClick={setHamperSize} price={s.price} emoji={s.emoji} subtitle={`${s.maxChoc} chocolates`} />
                                        ))}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="h3" sx={{ mb: 2 }}>Basket Style</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2 }}>
                                        {CONTAINER_STYLES.map(c => (
                                            <VisualOptionCard key={c.value} label={c.label} value={c.value} selected={containerStyle === c.value} onClick={setContainer} emoji={c.emoji} />
                                        ))}
                                    </Box>
                                </Box>
                            </Stack>
                        )}
                        {currentStep === 1 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Pick Chocolates ({selectedChocolates.reduce((s,c) => s+c.count, 0)}/{activeSize.maxChoc})</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                    {CHOCOLATES.map(c => (
                                        <Button key={c.type} variant="outlined" startIcon={<Typography>{c.emoji}</Typography>} onClick={() => handleAddChoc(c)} sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: '12px' }}>
                                            <Box sx={{ textAlign: 'left' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'primary.main' }}>₹{c.price}</Typography>
                                            </Box>
                                        </Button>
                                    ))}
                                </Box>
                                {selectedChocolates.length > 0 && (
                                    <Box className="glass" sx={{ p: 2, borderRadius: '12px' }}>
                                        {selectedChocolates.map(c => (
                                            <Box key={c.type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="caption">{c.name} x {c.count}</Typography>
                                                <IconButton size="small" onClick={() => setSelectedChocolates(p => p.map(item => item.type === c.type ? { ...item, count: Math.max(0, item.count - 1) } : item).filter(item => item.count > 0))}><RemoveIcon sx={{ fontSize: 14 }} /></IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Stack>
                        )}
                        {currentStep === 2 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Add Decorations</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                    {DECORATIONS.map(d => (
                                        <Button key={d.type} variant="outlined" startIcon={<Typography>{d.emoji}</Typography>} onClick={() => handleAddDecor(d)} sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: '12px' }}>
                                            <Box sx={{ textAlign: 'left' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.label}</Typography>
                                                <Typography variant="caption" sx={{ color: 'primary.main' }}>₹{d.price}</Typography>
                                            </Box>
                                        </Button>
                                    ))}
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Occasion Theme</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {THEMES.map(t => (
                                            <Chip key={t.value} icon={<span>{t.emoji}</span>} label={t.label} onClick={() => setTheme(t.value)} variant={theme === t.value ? 'filled' : 'outlined'} color={theme === t.value ? 'primary' : 'default'} />
                                        ))}
                                    </Box>
                                </Box>
                            </Stack>
                        )}
                        {currentStep === 3 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Upload Photos</Typography>
                                <Button fullWidth variant="outlined" component="label" startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />} sx={{ py: 6, borderStyle: 'dashed', borderRadius: '20px', borderColor: 'rgba(255,255,255,0.2)' }}>
                                    {isUploading ? "Uploading..." : "Click to select a photo"}
                                    <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                                </Button>
                                {photos.length > 0 && (
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                                        {photos.map(p => {
                                            const safePhotoUrl = sanitizeUrl(p.url);
                                            return (
                                                <Box key={p.id} sx={{ position: 'relative', pt: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                                                    <img 
                                                        src={safePhotoUrl} 
                                                        alt="User uploaded"
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    />
                                                    <IconButton size="small" onClick={() => setPhotos(prev => prev.filter(item => item.id !== p.id))} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.5)' }}><DeleteIcon sx={{ fontSize: 12 }} /></IconButton>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}
                            </Stack>
                        )}
                        {currentStep === 4 && (
                            <Stack spacing={3}>
                                <Typography variant="h3">Hamper Details</Typography>
                                <Box className="glass" sx={{ p: 2, borderRadius: '16px' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Summary:</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• Size: {hamperSize}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• Basket: {containerStyle}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• Theme: {theme}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>• Chocolates: {selectedChocolates.length}</Typography>
                                </Box>
                                <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 700, textAlign: 'center' }}>Total ₹{totalPrice.toFixed(0)}</Typography>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '100px', px: 1 }}>
                                <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))} sx={{ color: '#fff' }}><RemoveIcon fontSize="small" /></IconButton>
                                <Typography sx={{ mx: 1.5, fontWeight: 700 }}>{quantity}</Typography>
                                <IconButton size="small" onClick={() => setQuantity(quantity + 1)} sx={{ color: '#fff' }}><AddIcon fontSize="small" /></IconButton>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Button fullWidth onClick={() => { setSelectedChocolates([]); setSelectedDecorations([]); setPhotos([]); }} sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 'auto', px: 2 }}><RestartAltIcon /></Button>
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

export default ChocolateHamperPage;
