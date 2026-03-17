import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Grid, Card, Button, IconButton, 
    Box, Divider, Stack, Checkbox, Paper 
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { getPublicUrl } from '../api/axios';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, loading } = useCart();
    const navigate = useNavigate();
    const [selectedItemIds, setSelectedItemIds] = useState([]);

    useEffect(() => {
        if (cart) {
            setSelectedItemIds(cart.map(item => item.id));
        }
    }, [cart]);

    const handleToggleSelect = (id) => {
        setSelectedItemIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedItemIds.length === cart.length) setSelectedItemIds([]);
        else setSelectedItemIds(cart.map(item => item.id));
    };

    const selectedItems = cart.filter(item => selectedItemIds.includes(item.id));
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
    const total = subtotal;

    const handleCheckout = () => {
        if (selectedItemIds.length === 0) {
            alert("Please select at least one item to checkout");
            return;
        }
        navigate('/checkout', { state: { selectedItemIds } });
    };

    const handleReEdit = (item) => {
        const prodId = item.product.id;
        const name = item.product.name.toLowerCase();
        
        // Determine path based on product customization type or name
        let path = `/customize/${prodId}/${item.id}`;
        const customType = (item.product.customization_type || '').toLowerCase();
        
        if (customType.includes('hamper') || name.includes('hamper')) {
            path = `/customize/hamper/${prodId}/${item.id}`;
        } else if (customType.includes('gift') || name.includes('gift box')) {
            path = `/customize/giftbox/${prodId}/${item.id}`;
        } else if (customType.includes('mug') || name.includes('mug')) {
            path = `/customize/mug/${prodId}/${item.id}`;
        } else if (customType.includes('frame') || name.includes('frame')) {
            path = `/customize/frame/${prodId}/${item.id}`;
        }
        
        navigate(path);
    };

    if (loading) return <LoadingState type="product" />;

    if (!cart || cart.length === 0) return (
        <ErrorState 
            title="Your cart is empty"
            message="Looks like you haven't added any magic to your bag yet."
            onRetry={() => navigate('/shop')}
            retryText="Start Shopping"
        />
    );

    return (
        <Box sx={{ py: { xs: 4, md: 8 }, bgcolor: 'transparent', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Box>
                        <Typography variant="h2" sx={{ fontWeight: 900, mb: 1 }}>Bag</Typography>
                        <Typography color="text.secondary" sx={{ fontWeight: 700 }}>{cart.length} unique items</Typography>
                    </Box>
                    <Button 
                        startIcon={<DeleteSweepIcon />} 
                        onClick={clearCart} 
                        color="error" 
                        sx={{ fontWeight: 800, borderRadius: '12px' }}
                    >
                        Clear All
                    </Button>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                            <Checkbox 
                                checked={selectedItemIds.length === cart.length && cart.length > 0}
                                indeterminate={selectedItemIds.length > 0 && selectedItemIds.length < cart.length}
                                onChange={handleSelectAll}
                                sx={{ color: 'primary.main' }}
                            />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Select All</Typography>
                        </Box>

                        <Stack spacing={3}>
                            <AnimatePresence mode='popLayout'>
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Card sx={{ 
                                            p: { xs: 2, sm: 3 }, 
                                            display: 'flex', 
                                            gap: { xs: 2, sm: 3 }, 
                                            alignItems: 'center',
                                            position: 'relative',
                                            border: selectedItemIds.includes(item.id) ? '2px solid' : '1px solid',
                                            borderColor: selectedItemIds.includes(item.id) ? 'primary.main' : 'divider',
                                            boxShadow: selectedItemIds.includes(item.id) ? '0 12px 24px -10px rgba(124, 58, 237, 0.2)' : 'none'
                                        }}>
                                            <Checkbox 
                                                checked={selectedItemIds.includes(item.id)}
                                                onChange={() => handleToggleSelect(item.id)}
                                                sx={{ color: 'primary.main' }}
                                            />
                                            
                                            <Box sx={{ 
                                                width: { xs: 90, sm: 140 }, 
                                                height: { xs: 90, sm: 140 }, 
                                                borderRadius: '24px', 
                                                overflow: 'hidden',
                                                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                                                bgcolor: 'background.default'
                                            }}>
                                                <img 
                                                    src={getPublicUrl(item.preview_image_url || item.product?.image_url)} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    alt={item.product?.name || 'Product Preview'}
                                                />
                                            </Box>

                                            <Box sx={{ flex: 1 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Box>
                                                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>{item.product?.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            Handcrafted Gift
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{(item.product?.price || 0).toFixed(0)}</Typography>
                                                </Stack>

                                                <Stack direction="row" spacing={2} sx={{ mt: 3 }} alignItems="center" flexWrap="wrap" gap={2}>
                                                    <Box sx={{ 
                                                        display: 'flex', alignItems: 'center', bgcolor: 'background.default', 
                                                        borderRadius: '14px', border: '1px solid', borderColor: 'divider',
                                                        height: 44, px: 0.5
                                                    }}>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>
                                                        <Typography sx={{ px: 2, fontWeight: 900 }}>{item.quantity}</Typography>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                    
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small"
                                                        startIcon={<EditIcon />} 
                                                        onClick={() => handleReEdit(item)}
                                                        sx={{ fontWeight: 800, borderRadius: '12px', color: 'accent.main', borderColor: 'accent.main', '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.05)', borderColor: 'accent.main' } }}
                                                    >
                                                        Re-edit
                                                    </Button>

                                                    <IconButton 
                                                        onClick={() => removeFromCart(item.id)}
                                                        sx={{ color: 'error.light', opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Stack>
                                            </Box>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, position: 'sticky', top: 120, borderRadius: '32px' }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 4 }}>Total Balance</Typography>
                            
                            <Stack spacing={3} sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary" sx={{ fontWeight: 700 }}>Selected ({selectedItems.length})</Typography>
                                    <Typography sx={{ fontWeight: 900 }}>₹{subtotal.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary" sx={{ fontWeight: 700 }}>Shipping & GST</Typography>
                                    <Typography color="success.main" sx={{ fontWeight: 800 }}>Calculated @ Checkout</Typography>
                                </Box>
                                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>Grand Total</Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{total.toFixed(0)}</Typography>
                                </Box>
                            </Stack>

                            <Button
                                fullWidth variant="contained" size="large"
                                onClick={handleCheckout}
                                disabled={selectedItemIds.length === 0}
                                sx={{ 
                                    py: 2.2, borderRadius: '20px', fontSize: '1.2rem', fontWeight: 900,
                                    boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.4)'
                                }}
                            >
                                Checkout ({selectedItems.length})
                            </Button>

                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, opacity: 0.6, fontWeight: 700 }}>
                                🔒 Secure Payments • Express Shipping
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Cart;
