import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, Grid, Typography, Box, Button,
    Paper, Divider, Skeleton, Chip, Stack, IconButton,
    Rating, Tabs, Tab, Snackbar, Alert
} from '@mui/material';
import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReplayIcon from '@mui/icons-material/Replay';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import api, { getPublicUrl } from '../api/axios';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { sanitizeUrl } from '../api/security';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();
    const { token } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [wishlist, setWishlist] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const allImages = product ? [product.image_url, ...(product.secondary_images || [])].filter(Boolean) : [];
    const selectedImageUrl = getPublicUrl(allImages[selectedImage]) || getPublicUrl(product?.image_url);

    const fetchProduct = useCallback(async () => {
        const cleanId = id ? id.replace(/\/+$/, '') : null;
        if (!cleanId) { setError('not_found'); setLoading(false); return; }
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/products/${cleanId}`);
            setProduct(response.data);
        } catch (err) {
            console.error("Error fetching product:", err);
            setError(err.response?.status === 404 ? 'not_found' : 'server_error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchProduct(); }, [fetchProduct]);

    const handleAddToCart = async () => {
        if (!token) { navigate('/login', { state: { from: location.pathname } }); return; }
        try {
            await addToCart(product.id, quantity, {}, null, null);
            setSnackbar({ open: true, message: 'Added to cart!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to add. Try again.', severity: 'error' });
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

    /* ─── Loading skeleton ─── */
    if (loading) return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 6 }, px: { xs: 2, md: 3 } }}>
            <Skeleton variant="rectangular" height={340} sx={{ borderRadius: '16px', mb: 2 }} />
            <Skeleton variant="text" height={44} width="70%" />
            <Skeleton variant="text" height={32} width="40%" />
            <Skeleton variant="rectangular" height={48} sx={{ mt: 3, borderRadius: '12px' }} />
            <Skeleton variant="rectangular" height={48} sx={{ mt: 1.5, borderRadius: '12px' }} />
        </Container>
    );

    /* ─── Error states ─── */
    if (error === 'not_found' || (!loading && !product)) return (
        <Container sx={{ py: 10, textAlign: 'center', px: 3 }}>
            <Typography fontSize={56} mb={1}>😕</Typography>
            <Typography variant="h2" sx={{ mb: 1 }}>Oops! Product not available</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                The item you're looking for might have been moved or deleted.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="contained" onClick={() => navigate('/shop')} sx={{ borderRadius: '12px', height: '48px', px: 3 }}>
                    Back to Shop
                </Button>
            </Stack>
        </Container>
    );

    if (error === 'server_error') return (
        <Container sx={{ py: 10, textAlign: 'center', px: 3 }}>
            <Typography fontSize={56} mb={1}>⚠️</Typography>
            <Typography variant="h2" sx={{ mb: 1 }}>Connection Error</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                We couldn't load this product. Please check your connection and try again.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="contained" startIcon={<ReplayIcon />} onClick={fetchProduct}
                    sx={{ borderRadius: '12px', height: '48px', px: 3 }}>
                    Retry
                </Button>
                <Button variant="outlined" onClick={() => navigate('/shop')}
                    sx={{ borderRadius: '12px', height: '48px', px: 3, borderColor: 'rgba(255,255,255,0.2)' }}>
                    Back to Shop
                </Button>
            </Stack>
        </Container>
    );

    const isCustomizable = product.has_customization || product.customization_type;
    const customizePath = getCustomizePath();

    return (
        <Box sx={{ bgcolor: 'transparent', pb: 10 }}>
            {/* Back button */}
            <Container maxWidth="lg" sx={{ pt: 2, px: { xs: 2, md: 3 } }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ color: 'text.secondary', fontWeight: 600, mb: 2, minHeight: '44px' }}
                >
                    Back
                </Button>
            </Container>

            <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
                <Grid container spacing={{ xs: 2, md: 6 }}>
                    {/* Product Image */}
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                            <Paper elevation={0} sx={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                bgcolor: 'rgba(18, 26, 47, 0.6)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                aspectRatio: '1/1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                {(() => {
                                    const safeDetailImg = sanitizeUrl(selectedImageUrl) || "https://picsum.photos/seed/product/800/800";
                                    return (
                                        <img
                                            src={safeDetailImg}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    );
                                })()}
                                {/* Wishlist */}
                                <IconButton
                                    onClick={() => setWishlist(!wishlist)}
                                    sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.4)', width: 40, height: 40 }}
                                >
                                    {wishlist
                                        ? <FavoriteIcon sx={{ color: '#FF7A59', fontSize: 20 }} />
                                        : <FavoriteBorderIcon sx={{ color: 'white', fontSize: 20 }} />
                                    }
                                </IconButton>
                                {isCustomizable && (
                                    <Chip
                                        label="✦ Customizable"
                                        sx={{
                                            position: 'absolute', bottom: 12, left: 12,
                                            bgcolor: 'rgba(108,99,255,0.85)', color: 'white',
                                            fontWeight: 700, fontSize: '11px',
                                            backdropFilter: 'blur(8px)'
                                        }}
                                    />
                                )}
                            </Paper>

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
                                    {allImages.map((img, idx) => (
                                        <Box
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            sx={{
                                                width: 64, height: 64, flexShrink: 0, borderRadius: '10px', overflow: 'hidden',
                                                border: selectedImage === idx ? '2px solid #6C63FF' : '2px solid rgba(255,255,255,0.08)',
                                                cursor: 'pointer', transition: 'border-color 0.2s'
                                            }}
                                        >
                                            <img src={sanitizeUrl(getPublicUrl(img))} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </motion.div>
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                {product.category_name || 'Premium Gift'}
                            </Typography>
                            <Typography variant="h1" sx={{ fontSize: { xs: '22px', md: '32px' }, fontWeight: 800, mt: 0.5, mb: 1.5, lineHeight: 1.2 }}>
                                {product.name}
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                <Rating value={4.5} readOnly precision={0.5} size="small" />
                                <Typography variant="caption" color="text.secondary">(128 reviews)</Typography>
                            </Stack>

                            {/* Price Block */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                                <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '28px' }}>
                                    ₹{(product.price || 0).toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                    ₹{((product.price || 0) * 1.2).toFixed(0)}
                                </Typography>
                                <Chip label="20% OFF" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700, fontSize: '11px' }} />
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                                {product.description || 'Transform your cherished memories into beautiful keepsakes. This premium quality product is designed to last and bring joy to your loved ones.'}
                            </Typography>

                            <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

                            {/* Quantity */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1.5, display: 'block', color: 'text.secondary' }}>
                                    Quantity
                                </Typography>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', overflow: 'hidden' }}>
                                    <IconButton
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        sx={{ width: 44, height: 44, borderRadius: 0, color: 'text.primary' }}
                                    >
                                        −
                                    </IconButton>
                                    <Typography sx={{ px: 3, fontWeight: 700, minWidth: 48, textAlign: 'center' }}>{quantity}</Typography>
                                    <IconButton
                                        onClick={() => setQuantity(quantity + 1)}
                                        sx={{ width: 44, height: 44, borderRadius: 0, color: 'text.primary' }}
                                    >
                                        +
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Stack spacing={1.5} sx={{ mb: 3 }}>
                                {isCustomizable && (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<ViewInArIcon />}
                                        component={RouterLink}
                                        to={customizePath}
                                        sx={{
                                            borderRadius: '12px', height: '48px', fontSize: '14px', fontWeight: 700,
                                            background: 'linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%)',
                                            boxShadow: '0 4px 16px rgba(108,99,255,0.35)'
                                        }}
                                    >
                                        Customize &amp; Order
                                    </Button>
                                )}
                                <Button
                                    fullWidth
                                    variant={isCustomizable ? 'outlined' : 'contained'}
                                    startIcon={<ShoppingCartIcon />}
                                    onClick={handleAddToCart}
                                    sx={{
                                        borderRadius: '12px', height: '48px', fontSize: '14px', fontWeight: 700,
                                        borderColor: 'rgba(255,255,255,0.2)', color: 'white',
                                        ...(isCustomizable ? {} : {
                                            background: 'linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%)',
                                            border: 'none'
                                        })
                                    }}
                                >
                                    Add to Cart
                                </Button>
                            </Stack>

                            {/* Trust Badges */}
                            <Stack spacing={1}>
                                {[
                                    { icon: <LocalShippingIcon sx={{ fontSize: 16, color: '#10b981' }} />, text: 'Free delivery on orders above ₹999' },
                                    { icon: <VerifiedIcon sx={{ fontSize: 16, color: '#6C63FF' }} />, text: 'Premium quality, 100% satisfaction guaranteed' },
                                ].map((badge) => (
                                    <Stack key={badge.text} direction="row" spacing={1} alignItems="center">
                                        {badge.icon}
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{badge.text}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '12px', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProductDetail;
