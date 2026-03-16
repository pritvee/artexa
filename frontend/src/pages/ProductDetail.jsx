import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Typography, Box, Button,
    Paper, Divider, Skeleton, Chip, Stack
} from '@mui/material';
import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { motion } from 'framer-motion';
import api, { getPublicUrl } from '../api/axios';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();
    const { token } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // 'not_found', 'server_error', or null
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const allImages = product ? [product.image_url, ...(product.secondary_images || [])].filter(Boolean) : [];
    const selectedImageUrl = getPublicUrl(allImages[selectedImage]) || getPublicUrl(product?.image_url);

    useEffect(() => {
        const fetchProduct = async () => {
            const cleanId = id ? id.replace(/\/+$/, '') : null;
            if (!cleanId) {
                setError('not_found');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/products/${cleanId}`);
                setProduct(response.data);
            } catch (err) {
                console.error("Error fetching product:", err);
                if (err.response?.status === 404) {
                    setError('not_found');
                } else {
                    setError('server_error');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async (redirect = true) => {
        if (!token) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        try {
            await addToCart(product.id, quantity, {}, null, null);
            if (redirect) navigate('/cart');
        } catch (err) {
            console.error("Add to cart failed", err);
        }
    };

    const handleBuyNow = async () => {
        if (!token) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        try {
            await addToCart(product.id, quantity, {}, null, null);
            navigate('/checkout');
        } catch (err) {
            console.error("Buy now failed", err);
        }
    };

    const getCustomizePath = () => {
        if (!product) return '#';
        const type = (product.customization_type || '').toLowerCase();
        if (type.includes('mug')) return `/customize/mug/${id}`;
        if (type.includes('frame')) return `/customize/frame/${id}`;
        if (type.includes('hamper')) return `/customize/hamper/${id}`;
        if (type.includes('gift')) return `/customize/giftbox/${id}`;
        return `/customize/${id}`;
    };

    const customizePath = getCustomizePath();

    if (loading) return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Grid container spacing={6}>
                <Grid item xs={12} md={6}>
                    <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 4 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Skeleton variant="text" height={60} width="80%" />
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="rectangular" height={200} sx={{ my: 4, borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={60} width="100%" />
                </Grid>
            </Grid>
        </Container>
    );

    if (error === 'not_found' || (!loading && !product && !error)) return (
        <Container sx={{ py: 10, textAlign: 'center' }}>
            <Typography variant="h4" color="text.secondary" gutterBottom>Product not found</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                The item you're looking for might have been moved or deleted.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/shop')}>Back to Shop</Button>
        </Container>
    );

    if (error === 'server_error') return (
        <Container sx={{ py: 10, textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>Oops! Something went wrong</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We had trouble loading this product. Please try refreshing the page.
            </Typography>
            <Button variant="outlined" onClick={() => window.location.reload()} sx={{ mr: 2 }}>Refresh Page</Button>
            <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </Container>
    );

    const isCustomizable = product.has_customization || product.customization_type;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Grid container spacing={8}>
                {/* Left Section: Image Gallery */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ position: 'sticky', top: 100 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Paper elevation={0} sx={{ 
                                borderRadius: 6, 
                                overflow: 'hidden', 
                                bgcolor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                position: 'relative',
                                aspectRatio: '1/1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img 
                                    src={selectedImageUrl || "https://picsum.photos/seed/product/800/800"} 
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                                {isCustomizable && (
                                    <Chip 
                                        label="Customizable" 
                                        color="secondary" 
                                        sx={{ 
                                            position: 'absolute', 
                                            top: 20, 
                                            left: 20, 
                                            fontWeight: 800,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }} 
                                    />
                                )}
                            </Paper>
                        </motion.div>

                        {/* Optional Gallery Thumbs */}
                        {allImages.length > 1 && (
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                {allImages.map((img, idx) => (
                                    <Grid item xs={3} key={img || idx}>
                                        <Paper 
                                            elevation={0}
                                            onClick={() => setSelectedImage(idx)}
                                            sx={{ 
                                                borderRadius: 2, 
                                                overflow: 'hidden', 
                                                cursor: 'pointer',
                                                border: selectedImage === idx ? '2px solid' : '1px solid #e2e8f0',
                                                borderColor: selectedImage === idx ? 'primary.main' : '#e2e8f0',
                                                aspectRatio: '1/1'
                                            }}
                                        >
                                            <img src={getPublicUrl(img) || "https://picsum.photos/seed/product/200/200"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Grid>

                {/* Right Section: Details */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 2 }}>
                                {product.category_name || "PREMIUM GIFT"}
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                                {product.name}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Typography variant="h3" color="primary" sx={{ fontWeight: 900 }}>
                                    ₹{(product.price || 0).toLocaleString()}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                    ₹{((product.price || 0) * 1.2).toLocaleString()}
                                </Typography>
                                <Chip label="20% OFF" color="success" size="small" sx={{ fontWeight: 700, borderRadius: 1 }} />
                            </Box>

                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
                                {product.description || "Transform your cherished memories into beautiful keepsakes. This premium quality product is designed to last and bring joy to your loved ones. Perfect for gifting on birthdays, anniversaries, or any special occasion."}
                            </Typography>

                            <Divider sx={{ mb: 4 }} />

                            {/* Quantity Selector */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>QUANTITY</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: 2,
                                        px: 1,
                                        bgcolor: '#f8fafc'
                                    }}>
                                        <Button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            sx={{ minWidth: 40, color: 'text.primary', fontWeight: 900 }}
                                        >-</Button>
                                        <Typography sx={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{quantity}</Typography>
                                        <Button 
                                            onClick={() => setQuantity(quantity + 1)}
                                            sx={{ minWidth: 40, color: 'text.primary', fontWeight: 900 }}
                                        >+</Button>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">In Stock | Fast Shipping</Typography>
                                </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Stack spacing={2}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        size="large"
                                        onClick={() => handleAddToCart()}
                                        sx={{ 
                                            py: 2, 
                                            borderRadius: 2, 
                                            fontWeight: 800, 
                                            bgcolor: '#222',
                                            '&:hover': { bgcolor: '#000' }
                                        }}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        color="primary"
                                        size="large"
                                        onClick={handleBuyNow}
                                        sx={{ py: 2, borderRadius: 2, fontWeight: 800 }}
                                    >
                                        Buy Now
                                    </Button>
                                </Stack>

                                {isCustomizable && (
                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        color="secondary"
                                        size="large"
                                        startIcon={<ViewInArIcon />}
                                        component={RouterLink}
                                        to={customizePath}
                                        sx={{ 
                                            py: 2, 
                                            borderRadius: 2, 
                                            fontWeight: 800, 
                                            borderWidth: 2,
                                            '&:hover': { borderWidth: 2 }
                                        }}
                                    >
                                        Customize Product
                                    </Button>
                                )}
                            </Stack>

                            <Box sx={{ mt: 6 }}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Premium Quality</Typography>
                                        <Typography variant="caption" color="text.secondary">Handcrafted with care</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Secure Payment</Typography>
                                        <Typography variant="caption" color="text.secondary">100% safe transactions</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Fast Delivery</Typography>
                                        <Typography variant="caption" color="text.secondary">Ships in 24-48 hours</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </motion.div>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProductDetail;
