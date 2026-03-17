import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Grid, Box, Typography, Button, CircularProgress,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Divider, Paper, Radio, FormControlLabel
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
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
    const [customizationData, setCustomizationData] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);

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
                            if (details.image) setUserImageSrc(details.image);
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
        setTotalPrice(base);
    }, [customizationData, product]);

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
            alert('Please login to upload photos.');
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setUserImageSrc(reader.result);
        reader.readAsDataURL(file);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/customization/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCustomizationData(prev => ({ ...prev, uploadedImageUrl: res.data.url }));
        } catch (err) { console.error(err); }
    };

    const handleAddToCart = async () => {
        if (!user) {
            alert('Please login to add items to cart.');
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        let flatDesignUrl = customizationData.flat_design_image || null;
        try {
            if (textureCanvas) flatDesignUrl = await uploadContextCanvas(textureCanvas, 'flat_texture.png', true);
        } catch (e) { console.warn("Snapshot failed"); }

        try {
            const finalCustomization = {
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
                await updateCartItem(parseInt(cartItemId), { customization_details: finalCustomization });
                alert("Cart item updated!");
            } else {
                await api.post('/cart/items/', {
                    product_id: parseInt(id),
                    quantity: 1,
                    customization_details: finalCustomization
                });
                alert("Added to cart!");
            }
            navigate('/cart');
        } catch (error) {
            console.error("Failed to add/update cart", error);
            alert("Failed to process request.");
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

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (!product) return <Container sx={{ py: 8 }}><Typography variant="h5">Product not found.</Typography></Container>;

    const schema = product.customization_schema || {};

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
                {/* LEFT SIDE: Live Preview */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 2, height: '100%', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
                        {['Mug', 'Frame', 'Crystal'].includes(schema.type || product.customization_type) ? (
                            <Box sx={{ border: '2px dashed #ccc', p: 2 }}>
                                <CanvasPreview
                                    bgImageSrc={product.image_url || 'https://via.placeholder.com/400x400?text=Blank+Product'}
                                    userImageSrc={userImageSrc}
                                    textProps={textProps}
                                    customizationData={customizationData}
                                    schemaType={schema.type}
                                    onReady={setTextureCanvas}
                                />
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center' }}>
                                <img src={product.image_url || 'https://via.placeholder.com/400x400'} alt={product.name} style={{ maxWidth: '100%', maxHeight: '500px' }} />
                                <Typography variant="h6" sx={{ mt: 2 }}>Visual layout preview for {schema.type}</Typography>
                                <Typography color="textSecondary">{schema.type === 'Hamper' ? 'Hamper Builder' : 'Box Builder'} Theme</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* RIGHT SIDE: Customization Panel */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" fontWeight="bold">{product.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Typography variant="h5" color="secondary" sx={{ fontWeight: 'bold' }}>
                                ₹{totalPrice.toFixed(2)}
                            </Typography>
                            {totalPrice > product.price && (
                                <Typography variant="body2" color="textSecondary" sx={{ textDecoration: 'line-through' }}>
                                    ₹{product.price.toFixed(2)}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

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
                                <Button variant="outlined" component="label" fullWidth>
                                    Select Image
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
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

                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProductCustomizerPage;
