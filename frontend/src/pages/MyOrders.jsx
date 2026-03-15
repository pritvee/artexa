import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Grid, Button, CircularProgress,
    Box, Chip, Card, Avatar, Stack, Divider, IconButton,
    Tooltip, Paper, useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useOrders, ORDER_STATUSES } from '../store/OrderContext';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import { getPublicUrl } from '../api/axios';

const MyOrders = () => {
    const { orders, loading, fetchMyOrders } = useOrders();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        fetchMyOrders();
    }, []);

    if (loading && orders.length === 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ mb: 4, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, opacity: 0.7 }}>Loading your memories...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h2" sx={{ 
                    fontWeight: 900, 
                    mb: 2,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}>
                    My Orders
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.6, maxWidth: 600 }}>
                    Track your handcrafted gifts from our studio to your doorstep.
                </Typography>
            </Box>

            {orders.length === 0 ? (
                <Paper sx={{ 
                    p: 8, 
                    textAlign: 'center', 
                    borderRadius: 8,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
                    border: '1px solid',
                    borderColor: 'divider',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Inventory2Icon sx={{ fontSize: 100, color: 'primary.main', mb: 3, opacity: 0.2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>No orders yet</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 400, mx: 'auto' }}>
                        Your journey with Artexa hasn't started yet. Create something beautiful today!
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large" 
                        component={RouterLink} 
                        to="/shop"
                        sx={{ 
                            borderRadius: '16px', 
                            px: 6, 
                            py: 2, 
                            fontWeight: 800,
                            boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)'
                        }}
                    >
                        Browse Collections
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={4}>
                    <AnimatePresence>
                        {orders.map((order, idx) => {
                            const currentStatus = ORDER_STATUSES.find(s => s.key === order.status) || ORDER_STATUSES[0];
                            const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                            });

                            return (
                                <Grid item xs={12} key={order.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card sx={{ 
                                            borderRadius: 6,
                                            overflow: 'hidden',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                            bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#fff',
                                            backdropFilter: 'blur(10px)',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.05)',
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}>
                                            {/* Order Banner Header */}
                                            <Box sx={{ 
                                                p: 3, 
                                                display: 'flex', 
                                                flexWrap: 'wrap',
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                gap: 2,
                                                background: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.03)',
                                                borderBottom: '1px solid',
                                                borderColor: 'divider'
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ 
                                                        width: 48, 
                                                        height: 48, 
                                                        borderRadius: '14px', 
                                                        bgcolor: 'primary.main', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        color: '#fff',
                                                        boxShadow: '0 8px 16px rgba(124, 58, 237, 0.2)'
                                                    }}>
                                                        <ReceiptLongIcon />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Order #{order.id}</Typography>
                                                        <Stack direction="row" spacing={2} sx={{ opacity: 0.6 }}>
                                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <CalendarMonthIcon sx={{ fontSize: '0.9rem' }} /> {orderDate}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <PaymentIcon sx={{ fontSize: '0.9rem' }} /> {order.payment_status?.toUpperCase()}
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Chip 
                                                        label={currentStatus.label} 
                                                        color={currentStatus.color === 'default' ? 'default' : currentStatus.color}
                                                        variant="filled"
                                                        sx={{ 
                                                            fontWeight: 800, 
                                                            borderRadius: '10px', 
                                                            px: 1,
                                                            height: 32,
                                                            bgcolor: currentStatus.color === 'primary' ? 'primary.main' : undefined,
                                                            boxShadow: currentStatus.color !== 'default' ? `0 4px 12px ${theme.palette[currentStatus.color || 'primary'].main}44` : 'none'
                                                        }}
                                                    />
                                                    <Button 
                                                        component={RouterLink} 
                                                        to={`/track-order?id=${order.id}`}
                                                        endIcon={<ChevronRightIcon />}
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            textTransform: 'none',
                                                            borderRadius: '12px'
                                                        }}
                                                    >
                                                        Track Journey
                                                    </Button>
                                                </Box>
                                            </Box>

                                            <Box sx={{ p: 4 }}>
                                                <Grid container spacing={4}>
                                                    {/* Items Summary */}
                                                    <Grid item xs={12} md={7}>
                                                        <Typography variant="overline" sx={{ fontWeight: 900, opacity: 0.4, mb: 2, display: 'block', letterSpacing: 2 }}>
                                                            ORDER ITEMS ({order.items?.length})
                                                        </Typography>
                                                        <Stack spacing={2.5}>
                                                            {order.items?.map((item, i) => (
                                                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                                                    <Avatar 
                                                                        src={getPublicUrl(item.product?.image_url)} 
                                                                        variant="rounded" 
                                                                        sx={{ width: 60, height: 60, borderRadius: '14px', border: '1px solid divider' }} 
                                                                    />
                                                                    <Box sx={{ flex: 1 }}>
                                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{item.product?.name}</Typography>
                                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                                            Quantity: {item.quantity} • ₹{(item.price || 0).toFixed(0)} each
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography variant="body1" sx={{ fontWeight: 800 }}>₹{((item.price || 0) * item.quantity).toFixed(0)}</Typography>
                                                                </Box>
                                                            ))}
                                                        </Stack>
                                                    </Grid>

                                                    {/* Details Sidebar */}
                                                    <Grid item xs={12} md={5}>
                                                        <Box sx={{ 
                                                            p: 3, 
                                                            borderRadius: '24px', 
                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column'
                                                        }}>
                                                            <Stack spacing={2.5} sx={{ mb: 4 }}>
                                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                                    <LocationOnIcon sx={{ color: 'primary.main', fontSize: '1.4rem', opacity: 0.6 }} />
                                                                    <Box>
                                                                        <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.4, display: 'block' }}>DELIVERY ADDRESS</Typography>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 300 }}>{order.shipping_address}</Typography>
                                                                    </Box>
                                                                </Box>

                                                                {order.tracking_id && (
                                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                                        <LocalShippingIcon sx={{ color: 'primary.main', fontSize: '1.4rem', opacity: 0.6 }} />
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.4, display: 'block' }}>TRACKING INFO</Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{order.courier_partner}: {order.tracking_id}</Typography>
                                                                        </Box>
                                                                    </Box>
                                                                )}
                                                            </Stack>

                                                            <Box sx={{ mt: 'auto' }}>
                                                                <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Typography sx={{ fontWeight: 700, opacity: 0.6 }}>Total Amount</Typography>
                                                                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{(order.total_price || 0).toFixed(0)}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </AnimatePresence>
                </Grid>
            )}
        </Container>
    );
};

export default MyOrders;
