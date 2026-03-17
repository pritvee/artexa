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
import MessageIcon from '@mui/icons-material/Message';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InstagramIcon from '@mui/icons-material/Instagram';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BoltIcon from '@mui/icons-material/Bolt';

import ChocolateHamperCanvasEditor from '../components/Customization/ChocolateHamper/ChocolateHamperCanvasEditor';
import { useAuth } from '../store/AuthContext';
import api, { getPublicUrl } from '../api/axios';
import ImageEnhancerPanel from '../components/Customization/Shared/ImageEnhancerPanel';
import InstagramSupportButton from '../components/Shared/InstagramSupportButton';

const ChocolateHamper3DPreview = lazy(() =>
    import('../components/Customization/ChocolateHamper/ChocolateHamper3DPreview')
);

/* ─── Constants ─── */
const HAMPER_SIZES = [
    { label: 'Small',   value: 'small',   maxChoc: 5,  price: 249,  emoji: '🧺', desc: 'Up to 5 chocolates' },
    { label: 'Medium',  value: 'medium',  maxChoc: 10, price: 449,  emoji: '🎁', desc: 'Up to 10 chocolates' },
    { label: 'Premium', value: 'premium', maxChoc: 20, price: 1099, emoji: '💝', desc: 'Up to 20 chocolates' },
];

const CONTAINER_STYLES = [
    { label: 'Wooden Box',     value: 'wooden_box',     emoji: '🪵', color: '#6D4C22' },
    { label: 'Luxury Box',     value: 'luxury_box',     emoji: '🎁', color: '#1a1a2e' },
    { label: 'Gift Basket',    value: 'gift_basket',    emoji: '🧺', color: '#966F33' },
];

const CHOCOLATES = [
    { type: 'dairymilk', name: 'Dairy Milk',     emoji: '🍫', price: 60,  color: '#6A1B9A' },
    { type: 'kitkat',    name: 'KitKat',          emoji: '🍬', price: 45,  color: '#C62828' },
    { type: 'ferrero',   name: 'Ferrero Rocher',  emoji: '🟡', price: 110, color: '#F9A825' },
    { type: 'snickers',  name: 'Snickers',        emoji: '🍫', price: 55,  color: '#4E342E' },
    { type: 'lindt',     name: 'Lindt',           emoji: '🔴', price: 130, color: '#AD1457' },
    { type: 'toblerone', name: 'Toblerone',       emoji: '🔺', price: 180, color: '#E65100' },
];

const DECORATIONS = [
    { type: 'flower',   label: 'Flowers',   emoji: '🌸', price: 49 },
    { type: 'wrapping', label: 'Gift Wrap', emoji: '🎁', price: 99 },
    { type: 'ribbon',   label: 'Satin Ribbon', emoji: '🎀', price: 59 },
    { type: 'confetti', label: 'Confetti',   emoji: '🎊', price: 29 },
    { type: 'heart',    label: 'Heart Decor', emoji: '❤️', price: 39 },
    { type: 'star',     label: 'Star Decor',  emoji: '⭐', price: 39 },
];

const THEMES = [
    { label: 'Birthday',    value: 'birthday',    emoji: '🎂', suggestColor: '#8B6914' },
    { label: 'Anniversary', value: 'anniversary', emoji: '💑', suggestColor: '#AD1457' },
    { label: 'Valentine',   value: 'valentine',   emoji: '💕', suggestColor: '#FF1744' },
    { label: 'Friendship',  value: 'friendship',  emoji: '🤝', suggestColor: '#E65100' },
    { label: 'Celebration', value: 'celebration', emoji: '🎉', suggestColor: '#F9A825' },
    { label: 'Festival',    value: 'festival',    emoji: '🪔', suggestColor: '#6A1B9A' },
];



const getSizeObj = (v) => HAMPER_SIZES.find(s => s.value === v) || HAMPER_SIZES[1];
const getContainerObj = (v) => CONTAINER_STYLES.find(c => c.value === v) || CONTAINER_STYLES[0];

import { useCart } from '../store/CartContext';

/* ─── Main Page ─── */
const ChocolateHamperPage = () => {
    const { id, cartItemId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { updateCartItem } = useCart();

    // Core
    const [product, setProduct]           = useState(null);
    const [loading, setLoading]           = useState(true);
    const [hamperSize, setHamperSize]     = useState('medium');
    const [containerStyle, setContainer]  = useState('gift_basket');
    const [theme, setTheme]               = useState('birthday');
    const [hamperColor, setHamperColor]   = useState('#8B6914');
    const [quantity, setQuantity]         = useState(1);

    // Dynamic Constants
    const [dynamicSizes, setDynamicSizes] = useState(HAMPER_SIZES);
    const [dynamicContainers, setDynamicContainers] = useState(CONTAINER_STYLES);
    const [dynamicChocolates, setDynamicChocolates] = useState(CHOCOLATES);

    useEffect(() => {
        const loadProductAndCartItem = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
                if (res.data.customization_schema) {
                    const schema = res.data.customization_schema;

                    // Helper: merge schema array with defaults by key field
                    const mergeWithDefaults = (defaults, schemaArr, keyField) => {
                        if (!schemaArr?.length) return defaults;
                        // Start with all defaults, override with matching schema entries
                        const merged = defaults.map(def => {
                            const schemaItem = schemaArr.find(s => {
                                const sNorm = typeof s === 'string' ? s.toLowerCase().replace(/\s+/g,'_') : (s[keyField] || '');
                                return sNorm === def[keyField];
                            });
                            if (!schemaItem) return def; // keep default as-is
                            if (typeof schemaItem === 'string') return def; // string match means keep default
                            return { ...def, ...schemaItem }; // merge: schema overrides defaults
                        });
                        // Add any schema entries not in defaults
                        schemaArr.forEach(s => {
                            const sVal = typeof s === 'string' ? s.toLowerCase().replace(/\s+/g,'_') : (s[keyField] || '');
                            if (!defaults.find(d => d[keyField] === sVal)) {
                                if (typeof s === 'string') {
                                    merged.push({ [keyField]: sVal, label: s });
                                } else {
                                    merged.push(s);
                                }
                            }
                        });
                        return merged.filter(item => item.enabled !== false);
                    };

                    setDynamicSizes(mergeWithDefaults(HAMPER_SIZES, schema.hamperSizes, 'value'));
                    setDynamicContainers(mergeWithDefaults(CONTAINER_STYLES, schema.hamperContainers, 'value'));
                    setDynamicChocolates(mergeWithDefaults(CHOCOLATES, schema.hamperChocolates, 'type'));
                }

                // Restore cart item state if editing
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
                             
                             // Restore canvas items
                             if (details.chocolates) {
                                 const counts = {};
                                 details.chocolates.forEach(c => counts[c.type] = (counts[c.type] || 0) + 1);
                                 setChocCounts(counts);
                                 setCanvasChocs(details.chocolates);
                             }
                             if (details.decorations) setDecorations(details.decorations);
                             if (details.photos) {
                                 setPhotos(details.photos.map(ph => ({
                                     ...ph,
                                     src: ph.src.startsWith('data:') ? ph.src : getPublicUrl(ph.src)
                                 })));
                             } else if (details.design_image) {
                                  // Fallback: if we only have design_image but not split photos, 
                                  // this might be a legacy save or just for preview
                             }
                             if (details.chocolates || details.decorations) {
                                 // Force arrange if no positions saved? 
                                 // Usually positions are saved in the array above.
                             }                           
                        }
                    } catch (e) {
                        console.error("Failed to restore cart item", e);
                    }
                }
            } catch (err) {
                console.error("Failed to load product", err);
                setSnackbar({ open: true, message: 'Failed to load product details.', severity: 'error' });
            } finally {
                setLoading(false);
            }
        };
        loadProductAndCartItem();
    }, [id, cartItemId]);

    // Canvas state
    const [canvasChocs, setCanvasChocs]   = useState([]);
    const [decorations, setDecorations]   = useState([]);
    const [photos, setPhotos]             = useState([]);
    const [selectedId, setSelectedId]     = useState(null);

    // Chocolate qty sidebar
    const [chocCounts, setChocCounts]     = useState({});



    // ─── Auto-Arrange Logic ───
    const autoArrangeAll = useCallback((currentChocs) => {
        const count = currentChocs.length;
        if (count === 0) return [];

        const CANVAS_CX = 310;
        const CANVAS_CY = 260;

        // Pattern depends on container
        if (containerStyle === 'gift_basket') {
            // Radial/Circular layout for baskets
            return currentChocs.map((choc, i) => {
                const angle = (i / count) * Math.PI * 2;
                const radius = count > 5 ? (i < 5 ? 70 : 130) : 100;
                const finalAngle = count > 5 && i >= 5 ? angle + (Math.PI / 5) : angle;
                return {
                    ...choc,
                    x: CANVAS_CX + Math.cos(finalAngle) * radius,
                    y: CANVAS_CY + Math.sin(finalAngle) * radius * 0.8,
                    rotation: (finalAngle * 180 / Math.PI) + 90
                };
            });
        } else {
            // Grid layout for trays/boxes
            const cols = count <= 3 ? count : (count <= 8 ? 4 : 5);
            const rows = Math.ceil(count / cols);
            const spacingX = count > 10 ? 90 : 110;
            const spacingY = count > 10 ? 70 : 90;

            const startX = CANVAS_CX - ((cols - 1) * spacingX) / 2;
            const startY = CANVAS_CY - ((rows - 1) * spacingY) / 2;

            return currentChocs.map((choc, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                return {
                    ...choc,
                    x: startX + col * spacingX,
                    y: startY + row * spacingY,
                    rotation: (i % 2 === 0 ? 5 : -5)
                };
            });
        }
    }, [containerStyle]);

    // UI functions
    const applySmartLayout = () => {
        setCanvasChocs(prev => autoArrangeAll(prev));
        setSnackbar({ open: true, message: '✨ Layout organized!', severity: 'success' });
    };

    // UI
    const [previewTab, setPreviewTab]     = useState(0);
    const [controlTab, setControlTab]     = useState(0);
    const [snackbar, setSnackbar]         = useState({ open: false, message: '', severity: 'success' });
    const [isUploading, setIsUploading]   = useState(false);
    const [showOverlay, setShowOverlay]   = useState(true);
    const [isDragging, setIsDragging]     = useState(false);

    const stageRef = useRef(null);

    // ─── Derived ───
    // Safety check for dynamic data
    const safeDynamicSizes = dynamicSizes.length > 0 ? dynamicSizes : HAMPER_SIZES;
    const sizeObj = safeDynamicSizes.find(s => s.value === hamperSize) || safeDynamicSizes[0] || HAMPER_SIZES[1];
    const totalChocs = Object.values(chocCounts).reduce((s, c) => s + c, 0);
    const totalChocsPrice = Object.entries(chocCounts).reduce((sum, [type, qty]) => {
        const c = dynamicChocolates.find(ch => ch.type === type);
        return sum + (c ? (c.price || 0) * qty : 0);
    }, 0);
    const totalDecPrice = decorations.reduce((sum, d) => {
        const def = DECORATIONS.find(dec => dec.type === d.type);
        return sum + (def ? (def.price || 0) : 25);
    }, 0);
    const photoTotal = photos.length * 49;
    
    // Final Safe Total
    const basePrice = sizeObj?.price || 0;
    const totalPrice = (basePrice + totalChocsPrice + totalDecPrice + photoTotal) * (quantity || 1);

    // ─── Theme change ───
    const handleThemeChange = (val) => {
        setTheme(val);
        const t = THEMES.find(th => th.value === val);
        if (t) setHamperColor(t.suggestColor);
    };

    // ─── Container change ───
    const handleContainerChange = (val) => {
        setContainer(val);
        const c = dynamicContainers.find(dc => dc.value === val);
        if (c && c.color) setHamperColor(c.color);
    };

    // ─── Add chocolate ───
    const handleAddChoc = (chocDef) => {
        if (totalChocs >= sizeObj.maxChoc) {
            setSnackbar({ open: true, message: `Max ${sizeObj.maxChoc} chocolates for ${sizeObj.label} hamper`, severity: 'warning' });
            return;
        }
        setChocCounts(prev => ({ ...prev, [chocDef.type]: (prev[chocDef.type] || 0) + 1 }));
        const cid = `choc-${chocDef.type}-${Date.now()}`;
        
        setCanvasChocs(prev => {
            const newList = [...prev, {
                id: cid, type: chocDef.type, name: chocDef.name,
                qty: 1, x: 310, y: 260, // Temporary pos
                size: 44, rotation: 0, scaleX: 1, scaleY: 1
            }];
            return autoArrangeAll(newList);
        });
    };

    const handleRemoveChoc = (type) => {
        setChocCounts(prev => {
            const next = { ...prev };
            if (next[type] > 1) next[type]--;
            else delete next[type];
            return next;
        });
        setCanvasChocs(prev => {
            const idx = [...prev].reverse().findIndex(i => i.type === type);
            if (idx < 0) return prev;
            const filtered = prev.filter((_, i) => i !== prev.length - 1 - idx);
            return autoArrangeAll(filtered);
        });
    };

    // ─── Decoration ───
    const handleAddDec = (type) => {
        setDecorations(prev => [...prev, {
            id: `dec-${Date.now()}`, type,
            x: 80 + Math.random() * 460, y: 60 + Math.random() * 380,
            size: 36, rotation: Math.random() * 30 - 15, scaleX: 1
        }]);
    };

    // ─── Photo upload ───
    const handlePhotoUpload = async (e) => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please login to upload photos.', severity: 'warning' });
            setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
            return;
        }
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        setSnackbar({ open: true, message: 'Uploading photo...', severity: 'info' });
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/products/upload-customization', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data.image_url || res.data.url;
            setPhotos(prev => [...prev, {
                id: `photo-${Date.now()}`, 
                src: getPublicUrl(url),
                originalPath: url,
                x: 220, y: 180, width: 110, height: 110, rotation: 0, scaleX: 1, scaleY: 1
            }]);
            setSnackbar({ open: true, message: 'Photo uploaded!', severity: 'success' });
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'Upload failed', severity: 'error' });
        } finally {
            setIsUploading(false);
        }
    };



    // ─── Delete selected ───
    const handleDelete = () => {
        if (!selectedId) return;
        setCanvasChocs(p => p.filter(i => i.id !== selectedId));
        setDecorations(p => p.filter(d => d.id !== selectedId));
        setPhotos(p => p.filter(ph => ph.id !== selectedId));
        setSelectedId(null);
    };

    const handleReset = () => {
        setCanvasChocs([]); setDecorations([]);
        setPhotos([]);
        setChocCounts({}); setSelectedId(null);
    };

    // ─── Drag/Transform handlers ───
    const chocDragEnd  = useCallback((id, x, y) => setCanvasChocs(p => p.map(i => i.id === id ? { ...i, x, y } : i)), []);
    const chocTransEnd = useCallback((id, pr) => setCanvasChocs(p => p.map(i => i.id === id ? { ...i, ...pr } : i)), []);
    const decDragEnd   = useCallback((id, x, y) => setDecorations(p => p.map(d => d.id === id ? { ...d, x, y } : d)), []);
    const decTransEnd  = useCallback((id, pr) => setDecorations(p => p.map(d => d.id === id ? { ...d, ...pr } : d)), []);
    const photoDragStart = () => setIsDragging(true);
    const photoDrag = (id, x, y) => {
        // Track position if needed
    };
    const photoDragEnd = useCallback((id, x, y) => {
        setIsDragging(false);
        setPhotos(p => p.map(ph => ph.id === id ? { ...ph, x, y } : ph));
    }, []);
    const photoTransEnd= useCallback((id, pr) => setPhotos(p => p.map(ph => ph.id === id ? { ...ph, ...pr } : ph)), []);

    const uploadContextCanvas = async (source, filename, isStage = false) => {
        if (!source) return null;
        try {
            let canvas = null;
            let dataUrl = null;

            if (isStage) {
                // Konva Stage (2D)
                if (typeof source.toDataURL !== 'function') return null;
                const trs = source.find('Transformer');
                trs.forEach(t => t.hide());
                dataUrl = source.toDataURL({ pixelRatio: 2, mimeType: 'image/png' });
                trs.forEach(t => t.show());
            } else {
                // HTML Canvas or R3F Container
                if (source instanceof HTMLCanvasElement) {
                    canvas = source;
                } else if (source.domElement instanceof HTMLCanvasElement) {
                    canvas = source.domElement; // R3F gl
                } else {
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
            let n = bstr.length; const u8 = new Uint8Array(n);
            while (n--) u8[n] = bstr.charCodeAt(n);
            const fd = new FormData();
            fd.append('file', new File([u8], filename, { type: mime }));
            const res = await api.post('/products/upload-customization', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.image_url || res.data.url;
        } catch (e) {
            console.error('Snapshot upload failed', e);
            return null;
        }
    };

    // ─── Add to Cart ───
    const handleAddToCart = async () => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please login to add items to cart.', severity: 'warning' });
            setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
            return;
        }
        if (totalChocs === 0) { setSnackbar({ open: true, message: 'Add at least one chocolate!', severity: 'warning' }); return; }

        let designImg = null;
        try {
            if (stageRef.current) {
                designImg = await uploadContextCanvas(stageRef.current, 'hamper_design.png', true);
            }
        } catch (e) { console.warn('Snapshot failed', e); }

        const customization_details = {
            product: 'chocolate_hamper',
            hamper_size: hamperSize,
            container_style: containerStyle,
            theme,
            hamper_color: hamperColor,
            chocolates: canvasChocs.map(c => ({
                id: c.id,
                type: c.type,
                x: c.x,
                y: c.y,
                rotation: c.rotation,
                size: c.size,
                scaleX: c.scaleX,
                scaleY: c.scaleY
            })),
            decorations: decorations.map(d => ({
                id: d.id,
                type: d.type,
                x: d.x,
                y: d.y,
                rotation: d.rotation,
                size: d.size
            })),
            photos: photos.map(ph => ({
                id: ph.id,
                src: ph.originalPath || ph.src,
                x: ph.x,
                y: ph.y,
                width: ph.width,
                height: ph.height,
                rotation: ph.rotation,
                scaleX: ph.scaleX,
                scaleY: ph.scaleY
            })),
            photos_count: photos.length,
            design_image: designImg,
            quantity: quantity,
        };

        try {
            if (cartItemId) {
                await updateCartItem(parseInt(cartItemId), {
                    quantity,
                    preview_image_url: designImg,
                    customization_details
                });
                setSnackbar({ open: true, message: '✅ Cart item updated!', severity: 'success' });
            } else {
                await api.post('/cart/items/', {
                    product_id: id ? parseInt(id) : 2,
                    quantity,
                    preview_image_url: designImg,
                    customization_details
                });
                setSnackbar({ open: true, message: '✅ Chocolate hamper added to cart!', severity: 'success' });
            }
            setTimeout(() => navigate('/cart'), 1500);
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to add to cart. Try again.', severity: 'error' });
        }
    };

    /* ═══════════════ RENDER ═══════════════ */
    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', gap: 3 }}>
                <CircularProgress size={60} sx={{ color: '#d4af37' }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>Loading Design Studio...</Typography>
            </Box>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #120a06 0%, #1e0e04 50%, #12090a 100%)',
                paddingTop: '16px',
                paddingBottom: '32px'
            }}
        >
            <Container maxWidth="xl">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" fontWeight="bold" sx={{
                            background: 'linear-gradient(135deg, #d4af37, #FF6B35, #FF1744)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block'
                        }}>
                            🍫 Chocolate Hamper Builder
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
                            Build a personalized chocolate hamper with 2D arrangement & 3D preview
                        </Typography>
                    </Box>
                </motion.div>

                <Grid container spacing={3}>
                    {/* ─── LEFT: Preview ─── */}
                    <Grid item xs={12} md={7}>
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Paper elevation={0} className="glass" sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.07)', bgcolor: 'rgba(0,0,0,0.25)' }}>
                                <Tabs value={previewTab} onChange={(_, v) => setPreviewTab(v)}>
                                    <Tab icon={<EditIcon />} label="2D Designer" iconPosition="start"
                                        sx={{ color: 'rgba(255,255,255,0.55)', '&.Mui-selected': { color: '#d4af37' }, minHeight: 48 }} />
                                    <Tab icon={<ViewInArIcon />} label="3D Preview" iconPosition="start"
                                        sx={{ color: 'rgba(255,255,255,0.55)', '&.Mui-selected': { color: '#d4af37' }, minHeight: 48 }} />
                                </Tabs>
                            </Box>

                            <Box className="preview3d" sx={{ height: 540, position: 'relative' }}>
                                {/* 2D Canvas */}
                                <Box 
                                    inert={previewTab !== 0 ? '' : undefined}
                                    sx={{ 
                                        display: previewTab === 0 ? 'flex' : 'none', 
                                        position: 'absolute', inset: 0, p: 1 
                                    }}
                                >
                                    <ChocolateHamperCanvasEditor
                                        hamperColor={hamperColor}
                                        containerStyle={containerStyle}
                                        size={sizeObj}
                                        chocolates={canvasChocs}
                                        decorations={decorations}
                                        photos={photos}
                                        selectedId={selectedId}
                                        setSelectedId={setSelectedId}
                                        onChocDragEnd={chocDragEnd}
                                        onChocTransformEnd={chocTransEnd}
                                        onDecDragEnd={decDragEnd}
                                        onDecTransformEnd={decTransEnd}
                                        onPhotoDragStart={photoDragStart}
                                        onPhotoDrag={photoDrag}
                                        onPhotoDragEnd={photoDragEnd}
                                        onPhotoTransformEnd={photoTransEnd}
                                        onStageReady={(n) => stageRef.current = n}
                                    />
                                </Box>
                                
                                {/* ── Floating Hamper Items Panel (Persistent across 2D/3D) ── */}
                                <AnimatePresence>
                                    {(previewTab === 0 || showOverlay) && (
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -20, opacity: 0 }}
                                            style={{
                                                position: 'absolute', bottom: 14, left: 14,
                                                width: 220, maxHeight: 240,
                                                backgroundColor: 'rgba(15,8,5,0.85)',
                                                backdropFilter: 'blur(16px)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(212,175,55,0.25)',
                                                boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
                                                overflow: 'hidden',
                                                zIndex: 50,
                                                display: 'flex', flexDirection: 'column',
                                                pointerEvents: 'auto'
                                            }}
                                        >
                                    {/* Header */}
                                    <Box sx={{ px: 1.8, py: 1.2, bgcolor: 'rgba(212,175,55,0.12)', borderBottom: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: '#d4af37', fontSize: 11, fontWeight: 800, letterSpacing: 0.8 }}>🧺 HAMPER STACK</Typography>
                                        <Chip 
                                            label={canvasChocs.length + decorations.length + photos.length} 
                                            size="small" 
                                            sx={{ height: 18, fontSize: 10, bgcolor: '#d4af37', color: '#1a1005', fontWeight: 'bold' }} 
                                        />
                                    </Box>

                                    {/* Combined Item List */}
                                    <Box sx={{ overflowY: 'auto', flex: 1, '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(212,175,55,0.3)', borderRadius: 2 } }}>
                                        {[
                                            ...canvasChocs.map(c => ({...c, cat: 'choc' })),
                                            ...decorations.map(d => ({...d, cat: 'dec' })),
                                            ...photos.map(p => ({...p, cat: 'photo', name: 'Photo Card' })),
                                        ].length === 0 ? (
                                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>Hamper is empty</Typography>
                                            </Box>
                                        ) : (
                                            [
                                                ...canvasChocs.map(c => ({...c, cat: 'choc' })),
                                                ...decorations.map(d => ({...d, cat: 'dec' })),
                                                ...photos.map(p => ({...p, cat: 'photo', name: 'Photo Card' })),
                                            ].reverse().map((item) => {
                                                let emoji = '🎁';
                                                let name = item.name || item.type || 'Item';
                                                
                                                if (item.cat === 'choc') {
                                                    const def = dynamicChocolates.find(d => d.type === item.type);
                                                    emoji = def?.emoji || '🍫';
                                                    name = def?.label || item.type;
                                                } else if (item.cat === 'dec') {
                                                    const def = DECORATIONS.find(d => d.type === item.type);
                                                    emoji = def?.emoji || '🌸';
                                                    name = def?.label || item.type;
                                                } else if (item.cat === 'photo') emoji = '🖼️';

                                                return (
                                                    <Box key={item.id} sx={{
                                                        display: 'flex', alignItems: 'center', gap: 1.2,
                                                        px: 1.8, py: 1,
                                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                        '&:hover': { bgcolor: 'rgba(212,175,55,0.06)' },
                                                        cursor: previewTab === 0 ? 'pointer' : 'default'
                                                    }} onClick={() => previewTab === 0 && setSelectedId(item.id)}>
                                                        <Typography sx={{ fontSize: 18 }}>{emoji}</Typography>
                                                        <Typography sx={{ 
                                                            color: selectedId === item.id ? '#d4af37' : '#fff', 
                                                            fontSize: 11.5, fontWeight: selectedId === item.id ? 700 : 400,
                                                            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                                                        }}>{name}</Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (item.cat === 'choc') {
                                                                    setChocCounts(prev => {
                                                                        const next = { ...prev };
                                                                        if (next[item.type] > 1) next[item.type]--;
                                                                        else delete next[item.type];
                                                                        return next;
                                                                    });
                                                                    setCanvasChocs(p => p.filter(i => i.id !== item.id));
                                                                }
                                                                else if (item.cat === 'dec') setDecorations(p => p.filter(d => d.id !== item.id));
                                                                else if (item.cat === 'photo') setPhotos(p => p.filter(ph => ph.id !== item.id));
                                                                
                                                                if (selectedId === item.id) setSelectedId(null);
                                                            }}
                                                            sx={{ color: 'rgba(255,100,100,0.6)', p: 0.4, '&:hover': { color: '#ff4444', bgcolor: 'rgba(255,68,68,0.1)' } }}
                                                        >
                                                            <DeleteIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Box>
                                                );
                                            })
                                        )}
                                    </Box>

                                    {/* Action Bar */}
                                    <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
                                        <Button
                                            fullWidth size="small"
                                            startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
                                            onClick={handleReset}
                                            sx={{ color: 'rgba(255,100,100,0.8)', fontSize: 10, textTransform: 'none', '&:hover': { color: '#ff5252' } }}
                                        >
                                            Empty Hamper
                                        </Button>
                                    </Box>
                                </motion.div>
                                )}
                            </AnimatePresence>

                                {/* 3D */}
                                <Box 
                                    inert={previewTab !== 1 ? '' : undefined}
                                    sx={{ 
                                        display: previewTab === 1 ? 'block' : 'none', 
                                        position: 'absolute', inset: 0 
                                    }}
                                >
                                    <Suspense fallback={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <CircularProgress sx={{ color: '#d4af37' }} />
                                        </Box>
                                    }>
                                        <ChocolateHamper3DPreview
                                            containerStyle={containerStyle}
                                            hamperColor={hamperColor}
                                            size={sizeObj}
                                            chocolates={canvasChocs}
                                            decorations={decorations}
                                        />
                                    </Suspense>
                                </Box>

                                    <Box sx={{ 
                                        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                                        bgcolor: 'rgba(15,10,5,0.7)', backdropFilter: 'blur(10px)',
                                        px: 2.2, py: 0.8, borderRadius: 10, border: '1px solid rgba(212,175,55,0.2)',
                                        zIndex: 100, display: (previewTab === 1 && !showOverlay) ? 'none' : 'flex', alignItems: 'center', gap: 2
                                    }}>
                                        <Typography sx={{ color: 'rgba(212,175,55,0.8)', fontSize: 10, fontWeight: 600, letterSpacing: 0.6 }}>
                                            ✨ TIP: SCROLL TO <span style={{ color: '#fff' }}>ZOOM</span> & DRAG TO <span style={{ color: '#fff' }}>PAN</span>
                                        </Typography>
                                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(212,175,55,0.2)', mx: 0.5 }} />
                                        <Button 
                                            size="small" 
                                            startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
                                            onClick={applySmartLayout}
                                            sx={{ 
                                                color: '#d4af37', fontSize: 10, p: '2px 8px', minWidth: 0,
                                                '&:hover': { bgcolor: 'rgba(212,175,55,0.1)' }
                                            }}
                                        >
                                            Auto-Arrange
                                        </Button>
                                    </Box>
                            </Box>

                            <Box sx={{ px: 2, py: 1.2, bgcolor: 'rgba(0,0,0,0.35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 10.5, letterSpacing: 0.3 }}>
                                        {previewTab === 0 ? '✨ CUSTOMIZE YOUR HAMPER' : '💎 LUXURY 3D PREVIEW'}
                                    </Typography>
                                    {previewTab === 1 && (
                                        <Button 
                                            size="small" 
                                            onClick={() => setShowOverlay(!showOverlay)} 
                                            startIcon={showOverlay ? <VisibilityOffIcon sx={{ fontSize: 14 }} /> : <VisibilityIcon sx={{ fontSize: 14 }} />}
                                            sx={{ color: '#d4af37', fontSize: 10, p: '2px 8px', minWidth: 0, '&:hover': { bgcolor: 'rgba(212,175,55,0.1)' } }}
                                        >
                                            {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
                                        </Button>
                                    )}
                                </Box>
                                <Chip label={`${totalChocs}/${sizeObj.maxChoc} Chocs`} size="small"
                                    sx={{ bgcolor: totalChocs >= sizeObj.maxChoc ? 'rgba(244,67,54,0.18)' : 'rgba(212,175,55,0.12)',
                                        color: totalChocs >= sizeObj.maxChoc ? '#ff6b6b' : '#d4af37',
                                        border: '1px solid', borderColor: totalChocs >= sizeObj.maxChoc ? 'rgba(244,67,54,0.2)' : 'rgba(212,175,55,0.2)',
                                        fontWeight: 700, fontSize: 10, height: 22 }} />
                            </Box>
                        </Paper>
                        </motion.div>
                    </Grid>

                    {/* ─── RIGHT: Controls ─── */}
                    <Grid item xs={12} md={5}>
                        <motion.div
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Box sx={{ position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Price */}
                            <Paper elevation={0} className="glass" sx={{
                                p: 2.5, borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(255,107,53,0.08))',
                                border: '1px solid rgba(212,175,55,0.22)'
                            }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>Hamper Total</Typography>
                                        <Typography variant="h4" fontWeight="bold" sx={{ color: '#d4af37' }}>₹{totalPrice.toFixed(0)}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', display: 'block' }}>Base: ₹{sizeObj.price}</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', display: 'block' }}>Chocolates: ₹{totalChocsPrice}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>

                            {/* Control Tabs */}
                            <Paper elevation={0} className="glass" sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <Tabs value={controlTab} onChange={(_, v) => setControlTab(v)} variant="scrollable" scrollButtons="auto"
                                    sx={{
                                        borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: 44,
                                        '& .MuiTab-root': { color: 'rgba(255,255,255,0.45)', minHeight: 44, fontSize: 11.5, px: 1.5 },
                                        '& .Mui-selected': { color: '#d4af37' },
                                        '& .MuiTabs-indicator': { bgcolor: '#d4af37' }
                                    }}>
                                    <Tab label="📦 Size" />
                                    <Tab label="🧺 Style" />
                                    <Tab label="🍫 Chocs" />
                                    <Tab label="🎀 Decor" />
                                </Tabs>

                                <Box sx={{ p: 2.5, maxHeight: 345, overflowY: 'auto',
                                    '&::-webkit-scrollbar': { width: 4 },
                                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                                    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(212,175,55,0.3)', borderRadius: 2 }
                                }}>
                                    {/* ─── SIZE ─── */}
                                    {controlTab === 0 && (
                                        <Stack spacing={2}>
                                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>Hamper Size</Typography>
                                            <Grid container spacing={1.5}>
                                                {dynamicSizes.map(s => (
                                                    <Grid item xs={6} key={s.value}>
                                                        <Box onClick={() => setHamperSize(s.value)} sx={{
                                                            p: 1.5, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                                                            border: hamperSize === s.value ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                                                            bgcolor: hamperSize === s.value ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                                                            transition: 'all 0.2s',
                                                            '&:hover': { bgcolor: 'rgba(212,175,55,0.08)', border: '2px solid rgba(212,175,55,0.4)' }
                                                        }}>
                                                            <Typography sx={{ fontSize: 22 }}>{s.emoji}</Typography>
                                                            <Typography variant="body2" fontWeight={700} sx={{ color: '#fff', fontSize: 12 }}>{s.label}</Typography>
                                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.38)', fontSize: 10 }}>{s.desc}</Typography>
                                                            <Typography variant="body2" sx={{ color: '#d4af37', fontWeight: 800, mt: 0.5 }}>₹{s.price}</Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                                            {/* Quantity */}
                                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>Quantity</Typography>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <IconButton onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.07)', color: '#fff', width: 34, height: 34 }}>
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                                <Typography variant="h6" sx={{ color: '#fff', minWidth: 30, textAlign: 'center' }}>{quantity}</Typography>
                                                <IconButton onClick={() => setQuantity(q => Math.min(10, q + 1))}
                                                    sx={{ bgcolor: 'rgba(212,175,55,0.18)', color: '#d4af37', width: 34, height: 34 }}>
                                                    <AddIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </Stack>
                                    )}

                                    {/* ─── STYLE ─── */}
                                    {controlTab === 1 && (
                                        <Stack spacing={2}>
                                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>Container Style</Typography>
                                            <Stack spacing={1}>
                                                {dynamicContainers.map(c => (
                                                    <Box key={c.value} onClick={() => handleContainerChange(c.value)} sx={{
                                                        p: 1.5, borderRadius: 2, cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                                        border: containerStyle === c.value ? `2px solid ${c.color}` : '1px solid rgba(255,255,255,0.07)',
                                                        bgcolor: containerStyle === c.value ? `${c.color}18` : 'rgba(255,255,255,0.02)',
                                                        transition: 'all 0.2s',
                                                        '&:hover': { bgcolor: `${c.color}10`, border: `2px solid ${c.color}66` }
                                                    }}>
                                                        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                                            {c.emoji}
                                                        </Box>
                                                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: containerStyle === c.value ? 700 : 400 }}>{c.label}</Typography>
                                                    </Box>
                                                ))}
                                            </Stack>

                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>Theme</Typography>
                                            <Grid container spacing={1}>
                                                {THEMES.map(t => (
                                                    <Grid item xs={4} key={t.value}>
                                                        <Box onClick={() => handleThemeChange(t.value)} sx={{
                                                            p: 1, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                                                            border: theme === t.value ? `2px solid ${t.suggestColor}` : '1px solid rgba(255,255,255,0.07)',
                                                            bgcolor: theme === t.value ? `${t.suggestColor}18` : 'rgba(255,255,255,0.02)',
                                                            transition: 'all 0.2s',
                                                            '&:hover': { border: `2px solid ${t.suggestColor}66` }
                                                        }}>
                                                            <Typography sx={{ fontSize: 20 }}>{t.emoji}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#fff', fontWeight: theme === t.value ? 700 : 400, fontSize: 10 }}>{t.label}</Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                                            {/* Color picker */}
                                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>Hamper Color</Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                <input type="color" value={hamperColor} onChange={e => setHamperColor(e.target.value)}
                                                    style={{ width: 34, height: 34, border: 'none', cursor: 'pointer', borderRadius: 6, padding: 0 }} />
                                                {['#8B6914','#6D4C22','#AD1457','#C62828','#1a1a2e','#4A148C','#F9A825','#2E7D32'].map(c => (
                                                    <Tooltip key={c} title={c}>
                                                        <Box onClick={() => setHamperColor(c)} sx={{
                                                            width: 28, height: 28, borderRadius: '50%', bgcolor: c,
                                                            border: hamperColor === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.1)',
                                                            cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                                                            boxShadow: hamperColor === c ? `0 0 0 2px ${c}` : 'none'
                                                        }} />
                                                    </Tooltip>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    )}

                                    {/* ─── CHOCOLATES ─── */}
                                    {controlTab === 2 && (
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>Select Chocolates</Typography>
                                                <Chip label={`${totalChocs}/${sizeObj.maxChoc}`} size="small"
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                                            </Stack>
                                            {dynamicChocolates.map(choc => (
                                                <Box key={choc.type} sx={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    p: 1.2, borderRadius: 2,
                                                    bgcolor: (chocCounts[choc.type] || 0) > 0 ? 'rgba(212,175,55,0.07)' : 'rgba(255,255,255,0.02)',
                                                    border: '1px solid',
                                                    borderColor: (chocCounts[choc.type] || 0) > 0 ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: choc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                                            {choc.emoji}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: 12.5 }}>{choc.name}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#d4af37', fontSize: 11 }}>₹{choc.price}</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Stack direction="row" alignItems="center" spacing={0.7}>
                                                        {(chocCounts[choc.type] || 0) > 0 && (
                                                            <IconButton size="small" onClick={() => handleRemoveChoc(choc.type)}
                                                                sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#ff6b6b', width: 24, height: 24 }}>
                                                                <RemoveIcon sx={{ fontSize: 13 }} />
                                                            </IconButton>
                                                        )}
                                                        {(chocCounts[choc.type] || 0) > 0 && (
                                                            <Typography variant="body2" sx={{ color: '#d4af37', fontWeight: 700, minWidth: 16, textAlign: 'center', fontSize: 12 }}>
                                                                {chocCounts[choc.type]}
                                                            </Typography>
                                                        )}
                                                        <IconButton size="small" onClick={() => handleAddChoc(choc)}
                                                            disabled={totalChocs >= sizeObj.maxChoc}
                                                            sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: '#d4af37', width: 24, height: 24,
                                                                '&.Mui-disabled': { opacity: 0.3 } }}>
                                                            <AddIcon sx={{ fontSize: 13 }} />
                                                        </IconButton>
                                                    </Stack>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}

                                    {/* ─── DECORATIONS ─── */}
                                    {controlTab === 3 && (
                                        <Stack spacing={2}>
                                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>Decorative Elements</Typography>
                                            <Grid container spacing={1}>
                                                {DECORATIONS.map(d => (
                                                    <Grid item xs={3} key={d.type}>
                                                        <Box onClick={() => handleAddDec(d.type)} sx={{
                                                            p: 1, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                                                            bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                            transition: 'all 0.2s',
                                                            '&:hover': { bgcolor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', transform: 'scale(1.08)' }
                                                        }}>
                                                            <Typography sx={{ fontSize: 22 }}>{d.emoji}</Typography>
                                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>{d.label}</Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                                            {/* Photo upload */}
                                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>📸 Photo Card</Typography>
                                            <Stack spacing={1}>
                                                 <Button 
                                                     variant="outlined" component="label" fullWidth 
                                                     startIcon={isUploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
                                                     disabled={isUploading}
                                                     sx={{ 
                                                         borderColor: isUploading ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.12)', 
                                                         color: isUploading ? '#d4af37' : 'rgba(255,255,255,0.6)', 
                                                         borderStyle: 'dashed',
                                                         '&:hover': { borderColor: '#d4af37', color: '#d4af37' } 
                                                     }}
                                                 >
                                                     {isUploading ? 'Uploading...' : 'Upload Photo'}
                                                     <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
                                                 </Button>
                                                <Stack direction="row" spacing={1}>
                                                    <Button variant="outlined" size="small" startIcon={<AutoFixHighIcon />} fullWidth
                                                        sx={{ borderColor: 'rgba(212,175,55,0.3)', color: '#d4af37', fontSize: 11,
                                                            '&:hover': { bgcolor: 'rgba(212,175,55,0.08)' } }}>
                                                        ✨ Enhance Image
                                                    </Button>
                                                    <Button variant="outlined" size="small" startIcon={<BoltIcon />} fullWidth
                                                        sx={{ borderColor: 'rgba(255,107,53,0.3)', color: '#FF6B35', fontSize: 11,
                                                            '&:hover': { bgcolor: 'rgba(255,107,53,0.08)' } }}>
                                                        ⚡ Auto Upscale
                                                    </Button>
                                                </Stack>
                                                {photos.length > 0 && <Typography variant="caption" sx={{ color: '#6bcb77' }}>✅ {photos.length} photo(s) added</Typography>}
                                            </Stack>
                                        </Stack>
                                    )}
                                </Box>
                            </Paper>

                            {/* Instagram support */}
                            <Button variant="contained" fullWidth startIcon={<InstagramIcon />}
                                onClick={() => window.open('https://ig.me/m/arteza.in', '_blank')}
                                sx={{ bgcolor: '#E1306C', color: '#fff', borderRadius: '8px', py: 1.5, fontWeight: 600,
                                    textTransform: 'none', fontSize: 13, '&:hover': { bgcolor: '#C13584' } }}>
                                📷 Need help designing your chocolate hamper? Chat with us on Instagram
                            </Button>

                            {/* Add to cart */}
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={<ShoppingCartIcon />}
                                onClick={handleAddToCart}
                                sx={{
                                    py: 2,
                                    fontSize: '1.2rem',
                                    fontWeight: 900,
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                                    boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)',
                                    color: '#fff',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #6D28D9 0%, #DB2777 100%)',
                                        transform: 'translateY(-2px) scale(1.01)',
                                        boxShadow: '0 12px 40px rgba(124, 58, 237, 0.4)',
                                    },
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                            >
                                Add to Cart — ₹{totalPrice.toFixed(0)}
                            </Button>
                        </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </motion.div>
    );
};

export default ChocolateHamperPage;
