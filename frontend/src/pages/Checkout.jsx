import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Grid, Paper, TextField, Button, Box, 
    Divider, MenuItem, Checkbox, FormControlLabel, RadioGroup, 
    Radio, FormControl, FormLabel, Stack, Chip, IconButton,
    Alert, Zoom, Fade, Card
} from '@mui/material';
import { 
    HomeOutlined as HomeIcon, 
    Add as AddIcon, 
    CheckCircle as CheckCircleIcon,
    ArrowBack as ArrowBackIcon,
    LocalShipping as ShippingIcon,
    AccountBalanceWallet as WalletIcon,
    CardGiftcard as GiftIcon,
    VerifiedUser as BadgeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useOrders } from '../store/OrderContext';
import api from '../api/axios';
import { getPublicUrl } from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { motion } from 'framer-motion';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { cart, fetchCart, clearCart } = useCart();
    const { createOrder, verifyPayment } = useOrders();

    const selectedItemIds = location.state?.selectedItemIds || [];
    const checkoutCart = selectedItemIds.length > 0 
        ? cart.filter(item => selectedItemIds.includes(item.id)) 
        : cart;

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [newAddress, setNewAddress] = useState({
        street: '', city: '', state: '', zip_code: '', country: 'India'
    });
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [giftNote, setGiftNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await api.get('/users/me/addresses');
                setAddresses(res.data);
                if (res.data.length > 0) {
                    const defaultAddr = res.data.find(a => a.is_default) || res.data[0];
                    setSelectedAddressId(defaultAddr.id);
                } else {
                    setShowNewAddressForm(true);
                }
            } catch (err) {
                console.error("Fetch addresses failed", err);
            }
        };
        fetchAddresses();
    }, []);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        
        let shippingStr = "";
        if (showNewAddressForm) {
            if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip_code) {
                alert("Please fill all required address fields");
                setIsProcessing(false);
                return;
            }
            shippingStr = `${newAddress.street}, ${newAddress.city}, ${newAddress.state} - ${newAddress.zip_code}, ${newAddress.country}`;
        } else {
            const addr = addresses.find(a => a.id === selectedAddressId);
            if (!addr) {
                alert("Please select or add a delivery address");
                setIsProcessing(false);
                return;
            }
            shippingStr = `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zip_code}, ${addr.country}`;
        }

        try {
            const orderMetadata = {
                shipping_address: shippingStr,
                payment_method: paymentMethod,
                gift_note: giftNote,
                item_ids: selectedItemIds.length > 0 ? selectedItemIds : null
            };

            const order = await createOrder(orderMetadata);

            if (paymentMethod === 'cod') {
                setOrderSuccess(true);
                await fetchCart(); // Ensure cart UI is refreshed
                setTimeout(() => navigate('/orders'), 2000);
                return;
            }

            // --- Online Payment Logic ---
            if (order.razorpay_order_id && order.razorpay_order_id.startsWith('mock_rzp_')) {
                await verifyPayment({
                    order_id: order.id,
                    razorpay_order_id: order.razorpay_order_id,
                    razorpay_payment_id: "mock_payment_id",
                    razorpay_signature: "mock_signature"
                });
                setOrderSuccess(true);
                await fetchCart();
                setTimeout(() => navigate('/orders'), 2000);
                return;
            }

            const res = await loadRazorpayScript();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                setIsProcessing(false);
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_5yBThevW2uEub2',
                amount: order.total_price * 100,
                currency: "INR",
                name: "ARTEZA Studio",
                description: `Order #${order.id}`,
                order_id: order.razorpay_order_id,
                handler: async function (response) {
                    try {
                        await verifyPayment({
                            order_id: order.id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        setOrderSuccess(true);
                        await fetchCart();
                        setTimeout(() => navigate('/orders'), 2000);
                    } catch (err) {
                        alert("Payment verification failed. Please check your orders page.");
                        navigate('/orders');
                    }
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessing(false);
                        alert("Payment cancelled. You can try again from your orders page.");
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: user?.phone || ""
                },
                theme: { color: "#7C3AED" }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error("Order creation failed", err);
            const msg = err.response?.data?.detail || "Failed to initiate order. Please try again.";
            alert(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    if (orderSuccess) return (
        <Container sx={{ py: 15, textAlign: 'center' }}>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 15 }}>
                <CheckCircleIcon sx={{ fontSize: 100, color: 'success.main', mb: 3 }} />
                <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Wooohooo!
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>Order Placed Successfully!</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>Redirecting you to tracking page...</Typography>
                <Button variant="contained" size="large" onClick={() => navigate('/orders')} sx={{ borderRadius: 4, px: 6, py: 2 }}>
                    Track Order Now
                </Button>
            </motion.div>
        </Container>
    );

    if (!checkoutCart || checkoutCart.length === 0) return (
        <Container sx={{ py: 10, textAlign: 'center' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>No items to checkout</Typography>
                <Button variant="contained" size="large" onClick={() => navigate('/cart')} sx={{ borderRadius: 3, px: 4 }}>
                    Back to Cart
                </Button>
            </motion.div>
        </Container>
    );

    const subtotal = checkoutCart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const shipping = subtotal > 0 ? 50.0 : 0;
    const total = subtotal + shipping;

    return (
        <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 8 }, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 6 }}>
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={() => navigate('/cart')} 
                        sx={{ mb: 2, borderRadius: 3, color: 'text.secondary', fontWeight: 700 }}
                    >
                        Back to Cart
                    </Button>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 1 }}>Checkout</Typography>
                    <Typography color="text.secondary">Almost there! Complete your purchase below.</Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* Left side: Information Panels */}
                    <Grid item xs={12} md={7}>
                        <Stack spacing={4}>
                            {/* Address Panel */}
                            <Card sx={{ p: 4 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                                    <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'rgba(124, 58, 237, 0.1)', color: 'primary.main' }}>
                                        <ShippingIcon />
                                    </Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Delivery Address</Typography>
                                </Stack>

                                {addresses.length > 0 && !showNewAddressForm ? (
                                    <Stack spacing={2}>
                                        {addresses.map(addr => (
                                            <Box
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                sx={{
                                                    p: 3, borderRadius: '20px', cursor: 'pointer',
                                                    border: '2px solid',
                                                    borderColor: selectedAddressId === addr.id ? 'primary.main' : 'divider',
                                                    background: selectedAddressId === addr.id ? 'rgba(124, 58, 237, 0.03)' : 'transparent',
                                                    transition: 'all 0.3s ease',
                                                    position: 'relative',
                                                    '&:hover': { borderColor: 'primary.main', transform: 'translateX(8px)' }
                                                }}
                                            >
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{addr.street}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{addr.city}, {addr.state} {addr.zip_code}</Typography>
                                                    </Box>
                                                    {selectedAddressId === addr.id && <CheckCircleIcon color="primary" />}
                                                </Stack>
                                            </Box>
                                        ))}
                                        <Button 
                                            variant="text" 
                                            startIcon={<AddIcon />} 
                                            onClick={() => setShowNewAddressForm(true)}
                                            sx={{ alignSelf: 'flex-start', mt: 1 }}
                                        >
                                            Deliver to a new address
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Fade in={true}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                            {addresses.length > 0 && (
                                                <Button startIcon={<ArrowBackIcon />} onClick={() => setShowNewAddressForm(false)} sx={{ alignSelf: 'flex-start' }}>
                                                    Back to saved addresses
                                                </Button>
                                            )}
                                            <TextField
                                                fullWidth label="Street Address"
                                                variant="outlined"
                                                value={newAddress.street}
                                                onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                            />
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <TextField fullWidth label="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TextField fullWidth label="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <TextField fullWidth label="ZIP Code" value={newAddress.zip_code} onChange={e => setNewAddress({ ...newAddress, zip_code: e.target.value })} />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TextField fullWidth label="Country" value="India" disabled />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Fade>
                                )}
                            </Card>

                            {/* Payment Panel */}
                            <Card sx={{ p: 4 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                                    <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'rgba(236, 72, 153, 0.1)', color: 'secondary.main' }}>
                                        <WalletIcon />
                                    </Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Payment Method</Typography>
                                </Stack>

                                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                    <Stack spacing={2}>
                                        {[
                                            { id: 'online', label: 'Pay Online', desc: 'Securely pay via UPI, Card, or NetBanking', icon: '💳' },
                                            { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your gift arrives', icon: '💵' }
                                        ].map(m => (
                                            <Box
                                                key={m.id}
                                                onClick={() => setPaymentMethod(m.id)}
                                                sx={{
                                                    p: 3, borderRadius: '20px', cursor: 'pointer',
                                                    border: '2px solid',
                                                    borderColor: paymentMethod === m.id ? 'secondary.main' : 'divider',
                                                    background: paymentMethod === m.id ? 'rgba(236, 72, 153, 0.03)' : 'transparent',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': { borderColor: 'secondary.main' }
                                                }}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Radio value={m.id} color="secondary" />
                                                    <Box sx={{ fontSize: '1.5rem' }}>{m.icon}</Box>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 700 }}>{m.label}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{m.desc}</Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                </RadioGroup>
                            </Card>

                            {/* Gift Note Panel */}
                            <Card sx={{ p: 4 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'rgba(245, 158, 11, 0.1)', color: 'accent.main' }}>
                                        <GiftIcon />
                                    </Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Add a Gift Message</Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Add a personal touch to your gift. We'll print this beautiful note for you.
                                </Typography>
                                <TextField
                                    fullWidth multiline rows={3}
                                    placeholder="Write your heartfelt message here..."
                                    value={giftNote}
                                    onChange={(e) => setGiftNote(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                                />
                            </Card>
                        </Stack>
                    </Grid>

                    {/* Right side: Fixed Summary Panel */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 4, position: 'sticky', top: 100, borderRadius: '32px' }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 4 }}>Order Details</Typography>

                            <Stack spacing={2} sx={{ mb: 4 }}>
                                {checkoutCart.slice(0, 3).map(item => (
                                    <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Box sx={{ width: 50, height: 50, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                            <img src={getPublicUrl(item.preview_image_url || item.product?.image_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{item.product?.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                                        </Box>
                                        <Typography sx={{ fontWeight: 700 }}>₹{((item.product?.price || 0) * item.quantity).toFixed(0)}</Typography>
                                    </Box>
                                ))}
                                {checkoutCart.length > 3 && (
                                    <Typography variant="caption" color="primary" sx={{ textAlign: 'center', fontWeight: 700 }}>
                                        + {checkoutCart.length - 3} more items
                                    </Typography>
                                )}
                            </Stack>

                            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

                            <Stack spacing={2} sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Item Total</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>₹{subtotal.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Handled & Shipping</Typography>
                                    <Typography sx={{ fontWeight: 700, color: 'success.main' }}>
                                        {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 900 }}>Total</Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{total.toFixed(2)}</Typography>
                                </Box>
                            </Stack>

                            <Button
                                fullWidth variant="contained" size="large"
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                                sx={{ 
                                    py: 2.5, borderRadius: '20px', fontSize: '1.2rem', fontWeight: 900,
                                    boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.4)'
                                }}
                            >
                                {isProcessing ? 'Initiating...' : paymentMethod === 'online' ? 'Proceed to Pay' : 'Confirm & Place Order'}
                            </Button>

                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 4, opacity: 0.6 }}>
                                <BadgeIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>100% Satisfaction Guaranteed</Typography>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Checkout;
