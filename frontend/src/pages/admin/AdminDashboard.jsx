import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Paper, Box, Button, Chip,
    Table, TableBody, TableCell, TableHead, TableRow, Avatar, TableContainer,
    IconButton, Tooltip, Card, CardContent
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrders, ORDER_STATUSES } from '../../store/OrderContext';
import { useAuth } from '../../store/AuthContext';
import api, { getPublicUrl } from '../../api/axios';

const STATUS_COLOR_MAP = {
    placed: 'info',
    processing: 'warning',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error',
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { fetchAllOrders } = useOrders();
    const { user } = useAuth();
    const [recentOrders, setRecentOrders] = useState([]);
    const [statsData, setStatsData] = useState({
        total_revenue: 0,
        total_orders: 0,
        total_products: 0,
        pending_orders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    api.get('/admin/dashboard-stats'),
                    fetchAllOrders(1, 5)
                ]);
                setStatsData(statsRes.data);
                if (ordersRes && ordersRes.items) {
                    setRecentOrders(ordersRes.items);
                } else {
                    setRecentOrders([]);
                }
            } catch (err) {
                console.error("Dashboard load failed", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    useEffect(() => {
        if (!loading && user && user.role !== 'admin') {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const stats = [
        { label: 'Total Revenue', value: `₹${parseFloat(statsData.total_revenue).toLocaleString()}`, icon: <MonetizationOnIcon sx={{ fontSize: 32 }} />, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        { label: 'Total Orders', value: statsData.total_orders, icon: <ShoppingBasketIcon sx={{ fontSize: 32 }} />, color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
        { label: 'Total Products', value: statsData.total_products, icon: <InventoryIcon sx={{ fontSize: 32 }} />, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        { label: 'Pending Orders', value: statsData.pending_orders, icon: <PendingActionsIcon sx={{ fontSize: 32 }} />, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    ];

    const quickActions = [
        { label: 'Add Product', icon: <AddCircleOutlineIcon />, onClick: () => navigate('/admin/products'), color: 'primary' },
        { label: 'Manage Orders', icon: <ShoppingBasketIcon />, onClick: () => navigate('/admin/orders'), color: 'secondary' },
        { label: 'Customer Chat', icon: <ChatIcon />, onClick: () => navigate('/admin/chat'), color: 'info' },
        { label: 'User Management', icon: <PeopleIcon />, onClick: () => navigate('/admin/users'), color: 'success' },
    ];

    if (loading) return (
        <Container sx={{ py: 8, textAlign: 'center' }}>
            <motion.div animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ repeat: Infinity, duration: 2 }}>
                <AssessmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            </motion.div>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Loading Dashboard...</Typography>
        </Container>
    );

    return (
        <Container maxWidth="xl" sx={{ pb: 8, position: 'relative' }}>
            {/* 3D Floating Elements (Decorative) */}
            <Box sx={{
                position: 'fixed', top: '10%', right: '2%', width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                filter: 'blur(80px)', pointerEvents: 'none', zIndex: -1
            }} />

            {/* Welcome Banner — Premium Gradient & Glass */}
            <motion.div
                initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8 }}
            >
                <Paper sx={{ 
                    p: { xs: 3, md: 5 }, 
                    mb: 5, 
                    borderRadius: '32px', 
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    backdropFilter: 'blur(20px)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="h1" sx={{ 
                            fontWeight: 900, 
                            mb: 1, 
                            fontSize: { xs: '2rem', md: '3.5rem' },
                            background: 'linear-gradient(to right, #fff, #94a3b8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-2px'
                        }}>
                            Dashboard Overview
                        </Typography>
                        <Typography variant="h5" sx={{ opacity: 0.7, mb: 4, fontWeight: 500, maxWidth: '600px' }}>
                            Welcome back, {user?.name || 'Admin'}. Here is what's happening in your store today.
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={auto}>
                                <Button 
                                    variant="contained" 
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={() => navigate('/admin/products')}
                                    sx={{ 
                                        bgcolor: '#6366f1', 
                                        '&:hover': { bgcolor: '#4f46e5' },
                                        px: 4, py: 1.5,
                                        borderRadius: '16px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    New Product
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={auto}>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<ShoppingBasketIcon />}
                                    onClick={() => navigate('/admin/orders')}
                                    sx={{ 
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
                                        px: 4, py: 1.5,
                                        borderRadius: '16px',
                                        textTransform: 'none',
                                        fontWeight: 700
                                    }}
                                >
                                    Recent Orders
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                    {/* Decorative Blob */}
                    <Box sx={{
                        position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
                        filter: 'blur(60px)', zIndex: 0
                    }} />
                </Paper>
            </motion.div>

            {/* Stats Grid — 3D Tilt Cards */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {stats.map((stat, i) => (
                    <Grid item xs={12} sm={6} md={3} key={stat.label}>
                        <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{ height: '100%' }}
                        >
                            <Card sx={{ 
                                height: '100%',
                                borderRadius: '24px', 
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    border: `1px solid ${stat.color}40`,
                                    boxShadow: `0 20px 40px ${stat.color}15`
                                }
                            }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ 
                                        p: 1.5, 
                                        width: 'fit-content',
                                        borderRadius: '16px', 
                                        background: stat.gradient,
                                        color: 'white',
                                        mb: 3,
                                        boxShadow: `0 8px 16px ${stat.color}30`
                                    }}>
                                        {stat.icon}
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: '2rem', color: 'white' }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        {stat.label}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                {/* Recent Orders Section — Premium Table */}
                <Grid item xs={12} lg={8}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                            Recent Transactions
                        </Typography>
                    </Box>
                    <TableContainer component={Paper} sx={{ 
                        borderRadius: '24px', 
                        background: 'rgba(15, 23, 42, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: 'none',
                        overflow: 'hidden'
                    }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Order ID</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Customer</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Date</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Amount</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentOrders.map((order) => {
                                    const statusObj = ORDER_STATUSES.find(s => s.key === order.status) || { label: order.status };
                                    return (
                                        <TableRow key={order.id} hover sx={{ 
                                            transition: 'background 0.2s',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                                            '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)' }
                                        }}>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#6366f1' }}>
                                                    #{order.id.toString().slice(-6).toUpperCase()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#4f46e5' }}>
                                                        {order.user?.name?.charAt(0) || 'G'}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                                                        {order.user?.name || 'Guest'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>
                                                {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: 'white' }}>
                                                ₹{parseFloat(order.total_price).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={statusObj.label}
                                                    sx={{ 
                                                        fontWeight: 800, 
                                                        borderRadius: '8px',
                                                        fontSize: '0.7rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        bgcolor: `${STATUS_COLOR_MAP[order.status] === 'success' ? '#10b98120' : '#6366f120'}`,
                                                        color: STATUS_COLOR_MAP[order.status] === 'success' ? '#10b981' : '#818cf8',
                                                        border: `1px solid ${STATUS_COLOR_MAP[order.status] === 'success' ? '#10b98140' : '#818cf840'}`
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Quick Actions & Insights */}
                <Grid item xs={12} lg={4}>
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: 'white' }}>Quick Actions</Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {quickActions.map((action, i) => (
                            <Grid item xs={6} key={i}>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={action.onClick}
                                        sx={{
                                            py: 2.5,
                                            borderRadius: '20px',
                                            flexDirection: 'column',
                                            gap: 1.5,
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            '&:hover': { 
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                background: 'rgba(255,255,255,0.05)'
                                            }
                                        }}
                                    >
                                        {React.cloneElement(action.icon, { sx: { fontSize: 32, color: '#6366f1' } })}
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{action.label}</Typography>
                                    </Button>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>

                    <Paper sx={{ 
                        p: 4, 
                        borderRadius: '24px', 
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: 'white',
                        boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Store Intelligence</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                                Your store traffic is up 15% this week. Consider adding more "Custom Photo Frames" to capitalize on the trend.
                            </Typography>
                            <Button 
                                variant="contained" 
                                fullWidth
                                sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.2)', 
                                    color: 'white',
                                    fontWeight: 700,
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                }}
                            >
                                View Analytics
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;
