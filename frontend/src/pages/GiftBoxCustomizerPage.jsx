import React, { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, Button, Paper, Tabs, Tab,
    Chip, Stack, Divider, TextField, Select, MenuItem, FormControl,
    InputLabel, IconButton, Tooltip, Alert, Snackbar, CircularProgress
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
import GiftBoxCanvasEditor from '../components/Customization/GiftBox/GiftBoxCanvasEditor';
import { useAuth } from '../store/AuthContext';
import api from '../api/axios';

const GiftBox3DPreview = lazy(() => import('../components/Customization/GiftBox/GiftBox3DPreview'));

/* ─── Constants ─── */
const BOX_TYPES = [
    { label: 'Small Gift Box', value: 'small', price: 199, icon: '📦', w: 90, d: 80, h: 60 },
    { label: 'Medium Gift Box', value: 'medium', price: 349, icon: '📦', w: 110, d: 100, h: 75 },
    { label: 'Large Gift Box', value: 'large', price: 549, icon: '📦', w: 140, d: 125, h: 95 }
];

const BOX_FACES = [
    { id: 'insideBox', label: '📦 Inside Box', icon: '📦' }
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
    // Ribbons
    { type: 'ribbon_cross', label: 'Cross Ribbon', category: 'Ribbon', price: 60, emoji: '🎀' },
    { type: 'ribbon_vert', label: 'Vertical Ribbon', category: 'Ribbon', price: 40, emoji: '🎀' },
    { type: 'ribbon_horiz', label: 'Horizontal Ribbon', category: 'Ribbon', price: 40, emoji: '🎀' },
    // Stickers
    { type: 'sticker_bday', label: 'Birthday Sticker', category: 'Sticker', price: 20, emoji: '🎂' },
    { type: 'sticker_love', label: 'Love Sticker', category: 'Sticker', price: 20, emoji: '❤️' },
    { type: 'sticker_ty', label: 'Thank You Sticker', category: 'Sticker', price: 20, emoji: '🙏' },
    // Add-ons
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

import { useCart } from '../store/CartContext';

/* ─── Main Component ─── */
const GiftBoxCustomizerPage = () => {
    const { id, cartItemId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { updateCartItem } = useCart();

    // Box configurations
    const [boxType, setBoxType] = useState('small');
    const [material, setMaterial] = useState('matte');
    const [boxColor, setBoxColor] = useState('#8B2020');
    const [foamColor, setFoamColor] = useState('#f0dde8');
    const [activeFace, setActiveFace] = useState('insideBox');
    const [quantity, setQuantity] = useState(1);
    
    // For storing placed decorative/gift items inside the box
    const [faceDesigns, setFaceDesigns] = useState({
        insideBox: []
    });
    
    const [insideItems, setInsideItems] = useState({});
    
    const [selectedId, setSelectedId] = useState(null);
    const [previewTab, setPreviewTab] = useState(1); // 0 = 2D, 1 = 3D
    const [controlTab, setControlTab] = useState(0);
    
    // Ribbon customization state
    const [ribbonEnabled, setRibbonEnabled] = useState(true);
    const [ribbonStyle, setRibbonStyle] = useState('full'); // 'top', 'side', 'cross', 'full'
    const [ribbonColor, setRibbonColor] = useState('#FFD93D');
    const [ribbonWidth, setRibbonWidth] = useState(20); // in mm (will be scaled)
    const [showBow, setShowBow] = useState(true);

    const [showOverlay, setShowOverlay] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [product, setProduct] = useState(null);
    const stageRef = useRef(null);
    const [loading, setLoading] = useState(true);

    // Dynamic config from product schema
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
                const prod = res.data;
                setProduct(prod);

                if (prod.customization_schema) {
                    const schema = prod.customization_schema;
                    const allowedValues = ['small', 'medium', 'large'];
                    
                    // Force the 4 required types, merging data from schema if it exists
                    const finalBoxTypes = allowedValues.map(val => {
                        const defaultType = BOX_TYPES.find(b => b.value === val);
                        const schemaType = (schema.boxTypes || []).find(s => s.value === val);
                        if (!defaultType && !schemaType) return null;
                        return {
                            ...(defaultType || {}),
                            ...(schemaType || {}),
                            enabled: true
                        };
                    }).filter(Boolean);
                    
                        // Merge schema items with default GIFT_ITEMS: keep all defaults, override with schema if type matches
                        const schemaItems = (schema.items || []).map(it => {
                            if (typeof it === 'string') {
                                const found = GIFT_ITEMS.find(g => g.name === it || g.type === it) || DECORATIONS.find(d => d.label === it);
                                return found ? { ...found, enabled: true } : { type: it.toLowerCase().replace(/\s+/g, '_'), name: it, price: 50, emoji: '🎁', enabled: true };
                            }
                            return it;
                        });
                        
                        // Start with all default GIFT_ITEMS, then apply schema overrides
                        let parsedItems = GIFT_ITEMS.map(defaultItem => {
                            const schemaOverride = schemaItems.find(s => s.type === defaultItem.type);
                            return schemaOverride ? { ...defaultItem, ...schemaOverride } : { ...defaultItem };
                        });
                        
                        // Add any extra schema items that don't exist in GIFT_ITEMS defaults
                        schemaItems.forEach(si => {
                            if (!parsedItems.find(p => p.type === si.type)) {
                                parsedItems.push(si);
                            }
                        });
                        
                        // Filter out explicitly disabled items
                        parsedItems = parsedItems.filter(it => it && it.enabled !== false);

                        const has4x4 = parsedItems.find(i => i.type === 'frame_4x4');
                        if (!has4x4) parsedItems.push({ type: 'frame_4x4', name: '4x4 Photo Frame', price: 149, emoji: '🖼️', hasPhotoUpload: true });
                        
                        const has5x5 = parsedItems.find(i => i.type === 'frame_5x5');
                        if (!has5x5) parsedItems.push({ type: 'frame_5x5', name: '5x5 Photo Frame', price: 199, emoji: '🖼️', hasPhotoUpload: true });

                        setConfig({
                            boxTypes: finalBoxTypes,
                            materials: (schema.materials || MATERIALS).filter(it => it.enabled !== false),
                            decorations: (schema.decorations || DECORATIONS).filter(it => it.enabled !== false),
                            items: parsedItems
                        });

                    // Set defaults
                    if (!allowedValues.includes(boxType)) {
                        setBoxType('small');
                    }
                    
                    if (schema.materials?.length > 0) {
                        const firstEnabled = schema.materials.find(it => it.enabled !== false);
                        if (firstEnabled) setMaterial(firstEnabled.value);
                    }
                }

                // If editing existing cart item, restore its state
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
                            if (details.face_designs) setFaceDesigns(details.face_designs);
                            if (details.inside_items) setInsideItems(details.inside_items);
                            if (details.ribbon) {
                                setRibbonEnabled(details.ribbon.enabled);
                                setRibbonStyle(details.ribbon.style);
                                setRibbonColor(details.ribbon.color);
                                setRibbonWidth(details.ribbon.width);
                                setShowBow(details.ribbon.show_bow);
                            }
                            setQuantity(item.quantity || 1);
                        }
                    } catch (e) {
                        console.error("Failed to fetch cart item for re-edit", e);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch product:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProductAndCartItem();
    }, [id, cartItemId]);

    // Prices calculation
    const typeObj = config.boxTypes.find(b => b.value === boxType) || config.boxTypes[0] || BOX_TYPES[0];
    // Ensure typeObj always has physical dimensions with sensible defaults
    const typeObjWithDim = { w: 300, h: 300, d: 150, ...typeObj };
    const matObj = config.materials.find(m => m.value === material) || config.materials[0] || MATERIALS[0];
    
    const baseBoxPrice = (typeObj?.price || 0) + (matObj?.price || 0);
    // Item total from items placed inside the box
    const itemTotal = (faceDesigns.insideBox || []).reduce((sum, dec) => {
        const item = config.items.find(i => (i.type || i.name) === dec.type);
        return sum + (item ? (item.price || 0) : 0);
    }, 0);
    // Ensure all variables evaluate to a finite number to avoid NaN calculation
    const calcPrice = ((Number(baseBoxPrice) || 0) + (Number(itemTotal) || 0)) * (Number(quantity) || 1);
    const totalPrice = isNaN(calcPrice) ? 0 : calcPrice;

    // Decoration Handlers
    const handleAddDecoration = (decType, extraProps = {}) => {
        const id = `dec-${decType}-${Date.now()}`;
        const { w = 300, d = 150 } = typeObjWithDim;
        const existingCount = (faceDesigns['insideBox'] || []).length;
        // Scatter items in a grid pattern inside the canvas
        const cols = Math.max(3, Math.ceil(Math.sqrt(existingCount + 1)));
        const col = existingCount % cols;
        const row = Math.floor(existingCount / cols);
        const cellW = w / cols;
        const cellH = d / Math.ceil((existingCount + 1) / cols);
        const px = (col + 0.5) * cellW;
        const py = (row + 0.5) * cellH;
        setFaceDesigns(prev => ({
            ...prev,
            insideBox: [...(prev.insideBox || []), {
                id, type: decType,
                x: Math.round(px), y: Math.round(py),
                size: Math.round(Math.min(cellW, cellH) * 0.4),
                rotation: 0, scaleX: 1, scaleY: 1,
                ...extraProps
            }]
        }));
    };

    const handleUploadAndAdd = async (e, decType) => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please login to upload photos.', severity: 'warning' });
            setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
            return;
        }
        const file = e.target.files[0];
        if (!file) return;
        setSnackbar({ open: true, message: 'Uploading photo...', severity: 'info' });
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/products/upload-customization', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data.image_url || res.data.url;
            handleAddDecoration(decType, { photoUrl: url });
            setSnackbar({ open: true, message: 'Photo uploaded and frame added!', severity: 'success' });
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'Failed to upload photo.', severity: 'error' });
        }
    };

    useEffect(() => {
        window.handleAddDecorationDropGlobal = (decType, x, y) => {
            const id = `dec-${decType}-${Date.now()}`;
            setFaceDesigns(prev => ({
                ...prev,
                insideBox: [...(prev.insideBox || []), {
                    id, type: decType, x, y, size: 40, rotation: 0, scaleX: 1, scaleY: 1
                }]
            }));
        };
        return () => { window.handleAddDecorationDropGlobal = null; };
    }, []);

    const handleUpdateDecoration = (face, id, props) => {
        setFaceDesigns(prev => ({
            ...prev,
            [face]: prev[face].map(d => d.id === id ? { ...d, ...props } : d)
        }));
    };

    const handleDeleteSelected = () => {
        if (!selectedId) return;
        setFaceDesigns(prev => ({
            ...prev,
            insideBox: (prev.insideBox || []).filter(d => d.id !== selectedId)
        }));
        setSelectedId(null);
    };

    const handleResetFace = () => {
        setFaceDesigns(prev => ({ ...prev, insideBox: [] }));
        setSelectedId(null);
    };

    const uploadContextCanvas = async (source, filename, isStage = false) => {
        if (!source) return null;
        try {
            let canvas = null;
            let dataUrl = null;

            if (isStage) {
                // Konva Stage (2D)
                if (typeof source.toDataURL !== 'function') return null;
                const transformers = source.find('Transformer');
                transformers.forEach(t => t.hide());
                dataUrl = source.toDataURL({ pixelRatio: 3, mimeType: 'image/png' });
                transformers.forEach(t => t.show());
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
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], filename, { type: mime });

            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await api.post('/products/upload-customization', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            return uploadRes.data.image_url || uploadRes.data.url;
        } catch (e) {
            console.error("Snapshot capture/upload failed", e);
            return null;
        }
    };


    const handleAddToCart = async () => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please login to add items to cart.', severity: 'warning' });
            setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
            return;
        }

        setSnackbar({ open: true, message: '🎁 Processing your advanced gift box...', severity: 'info' });

        const currentFaceDesign = faceDesigns[activeFace];

        let previewUrl = null;
        try {
            if (stageRef.current) {
                previewUrl = await uploadContextCanvas(stageRef.current, 'gift_box_interior.png', true);
            }
        } catch (e) { console.warn('Canvas capture warning:', e); }

        const customization_details = {
            product: 'pro_gift_box',
            box_type: boxType,
            material,
            box_color: boxColor,
            foam_color: foamColor,
            face_designs: faceDesigns,
            inside_items: insideItems,
            ribbon: {
                enabled: ribbonEnabled,
                style: ribbonStyle,
                color: ribbonColor,
                width: ribbonWidth,
                show_bow: showBow
            },
            preview_image_url: previewUrl,
            quantity,
        };

        try {
            if (cartItemId) {
                await updateCartItem(parseInt(cartItemId), {
                    customization_details,
                    preview_image_url: previewUrl
                });
                setSnackbar({ open: true, message: '✅ Cart item updated!', severity: 'success' });
            } else {
                await api.post('/cart/items/', {
                    product_id: parseInt(id) || 1,
                    quantity,
                    customization_details,
                    preview_image_url: previewUrl
                });
                setSnackbar({ open: true, message: '✅ Pro Box added to cart!', severity: 'success' });
            }
            setTimeout(() => navigate('/cart'), 1500);
        } catch (err) {
            console.error('Cart error:', err);
            setSnackbar({ open: true, message: 'Failed to add to cart.', severity: 'error' });
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #10192a 100%)', pt: 2, pb: 4 }}>
            <Container maxWidth="xl">
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff' }}>
                        🎁 Professional Box Builder
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
                        Architect your perfect gifting experience with realistic materials and faces.
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* LEFT: Live Preview */}
                    <Grid item xs={12} md={7}>
                        <Paper elevation={0} className="glass" sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', bgcolor: '#151521' }}>
                                <Tabs value={previewTab} onChange={(_, v) => setPreviewTab(v)} sx={{ minHeight: 48, '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)' }, '& .Mui-selected': { color: '#FFD93D' }}}>
                                    <Tab icon={<EditIcon />} label="2D Designer" iconPosition="start" />
                                    <Tab icon={<ViewInArIcon />} label="3D Preview" iconPosition="start" />
                                </Tabs>
                            </Box>

                            <Box className="preview3d" sx={{ height: 600, position: 'relative' }}>
                                {/* 2D Mode */}
                                <Box 
                                    inert={previewTab !== 0 ? '' : undefined}
                                    sx={{ 
                                        display: previewTab === 0 ? 'flex' : 'none', 
                                        flexDirection: 'column', 
                                        height: '100%' 
                                    }}
                                >
                                    {/* 2D Canvas — always shows Inside Box */}
                                    <Box sx={{ flexGrow: 1, position: 'relative', p: 2 }}>
                                            <GiftBoxCanvasEditor
                                                boxDimensions={typeObjWithDim}
                                                boxColor={boxColor}
                                                foamColor={foamColor}
                                                material={material}
                                                decorations={faceDesigns['insideBox'] || []}
                                                selectedId={selectedId}
                                                setSelectedId={setSelectedId}
                                                onUpdateDecoration={(id, props) => handleUpdateDecoration('insideBox', id, props)}
                                                itemsConfig={[...config.decorations, ...config.items]}
                                                onStageReady={(node) => stageRef.current = node}
                                            />
                                        <Box sx={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 1 }}>
                                            {selectedId && (
                                                <IconButton onClick={handleDeleteSelected} sx={{ bgcolor: 'rgba(244,67,54,0.8)', color: '#fff' }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>

                                {/* 3D Mode */}
                                <Box 
                                    inert={previewTab !== 1 ? '' : undefined}
                                    sx={{ 
                                        display: previewTab === 1 ? 'block' : 'none', 
                                        height: '100%', 
                                        width: '100%', 
                                        position: 'relative' 
                                    }}
                                >
                                    <Suspense fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress /></Box>}>
                                        <GiftBox3DPreview 
                                            boxType={boxType} 
                                            boxDimensions={typeObjWithDim}
                                            boxColor={boxColor} 
                                            material={material} 
                                            faceDesigns={faceDesigns}
                                            insideItems={insideItems} 
                                            foamColor={foamColor}
                                            setExternalFoamColor={setFoamColor}
                                            ribbonSettings={{
                                                enabled: ribbonEnabled,
                                                style: ribbonStyle,
                                                color: ribbonColor,
                                                width: ribbonWidth,
                                                showBow: showBow
                                            }}
                                        />
                                    </Suspense>
                                </Box>

                                {/* ── Floating Items Layer Panel (Visible in both 2D & 3D) ── */}
                                <Box sx={{
                                    position: 'absolute', bottom: 14, left: 14,
                                    width: 210, maxHeight: 250,
                                    bgcolor: 'rgba(10,10,20,0.85)',
                                    backdropFilter: 'blur(16px)',
                                    borderRadius: 2.5,
                                    border: '1px solid rgba(255,217,61,0.25)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                                    overflow: 'hidden',
                                    zIndex: 50,
                                    display: (previewTab === 1 && !showOverlay) ? 'none' : 'flex', flexDirection: 'column',
                                    pointerEvents: 'auto'
                                }}>
                                    {/* Panel header */}
                                    <Box sx={{ px: 1.5, py: 1, bgcolor: 'rgba(255,217,61,0.12)', borderBottom: '1px solid rgba(255,217,61,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: '#FFD93D', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>📦 BOX LAYERS</Typography>
                                        <Chip 
                                            label={(faceDesigns.insideBox || []).length} 
                                            size="small" 
                                            sx={{ height: 18, fontSize: 10, bgcolor: '#FFD93D', color: '#1a1a2e', fontWeight: 'bold' }} 
                                        />
                                    </Box>

                                    {/* Item list */}
                                    <Box sx={{ overflowY: 'auto', flex: 1, '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,217,61,0.3)', borderRadius: 2 } }}>
                                        {(faceDesigns.insideBox || []).length === 0 ? (
                                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5 }}>Your box is empty.<br/>Add items to begin.</Typography>
                                            </Box>
                                        ) : (
                                            [...(faceDesigns.insideBox || [])].reverse().map((item) => {
                                                const itemDef = [...config.items, ...config.decorations].find(i => (i.type || i.name || i.label) === item.type);
                                                const emoji = itemDef?.emoji || '🎁';
                                                const name = itemDef?.name || itemDef?.label || item.type;
                                                return (
                                                    <Box key={item.id} sx={{
                                                        display: 'flex', alignItems: 'center', gap: 1.2,
                                                        px: 1.5, py: 1,
                                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                                                        cursor: previewTab === 0 ? 'pointer' : 'default',
                                                        transition: 'background 0.2s'
                                                    }} onClick={() => previewTab === 0 && setSelectedId(item.id)}>
                                                        <Typography sx={{ fontSize: 16 }}>{emoji}</Typography>
                                                        <Typography sx={{ 
                                                            color: selectedId === item.id ? '#FFD93D' : '#fff', 
                                                            fontSize: 11, fontWeight: selectedId === item.id ? 700 : 400,
                                                            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                                                        }}>{name}</Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFaceDesigns(prev => ({
                                                                    ...prev,
                                                                    insideBox: prev.insideBox.filter(d => d.id !== item.id)
                                                                }));
                                                                if (selectedId === item.id) setSelectedId(null);
                                                            }}
                                                            sx={{ color: 'rgba(255,80,80,0.6)', p: 0.4, '&:hover': { color: '#ff4444', bgcolor: 'rgba(255,68,68,0.12)' } }}
                                                        >
                                                            <DeleteIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Box>
                                                );
                                            })
                                        )}
                                    </Box>

                                    {/* Footer */}
                                    {(faceDesigns.insideBox || []).length > 0 && (
                                        <Box sx={{ px: 1.5, py: 0.8, bgcolor: 'rgba(0,0,0,0.2)' }}>
                                            <Button
                                                size="small" fullWidth
                                                onClick={handleResetFace}
                                                startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
                                                sx={{ color: 'rgba(255,100,100,0.8)', fontSize: 10, textTransform: 'none', '&:hover': { color: '#ff5252' } }}
                                            >
                                                Clear Workspace
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                                
                                {previewTab === 0 && (
                                    <Box sx={{ 
                                        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                                        bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                                        px: 2, py: 0.8, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                                        zIndex: 10, pointerEvents: 'none'
                                    }}>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 500, letterSpacing: 0.5 }}>
                                            💡 TIP: USE <span style={{ color: '#FFD93D' }}>MOUSE WHEEL</span> TO ZOOM & <span style={{ color: '#FFD93D' }}>DRAG CANVAS</span> TO PAN
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            <Box sx={{ px: 2, py: 1.2, bgcolor: '#151521', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 10.5, letterSpacing: 0.3 }}>
                                        {previewTab === 0 ? '✨ CUSTOMIZE BOX LAYERS' : '💎 PRO 3D PREVIEW'}
                                    </Typography>
                                    {previewTab === 1 && (
                                        <Button 
                                            size="small" 
                                            onClick={() => setShowOverlay(!showOverlay)} 
                                            startIcon={showOverlay ? <VisibilityOffIcon sx={{ fontSize: 14 }} /> : <VisibilityIcon sx={{ fontSize: 14 }} />}
                                            sx={{ color: '#FFD93D', fontSize: 10, p: '2px 8px', minWidth: 0, '&:hover': { bgcolor: 'rgba(255,217,61,0.1)' } }}
                                        >
                                            {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>


                    {/* RIGHT: Configuration panel */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{ position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            
                            <Paper elevation={0} className="glass" sx={{ p: 2, borderRadius: 3, bgcolor: 'transparent', color: '#fff', border: '1px solid rgba(255,107,107,0.3)' }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Total Configuration Price</Typography>
                                <Typography variant="h4" sx={{ color: '#FFD93D', fontWeight: 800, background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{totalPrice.toFixed(0)}</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Base: ₹{baseBoxPrice} | Items: ₹{itemTotal}</Typography>
                            </Paper>

                            <Paper elevation={0} className="glass" sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Tabs value={controlTab} onChange={(_, v) => setControlTab(v)} variant="scrollable" sx={{ bgcolor: '#151521', '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)', minHeight: 48 }, '& .Mui-selected': { color: '#FFD93D' }}}>
                                    <Tab label="📦 Box" />
                                    <Tab label="🎀 Ribbon" />
                                    <Tab label="🔮 Items" />
                                </Tabs>

                                <Box sx={{ p: 2, height: 420, overflowY: 'auto' }}>
                                    
                                    {/* BOX TAB */}
                                    {controlTab === 0 && (
                                        <Stack spacing={3}>
                                            <section>
                                                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>Box Construction</Typography>
                                                <Grid container spacing={1}>
                                                    {config.boxTypes.map(bt => (
                                                        <Grid item xs={6} key={bt.value}>
                                                            <Box onClick={() => setBoxType(bt.value)} sx={{
                                                                p: 1.5, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                                                                border: boxType === bt.value ? '2px solid #FFD93D' : '1px solid rgba(255,255,255,0.1)',
                                                                bgcolor: boxType === bt.value ? 'rgba(255,217,61,0.1)' : 'transparent',
                                                            }}>
                                                                <Typography>{bt.icon}</Typography>
                                                                <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{bt.label}</Typography>
                                                                <Typography sx={{ color: '#FFD93D', fontSize: 12 }}>₹{bt.price}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </section>

                                            <section>
                                                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>Material Finish</Typography>
                                                <Grid container spacing={1}>
                                                    {config.materials.map(m => (
                                                        <Grid item xs={6} key={m.value}>
                                                            <Box onClick={() => setMaterial(m.value)} sx={{
                                                                p: 1, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                                                                border: material === m.value ? '2px solid #6BCB77' : '1px solid rgba(255,255,255,0.1)',
                                                                bgcolor: material === m.value ? 'rgba(107,203,119,0.1)' : 'transparent',
                                                            }}>
                                                                <Typography sx={{ color: '#fff', fontSize: 13 }}>{m.label}</Typography>
                                                                <Typography sx={{ color: '#6BCB77', fontSize: 12 }}>+{m.price === 0 ? 'Free' : `₹${m.price}`}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </section>

                                            <section>
                                                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>Box Color</Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    {BOX_COLORS.map(c => (
                                                        <Tooltip key={c.value} title={c.label}>
                                                            <Box onClick={() => setBoxColor(c.value)} sx={{
                                                                width: 36, height: 36, borderRadius: '50%', bgcolor: c.swatch,
                                                                border: boxColor === c.value ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                                                                cursor: 'pointer'
                                                            }} />
                                                        </Tooltip>
                                                    ))}
                                                </Stack>
                                            </section>

                                            <section>
                                                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>Interior Lining (Foam/Velvet)</Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    {[
                                                        { label: 'Blush Velvet',  value: '#f0dde8' },
                                                        { label: 'Pearl White',   value: '#f5f0f2' },
                                                        { label: 'Midnight Blue', value: '#1a2a4a' },
                                                        { label: 'Sage Green',    value: '#c8dbc8' },
                                                        { label: 'Champagne',     value: '#f5e6c8' },
                                                        { label: 'Midnight Black', value: '#1a1a2e' },
                                                    ].map(fc => (
                                                        <Tooltip key={fc.value} title={fc.label}>
                                                            <Box onClick={() => setFoamColor(fc.value)} sx={{
                                                                width: 32, height: 32, borderRadius: '50%', bgcolor: fc.value,
                                                                border: foamColor === fc.value ? '3px solid #FFD93D' : '2px solid rgba(255,255,255,0.2)',
                                                                cursor: 'pointer'
                                                            }} />
                                                        </Tooltip>
                                                    ))}
                                                </Stack>
                                            </section>
                                        </Stack>
                                    )}

                                    {/* RIBBON TAB */}
                                    {controlTab === 1 && (
                                        <Stack spacing={3}>
                                            <section>
                                                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    Ribbon Customization
                                                    <Chip 
                                                        label={ribbonEnabled ? "Enabled" : "Disabled"} 
                                                        size="small" 
                                                        onClick={() => setRibbonEnabled(!ribbonEnabled)}
                                                        sx={{ bgcolor: ribbonEnabled ? '#6BCB77' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
                                                    />
                                                </Typography>
                                                
                                                {!ribbonEnabled && (
                                                    <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                        Ribbon is currently disabled. Toggle to enable.
                                                    </Alert>
                                                )}
                                            </section>

                                            {ribbonEnabled && (
                                                <>
                                                    <section>
                                                        <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>Ribbon Style</Typography>
                                                        <Grid container spacing={1}>
                                                            {[
                                                                { label: 'Top Only', value: 'top', icon: '🎀' },
                                                                { label: 'Side Only', value: 'side_only', icon: '🎗️' },
                                                                { label: 'Side Wrap', value: 'side', icon: '🎗️' },
                                                                { label: 'Cross Wrap', value: 'cross', icon: '🎁' },
                                                                { label: 'Full Wrap', value: 'full', icon: '📦' },
                                                            ].map(style => (
                                                                <Grid item xs={6} key={style.value}>
                                                                    <Box onClick={() => setRibbonStyle(style.value)} sx={{
                                                                        p: 1.5, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                                                                        border: ribbonStyle === style.value ? '2px solid #FFD93D' : '1px solid rgba(255,255,255,0.1)',
                                                                        bgcolor: ribbonStyle === style.value ? 'rgba(255,217,61,0.1)' : 'transparent',
                                                                    }}>
                                                                        <Typography>{style.icon}</Typography>
                                                                        <Typography sx={{ color: '#fff', fontSize: 13 }}>{style.label}</Typography>
                                                                    </Box>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    </section>

                                                    <section>
                                                        <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>Ribbon Color</Typography>
                                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                                            {['#FFD93D', '#FF6B6B', '#6BCB77', '#4FC3F7', '#C678DD', '#FFFFFF', '#333333', '#8B2020'].map(c => (
                                                                <Box key={c} onClick={() => setRibbonColor(c)} sx={{
                                                                    width: 32, height: 32, borderRadius: '50%', bgcolor: c,
                                                                    border: ribbonColor === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                                                                    cursor: 'pointer'
                                                                }} />
                                                            ))}
                                                        </Stack>
                                                    </section>

                                                    <section>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="subtitle2" sx={{ color: '#fff' }}>Ribbon Width</Typography>
                                                            <Typography variant="caption" sx={{ color: '#FFD93D' }}>{ribbonWidth}mm</Typography>
                                                        </Box>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <IconButton size="small" onClick={() => setRibbonWidth(Math.max(10, ribbonWidth - 5))} sx={{ color: '#fff' }}>
                                                                <RemoveIcon />
                                                            </IconButton>
                                                            <Box sx={{ flexGrow: 1, height: 4, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, position: 'relative' }}>
                                                                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(ribbonWidth - 10) / 40 * 100}%`, bgcolor: '#FFD93D', borderRadius: 2 }} />
                                                            </Box>
                                                            <IconButton size="small" onClick={() => setRibbonWidth(Math.min(50, ribbonWidth + 5))} sx={{ color: '#fff' }}>
                                                                <AddIcon />
                                                            </IconButton>
                                                        </Stack>
                                                    </section>

                                                    <section>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="subtitle2" sx={{ color: '#fff' }}>Include Bow on Top</Typography>
                                                            <Button 
                                                                size="small" 
                                                                onClick={() => setShowBow(!showBow)}
                                                                sx={{ color: showBow ? '#FFD93D' : 'rgba(255,255,255,0.5)' }}
                                                            >
                                                                {showBow ? "Active" : "Inactive"}
                                                            </Button>
                                                        </Box>
                                                    </section>
                                                </>
                                            )}
                                        </Stack>
                                    )}

                                    {/* ITEMS TAB — tab index 2 */}
                                    {controlTab === 2 && (
                                        <Stack spacing={2}>
                                            <Typography variant="subtitle2" sx={{ color: '#fff' }}>Add items inside the box</Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>Click ➕ to place an item. It shows in both 2D designer and 3D preview</Typography>

                                            {config.items.map(item => (
                                                <Box key={item.type || item.name} sx={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Typography fontSize={24}>{item.emoji || '🎁'}</Typography>
                                                        <Box>
                                                            <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{item.name || item.label}</Typography>
                                                            <Typography sx={{ color: '#6BCB77', fontSize: 12 }}>₹{item.price || 0}</Typography>
                                                        </Box>
                                                    </Box>
                                                    
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {item.hasPhotoUpload ? (
                                                            <Button variant="outlined" size="small" component="label" sx={{ color: '#FFD93D', borderColor: '#FFD93D', textTransform: 'none' }}>
                                                                Upload Photo
                                                                <input type="file" hidden accept="image/*" onChange={(e) => handleUploadAndAdd(e, item.type || item.name)} />
                                                            </Button>
                                                        ) : (
                                                            <IconButton 
                                                                onClick={() => handleAddDecoration(item.type || item.name)}
                                                                sx={{ color: '#FFD93D', bgcolor: 'rgba(255,217,61,0.1)' }}
                                                            >
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                </Box>
                            </Paper>

                            <Button
                                variant="contained" fullWidth size="large"
                                onClick={handleAddToCart}
                                sx={{ py: 2, borderRadius: 3, fontWeight: 'bold', fontSize: 16, background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)', color: '#1a1a2e', mt: 2 }}
                            >
                                Confirm Design & Add to Cart — ₹{totalPrice.toFixed(0)}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default GiftBoxCustomizerPage;
