import React from 'react';
import {
    Container, Typography, Grid, Button, CircularProgress,
    Box, Stepper, Step, StepLabel, Divider, Chip,
    StepConnector, stepConnectorClasses, Card, Avatar, Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { motion } from 'framer-motion';
import { useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useOrders, ORDER_STATUSES } from '../store/OrderContext';

// Colored step connector
const ColorConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: { backgroundImage: 'linear-gradient(90deg, #7C3AED, #EC4899)' },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: { backgroundImage: 'linear-gradient(90deg, #7C3AED, #EC4899)' },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 4, border: 0, borderRadius: 2,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0',
    },
}));

const STATUS_ICONS = [ReceiptIcon, InventoryIcon, PrintIcon, LocalShippingIcon, DirectionsBikeIcon, CheckCircleIcon];

const ColorStepIcon = ({ active, completed, icon }) => {
    const Icon = STATUS_ICONS[icon - 1] || ReceiptIcon;
    return (
        <Box sx={{
            zIndex: 1, width: 48, height: 48, borderRadius: '16px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: active || completed
                ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                : 'transparent',
            border: active || completed ? 'none' : '2px solid rgba(124, 58, 237, 0.2)',
            color: active || completed ? '#fff' : 'text.secondary',
            boxShadow: active ? '0 10px 20px -5px rgba(124, 58, 237, 0.4)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: active ? 'scale(1.1)' : 'scale(1)',
        }}>
            <Icon sx={{ fontSize: 22 }} />
        </Box>
    );
};

const OrderTracking = () => {
    const { orders, loading } = useOrders();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');

    if (loading) return (
        <Container sx={{ py: 15, textAlign: 'center' }}>
            <CircularProgress color="primary" />
            <Typography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>Fetching your journey...</Typography>
        </Container>
    );

    const displayOrders = orderId ? orders.filter(o => o.id.toString() === orderId) : orders;

    return (
        <Box sx={{ minHeight: '100vh', py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
            <Container maxWidth="md">
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 1 }}>
                        {orderId ? "Track Order" : "My Orders"}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                        {orderId ? "Follow your package's progress in real-time." : "Track your handcrafted memories in real-time."}
                    </Typography>
                </Box>

                <Stack spacing={4}>
                    {displayOrders.length === 0 ? (
                        <Card sx={{ p: 8, textAlign: 'center' }}>
                            <InventoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>No orders found yet</Typography>
                            <Typography color="text.secondary" sx={{ mb: 4 }}>Time to create something beautiful!</Typography>
                            <Button variant="contained" size="large" component={RouterLink} to="/shop">
                                Start Customizing
                            </Button>
                        </Card>
                    ) : displayOrders.map((order, oi) => {
                        const statusIndex = ORDER_STATUSES.findIndex(s => s.key === order.status);
                        const currentStatus = ORDER_STATUSES[statusIndex] || ORDER_STATUSES[0];

                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: oi * 0.1, duration: 0.5 }}
                            >
                                <Card sx={{ overflow: 'hidden', border: 'none' }}>
                                    {/* Order header */}
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                                        p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                                                Order #{order.id}
                                            </Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 600 }}>
                                                Ordered on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={currentStatus.label}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.15)',
                                                color: '#fff',
                                                fontWeight: 800,
                                                px: 2,
                                                py: 2.5,
                                                fontSize: '0.85rem',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255,255,255,0.2)'
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ p: { xs: 3, md: 5 } }}>
                                        {/* Delivery Stepper */}
                                        <Stepper
                                            activeStep={statusIndex}
                                            alternativeLabel
                                            connector={<ColorConnector />}
                                            sx={{ mb: 6 }}
                                        >
                                            {ORDER_STATUSES.map((s, idx) => (
                                                <Step key={s.key} completed={idx < statusIndex}>
                                                    <StepLabel
                                                        StepIconComponent={(props) =>
                                                            <ColorStepIcon {...props} icon={idx + 1} />
                                                        }
                                                        sx={{
                                                            '& .MuiStepLabel-label': {
                                                                fontSize: '0.75rem',
                                                                fontWeight: idx === statusIndex ? 800 : 600,
                                                                mt: 1.5,
                                                                color: idx === statusIndex ? 'primary.main' : 'text.secondary',
                                                            },
                                                        }}
                                                    >
                                                        {s.label}
                                                    </StepLabel>
                                                </Step>
                                            ))}
                                        </Stepper>

                                        {/* Shipping info Grid */}
                                        <Grid container spacing={2} sx={{ mb: 4 }}>
                                            {[
                                                { label: 'Courier', value: order.courier_partner || 'Assigning soon...', icon: <LocalShippingIcon fontSize="small" /> },
                                                { label: 'Tracking ID', value: order.tracking_id || 'TBA', icon: <ReceiptIcon fontSize="small" />, color: 'primary.main' },
                                                { label: 'Address', value: order.shipping_address, icon: <DirectionsBikeIcon fontSize="small" />, fullWidth: true }
                                            ].map((info, idx) => (
                                                <Grid item xs={12} sm={info.fullWidth ? 12 : 6} key={idx}>
                                                    <Box sx={{ 
                                                        p: 2, borderRadius: '16px', bgcolor: 'background.default',
                                                        border: '1px solid', borderColor: 'divider'
                                                    }}>
                                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                                            <Box sx={{ color: 'primary.main', opacity: 0.6 }}>{info.icon}</Box>
                                                            <Box>
                                                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', opacity: 0.5, fontSize: '0.65rem' }}>
                                                                    {info.label}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: info.color || 'text.primary' }}>
                                                                    {info.value}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>

                                        <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

                                        {/* Items List */}
                                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Order Items</Typography>
                                        <Stack spacing={2.5}>
                                            {order.items.map((item, i) => (
                                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, borderRadius: '20px', '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.05)' }, transition: 'all 0.3s' }}>
                                                    <Avatar 
                                                        src={item.product?.image_url} 
                                                        variant="rounded" 
                                                        sx={{ width: 64, height: 64, borderRadius: '14px', boxShadow: '0 8px 20px -8px rgba(0,0,0,0.2)' }} 
                                                    />
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body1" sx={{ fontWeight: 800 }}>{item.product?.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                            Qty: {item.quantity} 
                                                            {item.customization_details && <> • {Object.entries(item.customization_details).map(([k,v]) => `${k}: ${v}`).join(', ')}</>}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
                                                        ₹{(item.price * item.quantity).toFixed(0)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>

                                        <Box sx={{ 
                                            mt: 4, pt: 3, borderTop: '2px solid', borderColor: 'divider',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 700 }}>Final Total</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                                ₹{order.total_price.toFixed(0)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Card>
                            </motion.div>
                        );
                    })}
                </Stack>
            </Container>
        </Box>
    );
};

export default OrderTracking;
