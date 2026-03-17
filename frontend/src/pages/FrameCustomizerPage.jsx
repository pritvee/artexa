import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy, useRef, useReducer } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, Button, CircularProgress,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Slider, Divider, Paper, Tabs, Tab, Chip, IconButton,
    Tooltip, Alert, Snackbar, Stack, Checkbox, FormControlLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import EditIcon from '@mui/icons-material/Edit';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import CelebrationIcon from '@mui/icons-material/Celebration';
import AbcIcon from '@mui/icons-material/Abc';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FlipToFrontIcon from '@mui/icons-material/FlipToFront';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter';
import AlignHorizontalRightIcon from '@mui/icons-material/AlignHorizontalRight';
import AlignVerticalTopIcon from '@mui/icons-material/AlignVerticalTop';
import AlignVerticalCenterIcon from '@mui/icons-material/AlignVerticalCenter';
import AlignVerticalBottomIcon from '@mui/icons-material/AlignVerticalBottom';
import LayersIcon from '@mui/icons-material/Layers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import InstagramSupportButton from '../components/Shared/InstagramSupportButton';
import { Reorder, AnimatePresence } from 'framer-motion';

import FrameCanvasEditor, { STICKER_ICONS } from '../components/Customization/FrameBuilder/FrameCanvasEditor';
import ImageEnhancerPanel from '../components/Customization/Shared/ImageEnhancerPanel';
const Frame3DPreview = lazy(() => import('../components/Customization/FrameBuilder/Frame3DPreview'));

/* ─── Constants ─── */
const DEFAULT_FRAME_SIZES = [
    { label: "4x4 – Mini", value: "4x4 – Mini", width: 4, height: 4, price: 99 },
    { label: "5x5 – Mini", value: "5x5 – Mini", width: 5, height: 5, price: 129 },
    { label: "8x6 – A5", value: "8x6 – A5", width: 8, height: 6, price: 250 },
    { label: "12x8 – A4", value: "12x8 – A4", width: 12, height: 8, price: 380 },
    { label: "12x18 – A3", value: "12x18 – A3", width: 12, height: 18, price: 680 },
    { label: "16.5x23.4 – A2", value: "16.5x23.4 – A2", width: 16.5, height: 23.4, price: 1499 }
];

const DEFAULT_FRAME_STYLES = [
    { label: "Canvas Frame", type: "canvas", value: "canvas" },
    { label: "Wooden Frame", type: "wooden", value: "wooden" },
    { label: "Normal Frame", type: "normal", value: "normal" }
];

const LAYOUTS = [
    { label: 'Single', value: 'single', slots: 1 },
    { label: 'Two-Photo', value: 'two-photo', slots: 2 },
    { label: 'Collage (3)', value: 'collage-3', slots: 3 },
    { label: 'Grid (4)', value: 'grid-4', slots: 4 },
    { label: 'Grid (5)', value: 'grid-5', slots: 5 },
    { label: 'Grid (6)', value: 'grid-6', slots: 6 },
    { label: 'Grid (7)', value: 'grid-7', slots: 7 },
    { label: 'Grid (8)', value: 'grid-8', slots: 8 },
    { label: 'Grid (9)', value: 'grid-9', slots: 9 }
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
    },
    {
        name: 'Sparkles',
        category: 'glow',
        pack: [
            { url: 'https://img.icons8.com/color/512/star.png', label: 'Star' },
            { url: 'https://img.icons8.com/color/512/sparkles.png', label: 'Sparkle' },
            { url: 'https://img.icons8.com/color/512/magic-wand.png', label: 'Magic' },
            { url: 'https://img.icons8.com/color/512/confetti.png', label: 'Confetti' }
        ]
    },
    {
        name: 'Birthday',
        category: 'party',
        pack: [
            { url: 'https://img.icons8.com/color/512/balloons.png', label: 'Balloons' },
            { url: 'https://img.icons8.com/color/512/birthday-cake.png', label: 'Cake' },
            { url: 'https://img.icons8.com/color/512/gift.png', label: 'Gift' },
            { url: 'https://img.icons8.com/color/512/party-hat.png', label: 'Hat' }
        ]
    }
];

import { useCart } from '../store/CartContext';

/* ─── History / Undo-Redo helpers ─── */
const MAX_HISTORY = 50;

const INITIAL_DESIGN = {
    frameSize: '',
    frameStyle: '',
    frameColor: '',
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
    photoFilter: 'none',
    orientation: 'landscape',
    frameThickness: 1,
    innerSpacing: 20,
    outerPadding: 40,
    innerBorderColor: '#ffffff',
};

/* ─── Main Component ─── */
const FrameCustomizerPage = () => {
    const { id, cartItemId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { updateCartItem } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewTab, setPreviewTab] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [quantity, setQuantity] = useState(1);
    const [wallPreview, setWallPreview] = useState('none');
    const [glassReflection, setGlassReflection] = useState(true);
    const [tiltAngle] = useState(0);
    const [controlTab, setControlTab] = useState(0);
    const [autoRotate, setAutoRotate] = useState(true);

    // ── History stack ──
    const historyRef = useRef([INITIAL_DESIGN]);   // stack of design snapshots
    const historyIdxRef = useRef(0);               // current pointer into stack
    const [, forceRender] = useReducer(n => n + 1, 0);
    const skipHistoryRef = useRef(false);           // prevent self-loops when restoring

    // Current design state is always historyRef.current[historyIdxRef.current]
    const design = historyRef.current[historyIdxRef.current];

    // ── Derived setters that also record history ──
    const pushHistory = useCallback((updater) => {
        if (skipHistoryRef.current) return;
        const current = historyRef.current[historyIdxRef.current];
        const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };

        // Trim any redo future when new action is recorded
        historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);

        // Cap at MAX_HISTORY
        if (historyRef.current.length >= MAX_HISTORY) {
            historyRef.current = historyRef.current.slice(historyRef.current.length - MAX_HISTORY + 1);
        }
        historyRef.current.push(next);
        historyIdxRef.current = historyRef.current.length - 1;
        forceRender();
    }, []);

    const undo = useCallback(() => {
        if (historyIdxRef.current <= 0) return;
        historyIdxRef.current -= 1;
        forceRender();
        setSnackbar({ open: true, message: '↩ Undo', severity: 'info' });
    }, []);

    const redo = useCallback(() => {
        if (historyIdxRef.current >= historyRef.current.length - 1) return;
        historyIdxRef.current += 1;
        forceRender();
        setSnackbar({ open: true, message: '↪ Redo', severity: 'info' });
    }, []);

    // ── Convenience destructure of current design ──
    const {
        frameSize, frameStyle, frameColor, layout, userImages, uploadedFileUrls,
        textLayers, stickers, layerOrder, enhancedImages, imgProps, hiddenLayers,
        borderDesign, matThickness, matColor, photoFilter, orientation, frameThickness,
        innerSpacing, outerPadding, innerBorderColor
    } = design;

    // ── History-aware setters (replace simple useState setters) ──
    const setFrameSize          = (v) => pushHistory(d => ({ ...d, frameSize: v }));
    const setFrameStyle         = (v) => pushHistory(d => ({ ...d, frameStyle: v }));
    const setFrameColor         = (v) => pushHistory(d => ({ ...d, frameColor: v }));
    const setLayout             = (v) => pushHistory(d => ({ ...d, layout: v }));
    const setUserImages         = (u) => pushHistory(d => ({ ...d, userImages: typeof u === 'function' ? u(d.userImages) : u }));
    const setUploadedFileUrls   = (u) => pushHistory(d => ({ ...d, uploadedFileUrls: typeof u === 'function' ? u(d.uploadedFileUrls) : u }));
    const setTextLayers         = (u) => pushHistory(d => ({ ...d, textLayers: typeof u === 'function' ? u(d.textLayers) : u }));
    const setStickers           = (u) => pushHistory(d => ({ ...d, stickers: typeof u === 'function' ? u(d.stickers) : u }));
    const setLayerOrder         = (u) => pushHistory(d => ({ ...d, layerOrder: typeof u === 'function' ? u(d.layerOrder) : u }));
    const setEnhancedImages     = (u) => pushHistory(d => ({ ...d, enhancedImages: typeof u === 'function' ? u(d.enhancedImages) : u }));
    const setImgProps           = (u) => pushHistory(d => ({ ...d, imgProps: typeof u === 'function' ? u(d.imgProps) : u }));
    const setHiddenLayers       = (u) => pushHistory(d => ({ ...d, hiddenLayers: typeof u === 'function' ? u(d.hiddenLayers) : u }));
    const setBorderDesign       = (v) => pushHistory(d => ({ ...d, borderDesign: v }));
    const setMatThickness       = (v) => pushHistory(d => ({ ...d, matThickness: v }));
    const setMatColor           = (v) => pushHistory(d => ({ ...d, matColor: v }));
    const setPhotoFilter        = (v) => pushHistory(d => ({ ...d, photoFilter: v }));
    const setOrientation        = (v) => pushHistory(d => ({ ...d, orientation: v }));
    const setFrameThickness     = (v) => pushHistory(d => ({ ...d, frameThickness: v }));
    const setInnerSpacing       = (v) => pushHistory(d => ({ ...d, innerSpacing: v }));
    const setOuterPadding       = (v) => pushHistory(d => ({ ...d, outerPadding: v }));
    const setInnerBorderColor   = (v) => pushHistory(d => ({ ...d, innerBorderColor: v }));

    // Remaining non-historyable state (UI/meta only)
    const [selectedId, setSelectedId] = useState(null);

    const stageRef = useRef(null);
    const [textureCanvas, setTextureCanvas] = useState(null);

    // Dynamic Pricing
    const [totalPrice, setTotalPrice] = useState(0);
    const [basePrice, setBasePrice] = useState(0);

    // ── Keyboard shortcuts ──
    useEffect(() => {
        const handleKey = (e) => {
            const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
            if (isInput) return;
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [undo, redo]);

    // Initialize layers when photos or layout changes
    useEffect(() => {
        const slots = LAYOUTS.find(l => l.value === layout)?.slots || 1;
        const imgIds = [];
        for (let i = 0; i < slots; i++) imgIds.push(`img-${i}`);
        // Merge text and sticker ids from the current design
        const txtIds = textLayers.map(t => t.id);
        const stkIds = stickers.map(s => s.id);
        const newOrder = [...imgIds, ...txtIds.filter(id => !imgIds.includes(id)), ...stkIds.filter(id => !imgIds.includes(id))];
        // Only update if the img ids changed (avoid infinite loop)
        const currentImgIds = layerOrder.filter(id => id.startsWith('img-'));
        if (JSON.stringify(currentImgIds) !== JSON.stringify(imgIds)) {
            pushHistory(d => ({ ...d, layerOrder: newOrder }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layout]);

    // Fetch Product — seed the history base state with product defaults
    useEffect(() => {
        const fetchProductAndCartItem = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
                setBasePrice(response.data.price);

                const sizes = response.data.customization_schema?.sizes || DEFAULT_FRAME_SIZES;
                const styles = response.data.customization_schema?.styles || DEFAULT_FRAME_STYLES;
                const activeSizes = sizes.filter(s => s.enabled !== false);
                const activeStyles = styles.filter(s => s.enabled !== false);

                // Seed history with one clean initial snapshot (no back-tracking past product load)
                let initialSnapshot = {
                    ...INITIAL_DESIGN,
                    frameSize: activeSizes[0]?.value || '',
                    frameStyle: activeStyles[0]?.value || activeStyles[0]?.type || '',
                    frameColor: '#111111',
                    layerOrder: ['img-0'],
                };

                // If editing existing cart item, restore its state
                if (cartItemId) {
                    try {
                        const cartRes = await api.get('/cart/');
                        const item = cartRes.data.items.find(i => i.id === parseInt(cartItemId));
                        if (item && item.customization_details) {
                            const details = item.customization_details;
                            initialSnapshot = {
                                ...initialSnapshot,
                                ...details,
                                hiddenLayers: new Set(details.layers_config?.hiddenLayers || []),
                            };
                            setQuantity(item.quantity || 1);
                        }
                    } catch (e) {
                        console.error("Failed to fetch cart item for re-edit", e);
                    }
                }

                historyRef.current = [initialSnapshot];
                historyIdxRef.current = 0;
                forceRender();
            } catch (error) {
                console.error('Error fetching product', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductAndCartItem();
    }, [id, cartItemId]);

    useEffect(() => {
        if (!basePrice && basePrice !== 0) return;
        const schemaSizes = product?.customization_schema?.sizes || DEFAULT_FRAME_SIZES;
        const activeSizes = schemaSizes.filter(s => s.enabled !== false);

        const sizeObj = activeSizes.find(s => s.value === frameSize) || activeSizes[0] || { price: 0 };
        setTotalPrice((basePrice + (sizeObj.price || 0)) * quantity);
    }, [frameSize, basePrice, quantity, product]);

    const uploadContextCanvas = async (source, filename, isStage = false) => {
        if (!source) {
            console.warn(`Snapshot skip: Source for ${filename} is null`);
            return null;
        }
        
        try {
            let dataUrl;
            
            if (isStage) {
                // Handle Konva Stage
                if (typeof source.find !== 'function' || typeof source.toDataURL !== 'function') {
                    console.error("Source is not a valid Konva Stage instance");
                    return null;
                }
                
                const transformers = source.find('Transformer');
                transformers.forEach(t => t.hide());
                
                dataUrl = source.toDataURL({ pixelRatio: 3, mimeType: 'image/png' });
                
                transformers.forEach(t => t.show());
            } else {
                // Handle HTML Canvas Element (e.g. from Three.js or simple canvas)
                const canvas = source instanceof HTMLCanvasElement ? source : 
                              (source.domElement instanceof HTMLCanvasElement ? source.domElement : null);
                
                if (!canvas || typeof canvas.toDataURL !== 'function') {
                    console.error("Source is not a valid HTMLCanvasElement", source);
                    return null;
                }
                
                dataUrl = canvas.toDataURL('image/png');
            }

            if (!dataUrl || !dataUrl.startsWith('data:image')) {
                console.error("Failed to generate valid data URL from snapshot source");
                return null;
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
            console.error(`Snapshot capture/upload failed for ${filename}:`, e);
            return null;
        }
    };

    const handleImageUpload = async (e) => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please login to upload photos.', severity: 'warning' });
            setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
            return;
        }
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const layoutSlots = LAYOUTS.find(l => l.value === layout)?.slots || 1;
        const remainingSlots = layoutSlots - userImages.length;
        const slotsToFill = files.slice(0, Math.max(0, remainingSlots));

        for (const file of slotsToFill) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await api.post('/products/upload-customization', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setUploadedFileUrls(prev => [...prev, res.data.url || res.data.image_url]);
            } catch (err) { console.error(err); }
        }
    };

    const addText = () => {
        const textId = `text-${Date.now()}`;
        const newText = {
            id: textId,
            text: 'New Caption',
            fontFamily: 'Poppins',
            fontSize: 32,
            color: '#000000',
            align: 'center',
            x: 200,
            y: 200,
            rot: 0
        };
        // Single history entry for both textLayers + layerOrder
        pushHistory(d => ({
            ...d,
            textLayers: [...d.textLayers, newText],
            layerOrder: [...d.layerOrder, textId]
        }));
        setSelectedId(textId);
    };

    const addSticker = (typeOrUrl, isUrl = false) => {
        const id = `sticker-${Date.now()}`;
        const newSticker = {
            id,
            type: isUrl ? 'image' : typeOrUrl,
            url: isUrl ? typeOrUrl : null,
            x: 180, y: 180,
            size: isUrl ? 110 : 60,
            rot: 0,
            opacity: 1,
            shadowEnabled: false,
            shadowBlur: 10,
            shadowOffsetX: 5,
            shadowOffsetY: 5,
            shadowOpacity: 0.3,
            shadowColor: '#000000'
        };
        // Single history entry for state consistency
        pushHistory(d => ({
            ...d,
            stickers: [...d.stickers, newSticker],
            layerOrder: [...d.layerOrder, id]
        }));
        setSelectedId(id);
    };

    const handleStickerUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.includes('png')) {
            setSnackbar({ open: true, message: 'Please upload transparent PNG stickers', severity: 'warning' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setSnackbar({ open: true, message: 'File too large (Max 5MB)', severity: 'warning' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            addSticker(ev.target.result, true);
        };
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        const schemaSizes = product?.customization_schema?.sizes || DEFAULT_FRAME_SIZES;
        const schemaStyles = product?.customization_schema?.styles || DEFAULT_FRAME_STYLES;
        const activeSizes = schemaSizes.filter(s => s.enabled !== false);
        const activeStyles = schemaStyles.filter(s => s.enabled !== false);
        const resetSnapshot = {
            ...INITIAL_DESIGN,
            frameSize: activeSizes[0]?.value || '',
            frameStyle: activeStyles[0]?.value || activeStyles[0]?.type || '',
            frameColor: '#111111',
            layerOrder: ['img-0'],
        };
        // Wipe history and start fresh from this reset point
        historyRef.current = [resetSnapshot];
        historyIdxRef.current = 0;
        setSelectedId(null);
        setWallPreview('none');
        forceRender();
        setSnackbar({ open: true, message: 'Design reset to default', severity: 'info' });
    };

    const handleAddToCart = async () => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please login first', severity: 'warning' });
            return;
        }

        setSelectedId(null); 
        setSnackbar({ open: true, message: '🎨 Processing your masterpiece...', severity: 'info' });

        const schemaSizes = (product?.customization_schema?.sizes || DEFAULT_FRAME_SIZES).filter(s => s.enabled !== false);
        const schemaStyles = (product?.customization_schema?.styles || DEFAULT_FRAME_STYLES).filter(s => s.enabled !== false);
        const resolvedSize = schemaSizes.find(s => s.value === frameSize) || schemaSizes[0] || {};
        const resolvedStyle = schemaStyles.find(s => s.value === frameStyle || s.type === frameStyle) || schemaStyles[0] || {};

        let flatDesignUrl = null;
        let modelSnapshotUrl = null;

        try {
            if (stageRef.current) {
                flatDesignUrl = await uploadContextCanvas(stageRef.current, 'frame_print.png', true);
            }
            const threeCanvas = document.getElementById('three-canvas');
            if (threeCanvas) {
                modelSnapshotUrl = await uploadContextCanvas(threeCanvas, 'frame_3d.png', false);
            }
        } catch (e) { console.warn('Canvas capture warning:', e); }

        try {
            const finalCustomization = {
                product: 'photo_frame',
                size: resolvedSize.label || frameSize,
                frame_color: frameColor,
                frame_style: resolvedStyle.label || frameStyle,
                layout: layout,
                images: uploadedFileUrls,
                flat_design_image: flatDesignUrl,
                model_3d_screenshot: modelSnapshotUrl,
                layers_config: { layerOrder, hiddenLayers: Array.from(hiddenLayers) },
                text_layers: textLayers,
                stickers: stickers,
                orientation: orientation,
                border_design: borderDesign
            };

            if (cartItemId) {
                await updateCartItem(parseInt(cartItemId), {
                    customization_details: finalCustomization,
                    preview_image_url: modelSnapshotUrl || flatDesignUrl
                });
                setSnackbar({ open: true, message: '✅ Cart item updated!', severity: 'success' });
            } else {
                await api.post('/cart/items/', {
                    product_id: parseInt(id),
                    quantity: quantity,
                    preview_image_url: modelSnapshotUrl || flatDesignUrl,
                    customization_details: finalCustomization
                });
                setSnackbar({ open: true, message: '✅ Added to cart! Redirecting...', severity: 'success' });
            }
            setTimeout(() => navigate('/cart'), 1500);
        } catch (error) {
            console.error('Failed to process cart request', error);
            setSnackbar({ open: true, message: 'Request failed. Please try again.', severity: 'error' });
        }
    };

    const alignElement = (type) => {
        if (!selectedId) return;
        const CANVAS_W = 1200; 
        const CANVAS_H = 800;

        if (selectedId.startsWith('img-')) {
            const idx = parseInt(selectedId.split('-')[1]);
            setImgProps(prev => {
                const newArr = [...prev];
                const current = newArr[idx] || { x: 0, y: 0, w: 400, h: 400, rot: 0 };
                let { x, y, w, h } = current;
                if (type === 'left') x = 40;
                if (type === 'right') x = CANVAS_W - w - 40;
                if (type === 'top') y = 40;
                if (type === 'bottom') y = CANVAS_H - h - 40;
                if (type === 'center-h') x = (CANVAS_W - w) / 2;
                if (type === 'center-v') y = (CANVAS_H - h) / 2;
                newArr[idx] = { ...current, x, y };
                return newArr;
            });
        } else if (selectedId.startsWith('text-')) {
            setTextLayers(prev => prev.map(t => {
                if (t.id !== selectedId) return t;
                let { x, y } = t;
                if (type === 'left') x = 100;
                if (type === 'right') x = CANVAS_W - 100;
                if (type === 'top') y = 100;
                if (type === 'bottom') y = CANVAS_H - 100;
                if (type === 'center-h') x = CANVAS_W / 2;
                if (type === 'center-v') y = CANVAS_H / 2;
                return { ...t, x, y };
            }));
        } else if (selectedId.startsWith('sticker-')) {
            setStickers(prev => prev.map(s => {
                if (s.id !== selectedId) return s;
                let { x, y, size } = s;
                if (type === 'left') x = 50 + size/2;
                if (type === 'right') x = CANVAS_W - 50 - size/2;
                if (type === 'top') y = 50 + size/2;
                if (type === 'bottom') y = CANVAS_H - 50 - size/2;
                if (type === 'center-h') x = CANVAS_W / 2;
                if (type === 'center-v') y = CANVAS_H / 2;
                return { ...s, x, y };
            }));
        }
    };

    const moveLayer = (targetIdOrDir, dirOnly) => {
        const targetId = dirOnly ? targetIdOrDir : (typeof targetIdOrDir === 'string' && !['up','down','front','back'].includes(targetIdOrDir) ? targetIdOrDir : selectedId);
        const direction = dirOnly || (['up','down','front','back'].includes(targetIdOrDir) ? targetIdOrDir : 'up');

        if (!targetId) return;
        setLayerOrder(prev => {
            const idx = prev.indexOf(targetId);
            if (idx === -1) return prev;
            const newOrder = [...prev];
            const item = newOrder.splice(idx, 1)[0];

            if (direction === 'front') newOrder.push(item);
            else if (direction === 'back') newOrder.unshift(item);
            else if (direction === 'up' && idx < prev.length - 1) newOrder.splice(idx + 1, 0, item);
            else if (direction === 'down' && idx > 0) newOrder.splice(idx - 1, 0, item);
            else newOrder.splice(idx, 0, item);

            return newOrder;
        });
    };

    const toggleVisibility = (id) => {
        setHiddenLayers(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const duplicateLayer = (id) => {
        if (id.startsWith('text-')) {
            const target = textLayers.find(t => t.id === id);
            if (target) {
                const newId = `text-${Date.now()}`;
                pushHistory(d => ({
                    ...d,
                    textLayers: [...d.textLayers, { ...target, id: newId, x: target.x + 20, y: target.y + 20 }],
                    layerOrder: [...d.layerOrder, newId]
                }));
            }
        } else if (id.startsWith('sticker-')) {
            const target = stickers.find(s => s.id === id);
            if (target) {
                const newId = `sticker-${Date.now()}`;
                pushHistory(d => ({
                    ...d,
                    stickers: [...d.stickers, { ...target, id: newId, x: target.x + 20, y: target.y + 20 }],
                    layerOrder: [...d.layerOrder, newId]
                }));
            }
        }
    };

    const deleteLayer = (id) => {
        pushHistory(d => ({
            ...d,
            textLayers: id.startsWith('text-') ? d.textLayers.filter(t => t.id !== id) : d.textLayers,
            stickers: id.startsWith('sticker-') ? d.stickers.filter(s => s.id !== id) : d.stickers,
            layerOrder: d.layerOrder.filter(lid => lid !== id)
        }));
        if (selectedId === id) setSelectedId(null);
    };


    // Memoize the merged image array to prevent heavy re-renders
    const combinedImages = useMemo(() => {
        return userImages.map((img, i) => enhancedImages[i] || img);
    }, [userImages, enhancedImages]);

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (!product) return <Container sx={{ py: 8 }}><Typography>Product not found.</Typography></Container>;
    
    const activeSizes = (product?.customization_schema?.sizes || DEFAULT_FRAME_SIZES).filter(s => s.enabled !== false);
    const activeStyles = (product?.customization_schema?.styles || DEFAULT_FRAME_STYLES).filter(s => s.enabled !== false);

    const selectedSizeObj = activeSizes.find(s => s.value === frameSize) || activeSizes[0] || { width: 12, height: 8 };
    const selectedStyleObj = activeStyles.find(s => s.value === frameStyle || s.type === frameStyle) || activeStyles[0] || { type: 'wooden' };

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    🖼️ Customize Your Arteza Frame
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Professional customizer with high-fidelity 2D and 3D previews.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* ─── LEFT: Preview Panel ─── */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Tabs value={previewTab} onChange={(_, v) => setPreviewTab(v)}>
                                <Tab icon={<EditIcon />} label="2D Design" iconPosition="start" />
                                <Tab icon={<ViewInArIcon />} label="3D Gallery" iconPosition="start" />
                            </Tabs>
                        </Box>

                        <Box className="preview3d glass" sx={{
                            position: 'relative',
                            width: '100%',
                            minHeight: '520px',
                            bgcolor: '#111',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            borderRadius: '12px'
                        }}>
                            {/* 2D Editor */}
                            <Box sx={{ display: previewTab === 0 ? 'flex' : 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 5 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>
                                        SIZE: {selectedSizeObj.label}
                                    </Typography>
                                </Box>
                                <FrameCanvasEditor
                                    userImages={combinedImages}
                                    textLayers={textLayers}
                                    setTextLayers={setTextLayers}
                                    layerOrder={layerOrder}
                                    hiddenLayers={hiddenLayers}
                                    layout={layout}
                                    frameSize={selectedSizeObj}
                                    onStageReady={(node) => stageRef.current = node}
                                    onTextureUpdate={setTextureCanvas}
                                    selectedId={selectedId}
                                    setSelectedId={setSelectedId}
                                    stickers={stickers}
                                    setStickers={setStickers}
                                    imgProps={imgProps}
                                    setImgProps={setImgProps}
                                    borderDesign={borderDesign}
                                    matThickness={matThickness}
                                    frameThickness={frameThickness}
                                    matColor={matColor}
                                    photoFilter={photoFilter}
                                    orientation={orientation}
                                    frameStyle={selectedStyleObj.type || selectedStyleObj.value}
                                    frameColor={frameColor}
                                    innerSpacing={innerSpacing}
                                    outerPadding={outerPadding}
                                    innerBorderColor={innerBorderColor}
                                />
                            </Box>

                            {/* 3D Preview */}
                            <Box sx={{ display: previewTab === 1 ? 'flex' : 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <Suspense fallback={<CircularProgress />}>
                                    <Frame3DPreview
                                        frameColor={frameColor}
                                        frameStyle={selectedStyleObj.type || selectedStyleObj.value}
                                        frameSize={selectedSizeObj}
                                        textureCanvas={textureCanvas}
                                        wallPreview={wallPreview}
                                        glassReflection={glassReflection}
                                        tiltAngle={tiltAngle}
                                        orientation={orientation}
                                        frameThickness={frameThickness}
                                        autoRotate={autoRotate}
                                    />
                                </Suspense>
                            </Box>

                            <Box sx={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, display: 'flex', gap: 1 }}>
                                <Tooltip title="Undo (Ctrl+Z)">
                                    <span>
                                    <IconButton
                                        onClick={undo}
                                        disabled={historyIdxRef.current <= 0}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, '&.Mui-disabled': { color: 'rgba(255,255,255,0.25)' } }}
                                    >
                                        <span style={{ fontSize: 20, lineHeight: 1 }}>↩</span>
                                    </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Redo (Ctrl+Y)">
                                    <span>
                                    <IconButton
                                        onClick={redo}
                                        disabled={historyIdxRef.current >= historyRef.current.length - 1}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, '&.Mui-disabled': { color: 'rgba(255,255,255,0.25)' } }}
                                    >
                                        <span style={{ fontSize: 20, lineHeight: 1 }}>↪</span>
                                    </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Reset Design">
                                    <IconButton onClick={handleReset} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                                        <RestartAltIcon />
                                    </IconButton>
                                </Tooltip>
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
                        <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                {previewTab === 0 ? '💡 Drag to move elements, scroll to zoom.' : '💡 Drag to rotate, scroll to zoom.'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6 }}>
                                Ctrl+Z Undo &nbsp;·&nbsp; Ctrl+Y Redo
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* ─── RIGHT: Controls Panel ─── */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ position: 'sticky', top: 80 }}>
                        <Paper elevation={0} className="glass" sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography variant="h5" fontWeight="bold">{product.name}</Typography>
                            <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mt: 1, background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{totalPrice.toFixed(0)}</Typography>
                        </Paper>

                        <Paper elevation={0} className="glass" sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Tabs value={controlTab} onChange={(_, v) => setControlTab(v)} variant="fullWidth">
                                <Tab label="Frame" />
                                <Tab label="Photo" />
                            </Tabs>

                            {controlTab === 0 && (
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Layout & Orientation</Typography>
                                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                            {LAYOUTS.map(l => (
                                                <Chip key={l.value} label={l.label} onClick={() => setLayout(l.value)}
                                                    color={layout === l.value ? "primary" : "default"} variant={layout === l.value ? "filled" : "outlined"} size="small"
                                                />
                                            ))}
                                        </Stack>
                                        <Stack direction="row" spacing={1}>
                                            <Chip label="Landscape" onClick={() => setOrientation('landscape')} color={orientation === 'landscape' ? "primary" : "default"} variant={orientation === 'landscape' ? "filled" : "outlined"} size="small" />
                                            <Chip label="Portrait" onClick={() => setOrientation('portrait')} color={orientation === 'portrait' ? "primary" : "default"} variant={orientation === 'portrait' ? "filled" : "outlined"} size="small" />
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Size & Style</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Size</InputLabel>
                                                    <Select value={frameSize} label="Size" onChange={(e) => setFrameSize(e.target.value)}>
                                                        {activeSizes.map((s) => {
                                                            const firstPrice = activeSizes[0]?.price || 0;
                                                            const diff = s.price - firstPrice;
                                                            return (
                                                                <MenuItem key={s.value} value={s.value}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                        <Typography variant="body2">{s.label}</Typography>
                                                                        <Box sx={{ textAlign: 'right' }}>
                                                                            <Typography variant="body2" fontWeight={700}>₹{s.price}</Typography>
                                                                            {diff > 0 && <Typography variant="caption" color="primary">+{diff}</Typography>}
                                                                        </Box>
                                                                    </Box>
                                                                </MenuItem>
                                                            );
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Style</InputLabel>
                                                    <Select value={frameStyle} label="Style" onChange={(e) => setFrameStyle(e.target.value)}>
                                                        {activeStyles.map(s => <MenuItem key={s.value} value={s.type || s.value}>{s.label}</MenuItem>)}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Customization</Typography>
                                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                            <InputLabel>Border Design</InputLabel>
                                            <Select value={borderDesign} label="Border Design" onChange={(e) => setBorderDesign(e.target.value)}>
                                                <MenuItem value="minimal">Minimal</MenuItem>
                                                <MenuItem value="vintage">Vintage Gold</MenuItem>
                                                <MenuItem value="floral">Floral Texture</MenuItem>
                                                <MenuItem value="modern geometric">Modern Geometric</MenuItem>
                                            </Select>
                                        </FormControl>

                                        {/* Frame / Outer Border Color */}
                                        <Typography variant="caption" sx={{ mt: 1, mb: 0.5, display: 'block', fontWeight: 600 }}>
                                            Frame Border Color
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                            <input type="color" value={frameColor}
                                                onChange={(e) => setFrameColor(e.target.value)}
                                                style={{ width: 34, height: 34, padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px', flexShrink: 0 }} />
                                            {[
                                                { color: '#111111', label: 'Ebony' },
                                                { color: '#ffffff', label: 'Bright White' },
                                                { color: '#4a2c1a', label: 'Dark Wood' },
                                                { color: '#8b5a2b', label: 'Oak' },
                                                { color: '#d4af37', label: 'Gold' },
                                                { color: '#c0c0c0', label: 'Silver' },
                                            ].map(({ color, label }) => (
                                                <Tooltip key={color} title={label}>
                                                    <Box
                                                        onClick={() => setFrameColor(color)}
                                                        sx={{
                                                            width: 26, height: 26,
                                                            borderRadius: '50%',
                                                            bgcolor: color,
                                                            border: frameColor === color
                                                                ? '2px solid #667eea'
                                                                : '1.5px solid rgba(255,255,255,0.25)',
                                                            cursor: 'pointer',
                                                            boxShadow: frameColor === color ? '0 0 0 2px rgba(102,126,234,0.4)' : 'none',
                                                            transition: 'all 0.15s',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                </Tooltip>
                                            ))}
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">Frame Thickness</Typography>
                                        <Slider value={frameThickness} min={0.5} max={3} step={0.1} onChange={(_, v) => setFrameThickness(v)} valueLabelDisplay="auto" size="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                            Spacing &amp; Borders
                                        </Typography>

                                        {/* Collage inner spacing */}
                                        <Typography variant="caption" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                            <span>Collage Inner Border Size</span>
                                            <span style={{ color: '#667eea', fontWeight: 700 }}>{innerSpacing}px</span>
                                        </Typography>
                                        <Slider value={innerSpacing} min={0} max={40} step={1}
                                            onChange={(_, v) => setInnerSpacing(v)} size="small"
                                            sx={{ color: '#667eea' }} />

                                        {/* Frame inner padding */}
                                        <Typography variant="caption" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                                            <span>Frame Inner Padding</span>
                                            <span style={{ color: '#667eea', fontWeight: 700 }}>{outerPadding}px</span>
                                        </Typography>
                                        <Slider value={outerPadding} min={0} max={80} step={2}
                                            onChange={(_, v) => setOuterPadding(v)} size="small"
                                            sx={{ color: '#667eea' }} />

                                        {/* Collage inner border colour */}
                                        <Typography variant="caption" sx={{ mt: 2, mb: 0.5, display: 'block', fontWeight: 600 }}>
                                            Collage Inner Border Color
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                            <input type="color" value={innerBorderColor}
                                                onChange={(e) => setInnerBorderColor(e.target.value)}
                                                style={{ width: 34, height: 34, padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px', flexShrink: 0 }} />
                                            {[
                                                { color: '#ffffff', label: 'White' },
                                                { color: '#000000', label: 'Black' },
                                                { color: '#fdf8f0', label: 'Cream' },
                                                { color: '#d8d8d8', label: 'Lt. Gray' },
                                                { color: '#8b5a2b', label: 'Wood' },
                                                { color: '#1a1a2e', label: 'Navy' },
                                            ].map(({ color, label }) => (
                                                <Tooltip key={color} title={label}>
                                                    <Box
                                                        onClick={() => setInnerBorderColor(color)}
                                                        sx={{
                                                            width: 26, height: 26,
                                                            borderRadius: '50%',
                                                            bgcolor: color,
                                                            border: innerBorderColor === color
                                                                ? '2px solid #667eea'
                                                                : '1.5px solid rgba(255,255,255,0.25)',
                                                            cursor: 'pointer',
                                                            boxShadow: innerBorderColor === color ? '0 0 0 2px rgba(102,126,234,0.4)' : 'none',
                                                            transition: 'all 0.15s',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                </Tooltip>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Stack>
                            )}

                            {controlTab === 1 && (
                                <Stack spacing={3}>
                                    <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />} sx={{ py: 1.5, border: '2px dashed' }}>
                                        Upload Photos ({userImages.length}) <input type="file" hidden multiple onChange={handleImageUpload} />
                                    </Button>

                                    {/* AI Enhancer Targeting Check */}
                                    {((selectedId?.startsWith('img-') && userImages.length > 0) || (selectedId?.startsWith('sticker-') && stickers.find(s=>s.id===selectedId)?.url) || (!selectedId && userImages.length > 0)) && (
                                        <ImageEnhancerPanel
                                            key={`enhancer-${selectedId || userImages.length}`}
                                            originalImageSrc={
                                                selectedId && selectedId.startsWith('img-') 
                                                    ? userImages[parseInt(selectedId.split('-')[1] || '0', 10)] 
                                                    : selectedId && selectedId.startsWith('sticker-')
                                                        ? (stickers.find(s => s.id === selectedId)?.url || null)
                                                        : (userImages[userImages.length - 1] || null)
                                            } 
                                            onEnhancedImage={(src) => {
                                                if (selectedId?.startsWith('img-')) {
                                                    const targetIdx = parseInt(selectedId.split('-')[1] || '0', 10);
                                                    setEnhancedImages(prev => {
                                                        const newArr = [...prev];
                                                        newArr[targetIdx] = src;
                                                        return newArr;
                                                    });
                                                } else if (selectedId?.startsWith('sticker-')) {
                                                    setStickers(prev => prev.map(s => s.id === selectedId ? { ...s, url: src } : s));
                                                } else {
                                                    const lastIdx = userImages.length - 1;
                                                    setEnhancedImages(prev => {
                                                        const newArr = [...prev];
                                                        newArr[lastIdx] = src;
                                                        return newArr;
                                                    });
                                                }
                                            }}
                                        />
                                    )}

                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Photo Options</Typography>
                                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                                            {['none', 'bw', 'vintage', 'warm', 'cool'].map(f => (
                                                <Chip key={f} label={f.toUpperCase()} onClick={() => setPhotoFilter(f)} color={photoFilter === f ? "secondary" : "default"} size="small" clickable />
                                            ))}
                                        </Stack>
                                    </Box>

                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <span><EditIcon fontSize="inherit" sx={{ mr: 1 }} /> CAPTION EDITING</span>
                                            <Button size="small" variant="text" startIcon={<AddCircleIcon />} sx={{ fontSize: '10px', color: '#667eea' }} onClick={addText}>Add Text</Button>
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                                            <Stack direction="row" spacing={2}>
                                                <Stack spacing={1.5} sx={{ flex: 1.2 }}>
                                                    {selectedId?.startsWith('text-') ? (
                                                        <>
                                                            <TextField
                                                                fullWidth
                                                                placeholder="Type caption here..."
                                                                multiline
                                                                rows={2}
                                                                value={textLayers.find(t => t.id === selectedId)?.text || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setTextLayers(prev => prev.map(t => t.id === selectedId ? { ...t, text: val } : t));
                                                                }}
                                                                sx={{ 
                                                                    '& .MuiInputBase-root': { 
                                                                        fontSize: '12px', 
                                                                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                                                                        color: '#f8faff',
                                                                        backdropFilter: 'blur(10px)',
                                                                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1) !important' }
                                                                    },
                                                                    '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.4)', fontSize: '11px' }
                                                                }}
                                                            />
                                                            <FormControl fullWidth size="small">
                                                                <Select
                                                                    value={textLayers.find(t => t.id === selectedId)?.fontFamily || 'Poppins'}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setTextLayers(prev => prev.map(t => t.id === selectedId ? { ...t, fontFamily: val } : t));
                                                                    }}
                                                                    sx={{ 
                                                                        fontSize: '11px', 
                                                                        height: 32, 
                                                                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                                                                        color: '#f8faff',
                                                                        backdropFilter: 'blur(10px)',
                                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                                                                        '& .MuiSvgIcon-root': { color: '#f8faff' }
                                                                    }}
                                                                >
                                                                    {FONTS.map(f => (
                                                                        <MenuItem key={f} value={f} sx={{ fontFamily: f, fontSize: '14px' }}>
                                                                            {f}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>

                                                            <Box sx={{ px: 1 }}>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <TextFieldsIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }} />
                                                                    <Slider
                                                                        size="small"
                                                                        value={textLayers.find(t => t.id === selectedId)?.fontSize || 32}
                                                                        min={12}
                                                                        max={100}
                                                                        onChange={(_, v) => setTextLayers(prev => prev.map(t => t.id === selectedId ? { ...t, fontSize: v } : t))}
                                                                        sx={{ color: '#667eea', py: 0.5 }}
                                                                    />
                                                                    <Typography variant="caption" sx={{ fontSize: '9px', minWidth: 20, color: 'rgba(255,255,255,0.7)' }}>{textLayers.find(t => t.id === selectedId)?.fontSize || 32}</Typography>
                                                                </Stack>
                                                            </Box>
                                                            <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 1, p: 0.5 }}>
                                                                {['left', 'center', 'right'].map(al => (
                                                                    <IconButton key={al} size="small" onClick={() => setTextLayers(prev => prev.map(t => t.id === selectedId ? { ...t, align: al } : t))} color={textLayers.find(t => t.id === selectedId)?.align === al ? "primary" : "default" }>
                                                                        {al === 'left' && <FormatAlignLeftIcon fontSize="inherit" />}
                                                                        {al === 'center' && <FormatAlignCenterIcon fontSize="inherit" />}
                                                                        {al === 'right' && <FormatAlignRightIcon fontSize="inherit" />}
                                                                    </IconButton>
                                                                ))}
                                                            </Stack>

                                                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                                                {['#000000', '#4CAF50', '#FFD700', '#E91E63', '#2196F3', '#F44336'].map(c => (
                                                                    <Box 
                                                                        key={c} 
                                                                        onClick={() => setTextLayers(prev => prev.map(t => t.id === selectedId ? { ...t, color: c } : t))}
                                                                        sx={{ 
                                                                            width: 16, height: 16, borderRadius: '50%', bgcolor: c, border: `1px solid ${textLayers.find(t => t.id === selectedId)?.color === c ? '#667eea' : 'rgba(0,0,0,0.1)'}`, cursor: 'pointer',
                                                                            transform: textLayers.find(t => t.id === selectedId)?.color === c ? 'scale(1.2)' : 'scale(1)', transition: '0.2s'
                                                                        }} 
                                                                    />
                                                                ))}
                                                            </Stack>
                                                        </>
                                                    ) : (
                                                        <Box sx={{ textAlign: 'center', py: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                                                            <Typography variant="caption" color="text.secondary">Select a text layer to edit.</Typography>
                                                            <Button size="small" variant="outlined" startIcon={<AddCircleIcon />} onClick={addText}>New Caption</Button>
                                                        </Box>
                                                    )}
                                                </Stack>

                                            {/* Right: Stickers & Preview Zone (Canva Style) */}
                                            <Stack spacing={1} sx={{ 
                                                flex: 1, 
                                                bgcolor: 'rgba(255, 255, 255, 0.05)', 
                                                backdropFilter: 'blur(8px)',
                                                borderRadius: 1.5, 
                                                p: 1.5, 
                                                border: '1px solid rgba(255,255,255,0.1)', 
                                            }}>
                                                <Typography variant="caption" sx={{ fontSize: '10px', color: '#667eea', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sticker Packs</Typography>
                                                
                                                <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 0.5 }}>
                                                    {STICKER_PACKS.map(pack => (
                                                        <Box key={pack.name} sx={{ mb: 2 }}>
                                                            <Typography variant="caption" sx={{ fontSize: '9px', opacity: 0.7, mb: 0.5, block: 'block' }}>{pack.name}</Typography>
                                                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                                {pack.pack.map(s => (
                                                                    <Box 
                                                                        key={s.url} 
                                                                        component="img" src={s.url} 
                                                                        onClick={() => addSticker(s.url, true)}
                                                                        sx={{ width: 32, height: 32, p: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)', cursor: 'pointer', '&:hover': { transform: 'scale(1.1)', bgcolor: 'rgba(102,126,234,0.15)' }, transition: '0.2s' }}
                                                                    />
                                                                ))}
                                                            </Stack>
                                                        </Box>
                                                    ))}
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography variant="caption" sx={{ fontSize: '9px', opacity: 0.7, mb: 0.5, display: 'block' }}>Emojis</Typography>
                                                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                                            {Object.keys(STICKER_ICONS).map(type => (
                                                                <IconButton key={type} onClick={() => addSticker(type)} size="small" sx={{ p: 0.5, fontSize: 16 }}>
                                                                    {STICKER_ICONS[type]}
                                                                </IconButton>
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                </Box>

                                                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />

                                                <Button 
                                                    variant="outlined" component="label" fullWidth size="small" 
                                                    startIcon={<FileUploadIcon fontSize="inherit" />}
                                                    sx={{ fontSize: '9px', py: 0.5, borderRadius: 1, borderStyle: 'dashed' }}
                                                >
                                                    PNG Upload
                                                    <input type="file" hidden accept="image/png" onChange={handleStickerUpload} />
                                                </Button>

                                                {selectedId?.startsWith('sticker-') && (
                                                    <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(102,126,234,0.08)', borderRadius: 1, border: '1px solid rgba(102,126,234,0.2)' }}>
                                                        <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 'bold', mb: 1, display: 'block' }}>Sticker Properties</Typography>
                                                        <Stack spacing={1}>
                                                            <Box>
                                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                    <Typography variant="caption" sx={{ fontSize: '8px' }}>Opacity</Typography>
                                                                    <Typography variant="caption" sx={{ fontSize: '8px' }}>{Math.round((stickers.find(s=>s.id===selectedId)?.opacity || 1)*100)}%</Typography>
                                                                </Stack>
                                                                <Slider size="small" value={(stickers.find(s=>s.id===selectedId)?.opacity || 1)*100} onChange={(_, v) => setStickers(prev => prev.map(s => s.id === selectedId ? { ...s, opacity: v/100 } : s))} />
                                                            </Box>
                                                            <FormControlLabel 
                                                                control={<Checkbox size="small" checked={stickers.find(s=>s.id===selectedId)?.shadowEnabled || false} onChange={(e) => setStickers(prev => prev.map(s => s.id === selectedId ? { ...s, shadowEnabled: e.target.checked } : s))} />}
                                                                label={<Typography variant="caption" sx={{ fontSize: '8px' }}>Drop Shadow</Typography>}
                                                            />
                                                            {stickers.find(s=>s.id===selectedId)?.shadowEnabled && (
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="caption" sx={{ fontSize: '8px', opacity: 0.6 }}>Shadow Softness</Typography>
                                                                    <Slider size="small" min={0} max={40} value={stickers.find(s=>s.id===selectedId)?.shadowBlur || 10} onChange={(_, v) => setStickers(prev => prev.map(s => s.id === selectedId ? { ...s, shadowBlur: v } : s))} sx={{ py: 0.2 }} />
                                                                    
                                                                    <Typography variant="caption" sx={{ fontSize: '8px', opacity: 0.6 }}>Shadow Distance</Typography>
                                                                    <Slider size="small" min={0} max={30} value={stickers.find(s=>s.id===selectedId)?.shadowOffsetX || 5} onChange={(_, v) => setStickers(prev => prev.map(s => s.id === selectedId ? { ...s, shadowOffsetX: v, shadowOffsetY: v } : s))} sx={{ py: 0.2 }} />
                                                                    
                                                                    <Typography variant="caption" sx={{ fontSize: '8px', opacity: 0.6 }}>Shadow Strength</Typography>
                                                                    <Slider size="small" min={0} max={100} value={(stickers.find(s=>s.id===selectedId)?.shadowOpacity || 0.3) * 100} onChange={(_, v) => setStickers(prev => prev.map(s => s.id === selectedId ? { ...s, shadowOpacity: v/100 } : s))} sx={{ py: 0.2 }} />
                                                                </Stack>
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Paper>

                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LayersIcon fontSize="small" /> Composition & Layers
                                        </Typography>
                                        <Paper variant="outlined" sx={{ mt: 1, maxHeight: 300, overflowY: 'auto', bgcolor: 'rgba(0,0,0,0.02)', border: 'none' }}>
                                            <Reorder.Group axis="y" values={[...layerOrder].reverse()} onReorder={(val) => setLayerOrder([...val].reverse())} style={{ padding: 0 }}>
                                                <AnimatePresence>
                                                {[...layerOrder].reverse().map((id) => {
                                                    const isImg = id.startsWith('img-');
                                                    const isStk = id.startsWith('sticker-');
                                                    const isTxt = id.startsWith('text-');
                                                    
                                                    let name = "Unknown Layer";
                                                    if (isImg) name = `Photo ${parseInt(id.split('-')[1] || '0') + 1}`;
                                                    if (isStk) {
                                                        const s = stickers.find(st => st.id === id);
                                                        name = s?.url ? `Sticker: ${s.type || 'Custom'}` : `Icon: ${s?.type || 'Sticker'}`;
                                                    }
                                                    if (isTxt) name = `Text: ${(textLayers.find(t => t.id === id)?.text || 'Caption').substring(0, 15)}...`;

                                                    return (
                                                        <Reorder.Item key={id} value={id}>
                                                            <Box key={id} 
                                                                 sx={{ 
                                                                     p: 1.2, mb: 0.5, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                                                     bgcolor: selectedId === id ? 'rgba(102,126,234,0.12)' : 'rgba(255,255,255,0.03)', 
                                                                     backdropFilter: 'blur(8px)',
                                                                     border: selectedId === id ? '1px solid rgba(102,126,234,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                                                     cursor: 'grab', '&:active': { cursor: 'grabbing' },
                                                                     transition: 'all 0.2s',
                                                                     opacity: hiddenLayers.has(id) ? 0.4 : 1
                                                                 }}
                                                                 onClick={() => setSelectedId(id)}
                                                            >
                                                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                                                                    {isImg ? (
                                                                        <Box sx={{ position: 'relative' }}>
                                                                            <Box
                                                                                component="img"
                                                                                src={enhancedImages[parseInt(id.split('-')[1] || '0')] || userImages[parseInt(id.split('-')[1] || '0')]}
                                                                                sx={{ width: 24, height: 24, borderRadius: 1, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                                                                            />
                                                                            {enhancedImages[parseInt(id.split('-')[1] || '0')] && userImages[parseInt(id.split('-')[1] || '0')] !== enhancedImages[parseInt(id.split('-')[1] || '0')] && (
                                                                                <AutoFixHighIcon sx={{ position: 'absolute', top: -6, right: -6, fontSize: 14, color: '#ff9800', bgcolor: 'rgba(0,0,0,0.7)', borderRadius: '50%', p: 0.2 }} />
                                                                            )}
                                                                        </Box>
                                                                    ) : isTxt ? (
                                                                        <TextFieldsIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }} />
                                                                    ) : (
                                                                        <LayersIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }} />
                                                                    )}
                                                                    <Typography variant="caption" noWrap sx={{ fontWeight: selectedId === id ? 600 : 400, color: '#fff', fontSize: '11.5px' }}>{name}</Typography>
                                                                </Stack>
                                                                <Stack direction="row" spacing={0.5}>
                                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleVisibility(id); }} sx={{ color: hiddenLayers.has(id) ? 'rgba(255,255,255,0.4)' : '#667eea', p: 0.5 }}>
                                                                        {hiddenLayers.has(id) ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                                                                    </IconButton>
                                                                <Tooltip title="Move Up"><IconButton size="small" onClick={(e) => { e.stopPropagation(); moveLayer(id, 'up'); }} disabled={layerOrder.indexOf(id) === layerOrder.length - 1} sx={{ color: 'white' }}><KeyboardArrowUpIcon fontSize="inherit" /></IconButton></Tooltip>
                                                                <Tooltip title="Move Down"><IconButton size="small" onClick={(e) => { e.stopPropagation(); moveLayer(id, 'down'); }} disabled={layerOrder.indexOf(id) === 0} sx={{ color: 'white' }}><KeyboardArrowDownIcon fontSize="inherit" /></IconButton></Tooltip>
                                                                <Tooltip title="Delete"><IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteLayer(id); }} sx={{ color: '#ff4d4d' }}><DeleteIcon fontSize="inherit" /></IconButton></Tooltip>
                                                            </Stack>
                                                        </Box>
                                                    </Reorder.Item>
                                                );
                                                })}
                                                </AnimatePresence>
                                            </Reorder.Group>
                                        </Paper>
                                    </Box>

                                    {selectedId && (
                                        <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Alignment & Layering</Typography>
                                            
                                            <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: 'center' }}>
                                                <Tooltip title="Align Left"><IconButton size="small" onClick={() => alignElement('left')}><AlignHorizontalLeftIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Align Center"><IconButton size="small" onClick={() => alignElement('center-h')}><AlignHorizontalCenterIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Align Right"><IconButton size="small" onClick={() => alignElement('right')}><AlignHorizontalRightIcon fontSize="small" /></IconButton></Tooltip>
                                                <Divider orientation="vertical" flexItem />
                                                <Tooltip title="Align Top"><IconButton size="small" onClick={() => alignElement('top')}><AlignVerticalTopIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Align Middle"><IconButton size="small" onClick={() => alignElement('center-v')}><AlignVerticalCenterIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Align Bottom"><IconButton size="small" onClick={() => alignElement('bottom')}><AlignVerticalBottomIcon fontSize="small" /></IconButton></Tooltip>
                                            </Stack>

                                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                                <Button size="small" variant="outlined" fullWidth startIcon={<FlipToFrontIcon />} sx={{ fontSize: '10px' }} onClick={() => moveLayer('front')}>Front</Button>
                                                <Button size="small" variant="outlined" fullWidth startIcon={<FlipToBackIcon />} sx={{ fontSize: '10px' }} onClick={() => moveLayer('back')}>Back</Button>
                                            </Stack>

                                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                {selectedId && !selectedId.startsWith('img-') && (
                                                    <Button size="small" variant="contained" color="primary" fullWidth startIcon={<ContentCopyIcon />} sx={{ fontSize: '10px' }} onClick={() => duplicateLayer(selectedId)}>Duplicate</Button>
                                                )}
                                                {selectedId && !selectedId.startsWith('img-') && (
                                                    <Button size="small" variant="contained" color="error" fullWidth startIcon={<DeleteIcon />} sx={{ fontSize: '10px' }} onClick={() => deleteLayer(selectedId)}>Delete</Button>
                                                )}
                                            </Stack>

                                            {selectedId?.startsWith('img-') && (
                                                <>
                                                    <Button 
                                                        size="small" 
                                                        variant="contained" 
                                                        fullWidth 
                                                        startIcon={<CenterFocusStrongIcon />}
                                                        onClick={() => {
                                                            const idx = parseInt(selectedId.split('-')[1] || '0');
                                                            setImgProps(prev => {
                                                                const newArr = [...prev];
                                                                newArr[idx] = undefined; 
                                                                return newArr;
                                                            });
                                                        }}
                                                        sx={{ mb: 2 }}
                                                    >
                                                        Auto-Fit Image
                                                    </Button>

                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <ZoomInIcon fontSize="inherit" /> Zoom / Scale
                                                    </Typography>
                                                    <Slider 
                                                        size="small"
                                                        value={imgProps[parseInt(selectedId.split('-')[1] || '0')]?.w || 400} 
                                                        min={50} 
                                                        max={2000} 
                                                        onChange={(_, v) => {
                                                            const idx = parseInt(selectedId.split('-')[1] || '0');
                                                            setImgProps(prev => {
                                                                const newArr = [...prev];
                                                                const current = newArr[idx] || { x: 100, y: 100, rot: 0 };
                                                                const ratio = (newArr[idx]?.h / newArr[idx]?.w) || 1;
                                                                newArr[idx] = { ...current, w: v, h: v * ratio };
                                                                return newArr;
                                                            });
                                                        }}
                                                    />

                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                        <RotateRightIcon fontSize="inherit" /> Rotation
                                                    </Typography>
                                                    <Slider 
                                                        size="small"
                                                        value={imgProps[parseInt(selectedId.split('-')[1] || '0')]?.rot || 0} 
                                                        min={-180} 
                                                        max={180} 
                                                        onChange={(_, v) => {
                                                            const idx = parseInt(selectedId.split('-')[1] || '0');
                                                            setImgProps(prev => {
                                                                const newArr = [...prev];
                                                                const current = newArr[idx] || { x: 100, y: 100, w: 400, h: 400 };
                                                                newArr[idx] = { ...current, rot: v };
                                                                return newArr;
                                                            });
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </Box>
                                    )}

                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">Quantity</Typography>
                                        <Slider value={quantity} min={1} max={10} step={1} marks valueLabelDisplay="auto" onChange={(_, v) => setQuantity(v)} />
                                    </Box>
                                </Stack>
                            )}

                            <Divider />
                            <InstagramSupportButton />
                            <Button
                                variant="contained"
                                startIcon={<ShoppingCartIcon />}
                                onClick={handleAddToCart}
                                fullWidth
                                sx={{
                                    py: 2,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                                }}
                            >
                                Checkout — ₹{totalPrice.toFixed(0)}
                            </Button>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default FrameCustomizerPage;
