import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, Button, CircularProgress,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Paper, Radio, FormControlLabel, Snackbar, Alert, Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api, { getPublicUrl } from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { sanitizeUrl } from '../api/security';
import { useCart } from '../store/CartContext';
import InstagramSupportButton from '../components/Shared/InstagramSupportButton';
import CanvasPreview from '../components/Customization/LiveVisualizer/CanvasPreview';

const ProductCustomizerPage = () => {
    const { id, cartItemId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { updateCartItem } = useCart();
    const [textureCanvas, setTextureCanvas] = useState(null);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [customizationData, setCustomizationData] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);
    const [itemQuantity, setItemQuantity] = useState(1);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [previewTab, setPreviewTab] = useState(0);

    // UI state
    const [userImageSrc, setUserImageSrc] = useState(null);
    const [textProps, setTextProps] = useState({
        text: '',
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#000000'
    });

    useEffect(() => {
        const fetchProductAndCartItem = async () => {
            try {
                // Fetch Product
                const response = await api.get(`/products/${id}`);
                const data = response.data;
                setProduct(data);

                // Initialize defaults
                if (data.customization_schema) {
                    const schema = data.customization_schema;
                    setCustomizationData({
                        color: schema.colors ? schema.colors[0] : null,
                        type: schema.types ? schema.types[0] : null,
                        size: schema.sizes ? schema.sizes[0] : null,
                        layout: schema.layouts ? schema.layouts[0] : null,
                        style: schema.styles ? schema.styles[0] : null,
                        extras: []
                    });
                    setTotalPrice(data.price);
                }

                // If editing existing cart item, load its data
                if (cartItemId) {
                    try {
                        const cartRes = await api.get('/cart/');
                        const item = cartRes.data.items.find(i => i.id === parseInt(cartItemId));
                        if (item && item.customization_details) {
                            const details = item.customization_details;
                            setCustomizationData(details);
                            if (details.text) {
                                setTextProps({
                                    text: details.text || '',
                                    fontFamily: details.font || 'Arial',
                                    fontSize: details.text_size || 24,
                                    color: details.text_color || '#000000'
                                });
                            }
                            if (details.image) setUserImageSrc(details.image.startsWith('data:') ? details.image : getPublicUrl(details.image));
                            if (item.quantity) setItemQuantity(item.quantity);
                        }
                    } catch (e) {
                        console.error("Failed to fetch cart item for re-edit", e);
                    }
                }
            } catch (error) {
                console.error("Error fetching product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductAndCartItem();
    }, [id, cartItemId]);

    // Dynamic price calculation
    useEffect(() => {
        if (!product) return;
        let base = product.price;
        if (customizationData.type === 'Magic Mug') base += 5;
        if (customizationData.size === '12x18-A3') base += 10;
        if (customizationData.size === '16.5x23.4-A2') base += 20;
        setTotalPrice(base * itemQuantity);
    }, [customizationData, product, itemQuantity]);

    const uploadContextCanvas = async (source, filename, isStage = false) => {
        if (!source) return null;
        try {
            let canvas = null;
            let dataUrl = null;

            if (isStage) {
                // Konva Stage (2D)
                if (typeof source.toDataURL !== 'function') return null;
                dataUrl = source.toDataURL({ pixelRatio: 3, mimeType: 'image/png' });
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
            const u8 = new Uint8Array(n);
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

    const handleImageUpload = async (e) => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please login to upload photos.', severity: 'warning' });
            setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
            return;
        }
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setUserImageSrc(reader.result);
        reader.readAsDataURL(file);
        const formData = new FormData();
        formData.append('file', file);
        setIsUploading(true);
        try {
            const uploadRes = await api.post('/products/upload-customization', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCustomizationData(prev => ({ ...prev, uploadedImageUrl: uploadRes.data.url || uploadRes.data.image_url }));
        } catch (err) { 
            console.error("Upload failed", err);
            setSnackbar({ open: true, message: 'Upload failed. Please try again.', severity: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please login to add items to cart.', severity: 'warning' });
            setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1000);
            return;
        }

        setSnackbar({ open: true, message: '🎨 Adding masterpiece to cart...', severity: 'info' });
        let flatDesignUrl = customizationData.flat_design_image || null;
        
        try {
            if (textureCanvas && !flatDesignUrl) {
                flatDesignUrl = await uploadContextCanvas(textureCanvas, 'design.png');
            }

            const productSchema = product.customization_schema || {};
            const finalCustomization = {
                product: productSchema.type || product.customization_type || 'Custom-Product',
                ...customizationData,
                text: textProps.text,
                font: textProps.fontFamily,
                text_color: textProps.color,
                text_size: textProps.fontSize,
                image: customizationData.uploadedImageUrl || customizationData.image || null,
                flat_design_image: flatDesignUrl,
                model: 'Standard-Product',
                placement: 'center'
            };

            if (cartItemId) {
                await updateCartItem(parseInt(cartItemId), { 
                    customization_details: finalCustomization,
                    quantity: itemQuantity,
                    preview_image_url: flatDesignUrl || product.image_url
                });
                setSnackbar({ open: true, message: '✅ Cart item updated!', severity: 'success' });
            } else {
                await api.post('/cart/items/', {
                    product_id: parseInt(id),
                    quantity: itemQuantity,
                    preview_image_url: flatDesignUrl || product.image_url,
                    customization_details: finalCustomization
                });
                setSnackbar({ open: true, message: '✅ Added to cart!', severity: 'success' });
            }
            setTimeout(() => navigate('/cart'), 1200);
        } catch (error) {
            console.error("Failed to add/update cart", error);
            setSnackbar({ open: true, message: '❌ Failed to process request.', severity: 'error' });
        }
    };

    const toggleExtra = (item) => {
        let newExtras = [...(customizationData.extras || [])];
        if (newExtras.includes(item)) {
            newExtras = newExtras.filter(i => i !== item);
        } else {
            newExtras.push(item);
        }
        setCustomizationData({ ...customizationData, extras: newExtras });
    };

    if (loading) return (
        <Container sx={{ py: 6, textAlign: 'center', px: 3 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading your customizer…</Typography>
        </Container>
    );

    if (!product) return (
        <Container sx={{ py: 10, textAlign: 'center', px: 3 }}>
            <Typography fontSize={56} mb={1}>😕</Typography>
            <Typography variant="h2" sx={{ mb: 1 }}>Oops! Product not available</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>We couldn&apos;t find this product.</Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="contained" onClick={() => navigate('/shop')} sx={{ borderRadius: '12px', height: '48px' }}>Back to Shop</Button>
                <Button variant="outlined" onClick={() => window.location.reload()} sx={{ borderRadius: '12px', height: '48px', borderColor: 'rgba(255,255,255,0.2)' }}>Retry</Button>
            </Stack>
        </Container>
    );

    const schema = product.customization_schema || {};

    return (
        <Box sx={{ 
            bgcolor: 'rgba(0, 0, 0, 0.5)', 
            backdropFilter: 'blur(20px)', 
            minHeight: '100vh',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)'
        }}>
            {/* Mobile Title Bar */}
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                <Typography variant="h2" sx={{ fontSize: '18px', fontWeight: 800, mb: 0.5 }}>{product.name}</Typography>
                <Typography variant="h3" sx={{ fontSize: '20px', fontWeight: 800, color: 'primary.main' }}>₹{totalPrice.toFixed(0)}</Typography>
            </Box>

            {/* Tabs: Preview / Editor */}
            <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Stack direction="row" sx={{ px: 2 }}>
                    {['Preview', 'Customize'].map((tab, i) => (
                        <Button
                            key={tab}
                            onClick={() => setPreviewTab(i)}
                            sx={{
                                flex: 1, height: '44px', borderRadius: 0,
                                fontWeight: 700, fontSize: '13px',
                                color: previewTab === i ? 'primary.main' : 'text.secondary',
                                borderBottom: previewTab === i ? '2px solid' : '2px solid transparent',
                                borderColor: previewTab === i ? 'primary.main' : 'transparent',
                            }}
                        >{tab}</Button>
                    ))}
                </Stack>
            </Box>

        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
            <Grid container spacing={3}>
                {/* LEFT SIDE: Product Preview */}
                <Grid item xs={12} md={7} sx={{ display: { xs: previewTab === 0 ? 'block' : 'none', md: 'block' } }}>
                    <Paper elevation={0} sx={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        bgcolor: 'rgba(18, 26, 47, 0.6)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        minHeight: { xs: 300, md: 500 },
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mt: 2
                    }}>
                        {['Mug', 'Frame', 'Crystal'].includes(schema.type || product.customization_type) ? (
                            <CanvasPreview
                                bgImageSrc={getPublicUrl(product.image_url)}
                                userImageSrc={userImageSrc}
                                textProps={textProps}
                                customizationData={customizationData}
                                schemaType={schema.type}
                                onReady={setTextureCanvas}
                            />
                        ) : (
                            <Box sx={{ textAlign: 'center', p: 3 }}>
                                {(() => {
                                    const safeProductImg = sanitizeUrl(getPublicUrl(product.image_url), 'https://picsum.photos/seed/gift/400/400');
                                    return (
                                        <img
                                            src={safeProductImg}
                                            alt={product.name}
                                            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px' }}
                                        />
                                    );
                                })()}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* RIGHT SIDE: Customization Panel */}
                <Grid item xs={12} md={5} sx={{ display: { xs: previewTab === 1 ? 'block' : 'none', md: 'block' } }}>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                        {/* Options Selectors based on schema */}
                        {schema.colors && (
                            <FormControl fullWidth>
                                <InputLabel>Choose Color</InputLabel>
                                <Select
                                    value={customizationData.color || ''}
                                    label="Choose Color"
                                    onChange={(e) => setCustomizationData({ ...customizationData, color: e.target.value })}
                                >
                                    {schema.colors.map(color => (
                                        <MenuItem key={color} value={color}>{color}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {schema.types && (
                            <FormControl fullWidth>
                                <InputLabel>Choose Type</InputLabel>
                                <Select
                                    value={customizationData.type || ''}
                                    label="Choose Type"
                                    onChange={(e) => setCustomizationData({ ...customizationData, type: e.target.value })}
                                >
                                    {schema.types.map(t => (
                                        <MenuItem key={typeof t === 'object' ? t.value : t} value={typeof t === 'object' ? t.value : t}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                <Typography variant="body2">{typeof t === 'object' ? t.label : t}</Typography>
                                                {typeof t === 'object' && t.price > 0 && (
                                                    <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 700 }}>
                                                        +₹{t.price}
                                                    </Typography>
                                                )}
                                                {/* Hardcoded logic check for Magic Mug if not in object price */}
                                                {(t === 'Magic Mug' || (typeof t === 'object' && t.value === 'Magic Mug' && !t.price)) && (
                                                    <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 700 }}>+₹5</Typography>
                                                )}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {schema.sizes && (
                            <FormControl fullWidth>
                                <InputLabel>Choose Size</InputLabel>
                                <Select
                                    value={customizationData.size || ''}
                                    label="Choose Size"
                                    onChange={(e) => setCustomizationData({ ...customizationData, size: e.target.value })}
                                >
                                    {schema.sizes.map(s => (
                                        <MenuItem key={typeof s === 'object' ? s.value : s} value={typeof s === 'object' ? s.value : s}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                <Typography variant="body2">{typeof s === 'object' ? s.label : s}</Typography>
                                                {(typeof s === 'object' && s.price > 0) && (
                                                    <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 700 }}>
                                                        +₹{s.price}
                                                    </Typography>
                                                )}
                                                {/* Handle hardcoded logic prices for specific sizes */}
                                                {(!s.price && (s === '12x18-A3' || (typeof s === 'object' && s.value === '12x18-A3'))) && <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 700 }}>+₹10</Typography>}
                                                {(!s.price && (s === '16.5x23.4-A2' || (typeof s === 'object' && s.value === '16.5x23.4-A2'))) && <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 700 }}>+₹20</Typography>}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {schema.layouts && (
                            <FormControl fullWidth>
                                <InputLabel>Choose Layout</InputLabel>
                                <Select
                                    value={customizationData.layout || ''}
                                    label="Choose Layout"
                                    onChange={(e) => setCustomizationData({ ...customizationData, layout: e.target.value })}
                                >
                                    {schema.layouts.map(layout => (
                                        <MenuItem key={layout} value={layout}>{layout}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Hamper / Box Specific Items */}
                        {(schema.type === 'Hamper' || schema.type === 'Box' || schema.type === 'Gift Box') && (
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom fontWeight="bold">Select Items to Add</Typography>
                                <Grid container spacing={1}>
                                    {(schema.items || []).map(item => (
                                        <Grid item xs={6} key={item}>
                                            <FormControlLabel
                                                control={<Radio
                                                    checked={customizationData.extras?.includes(item)}
                                                    onClick={() => toggleExtra(item)}
                                                />}
                                                label={item}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        )}

                        {schema.styles && (
                            <FormControl fullWidth>
                                <InputLabel>Choose Hamper Style</InputLabel>
                                <Select
                                    value={customizationData.style || ''}
                                    label="Choose Hamper Style"
                                    onChange={(e) => setCustomizationData({ ...customizationData, style: e.target.value })}
                                >
                                    {schema.styles.map(s => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Image Upload for Mugs and Frames */}
                        {['Mug', 'Frame', 'Crystal'].includes(schema.type || product.customization_type) && (
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom fontWeight="bold">Upload Photo</Typography>
                                     <Button 
                                         variant="outlined" 
                                         component="label" 
                                         fullWidth 
                                         startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />} 
                                         disabled={isUploading}
                                         sx={{ py: 1.5, borderStyle: 'dashed', borderRadius: '12px', mb: 2 }}
                                     >
                                         {isUploading ? 'Uploading...' : (userImageSrc ? 'Change Photo' : 'Upload Your Photo')}
                                         <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                     </Button>
                            </Paper>
                        )}

                        <InstagramSupportButton />

                        {/* Text Customization */}
                        {['Mug', 'Frame', 'Crystal'].includes(schema.type || product.customization_type) && (
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom fontWeight="bold">Add Custom Text</Typography>
                                <TextField
                                    fullWidth
                                    label="Custom Text"
                                    variant="outlined"
                                    value={textProps.text}
                                    onChange={(e) => setTextProps({ ...textProps, text: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Font</InputLabel>
                                            <Select
                                                value={textProps.fontFamily}
                                                label="Font"
                                                onChange={(e) => setTextProps({ ...textProps, fontFamily: e.target.value })}
                                            >
                                                <MenuItem value="Arial">Arial</MenuItem>
                                                <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                                                <MenuItem value="Courier New">Courier New</MenuItem>
                                                <MenuItem value="Impact">Impact</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Color</InputLabel>
                                            <Select
                                                value={textProps.color}
                                                label="Color"
                                                onChange={(e) => setTextProps({ ...textProps, color: e.target.value })}
                                            >
                                                <MenuItem value="#000000">Black</MenuItem>
                                                <MenuItem value="#FFFFFF">White</MenuItem>
                                                <MenuItem value="#FF0000">Red</MenuItem>
                                                <MenuItem value="#0000FF">Blue</MenuItem>
                                                <MenuItem value="#FFD700">Gold</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}

                    {/* Quantity Selector */}
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1.5, color: 'text.secondary', textTransform: 'uppercase' }}>Quantity</Typography>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', overflow: 'hidden' }}>
                            <Button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))} sx={{ minWidth: 44, height: 44, borderRadius: 0, fontSize: '18px', color: 'text.primary' }}>−</Button>
                            <Typography sx={{ px: 3, fontWeight: 700 }}>{itemQuantity}</Typography>
                            <Button onClick={() => setItemQuantity(itemQuantity + 1)} sx={{ minWidth: 44, height: 44, borderRadius: 0, fontSize: '18px', color: 'text.primary' }}>+</Button>
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Stack spacing={1.5} sx={{ mt: 3, pb: 4 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ 
                                height: '56px', 
                                borderRadius: '16px', 
                                fontSize: '15px', 
                                fontWeight: 600, 
                                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', 
                                boxShadow: '0 8px 24px rgba(236,72,153,0.3)',
                                textTransform: 'none',
                                letterSpacing: '0.5px'
                            }}
                            onClick={handleAddToCart}
                        >
                            Add to Cart — ₹{totalPrice.toFixed(0)}
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ height: '44px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, borderColor: 'rgba(255,255,255,0.15)', color: 'white' }}
                            onClick={() => navigate(-1)}
                        >
                            Save for Later
                        </Button>
                    </Stack>
                    </Box>
                </Grid>
            </Grid>
        </Container>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '12px', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProductCustomizerPage;
