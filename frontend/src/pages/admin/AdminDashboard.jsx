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
import api from '../../api/axios';

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
        <Container maxWidth="xl" sx={{ pb: 8 }}>
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ 
                    duration: 0.7, 
                    ease: [0.34, 1.56, 0.64, 1] // Satisfying liquid zoom
                }}
            >
                <Paper sx={{ 
                    p: 2, 
                    mb: 3, 
                    borderRadius: '16px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1.2rem' }}>
                        Welcome back, {user?.name || 'Admin'}!
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                        Here's your store overview.
                    </Typography>
                    
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Button 
                                fullWidth
                                variant="contained" 
                                startIcon={<AddCircleOutlineIcon fontSize="small" />}
                                onClick={() => navigate('/admin/products')}
                                sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.1)', 
                                    height: '40px',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}
                            >
                                Add Product
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button 
                                fullWidth
                                variant="contained" 
                                startIcon={<ShoppingBasketIcon fontSize="small" />}
                                sx={{ 
                                    bgcolor: '#6C63FF', 
                                    height: '40px',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}
                                onClick={() => navigate('/admin/orders')}
                            >
                                Orders
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </motion.div>

            {/* Stats Grid */}
            <Grid container spacing={1.5} sx={{ mb: 4 }}>
                {stats.map((stat, i) => (
                    <Grid item xs={6} md={3} key={stat.label}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card sx={{ 
                                borderRadius: '12px', 
                                bgcolor: 'rgba(18, 26, 47, 0.6)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                overflow: 'hidden'
                            }}>
                                <CardContent sx={{ p: '12px !important' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                                        <Box sx={{ 
                                            p: 1, 
                                            borderRadius: '8px', 
                                            bgcolor: `${stat.color}15`, 
                                            color: stat.color,
                                            display: 'flex'
                                        }}>
                                            {React.cloneElement(stat.icon, { sx: { fontSize: 20 } })}
                                        </Box>
                                        <Typography variant="h3" sx={{ fontWeight: 800, fontSize: '1.2rem' }}>
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                                        {stat.label}
                                    </Typography>
                                </CardContent>
                                <Box sx={{ height: 3, bgcolor: stat.color, opacity: 0.8 }} />
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                {/* Recent Orders Section */}
                <Grid item xs={12} lg={8}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <ShoppingBasketIcon color="primary" /> Recent Orders
                        </Typography>
                        <Button 
                            endIcon={<ArrowForwardIcon />} 
                            onClick={() => navigate('/admin/orders')}
                            sx={{ fontWeight: 600 }}
                        >
                            View All Orders
                        </Button>
                    </Box>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 25px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                        <Table sx={{ minWidth: { xs: 600, md: '100%'} }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentOrders.map((order) => {
                                    const statusObj = ORDER_STATUSES.find(s => s.key === order.status) || { label: order.status };
                                    return (
                                        <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 700 }}>
                                                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 800 }}>
                                                    #{order.id.toString().slice(-6)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.light' }}>
                                                        {order.user?.name?.charAt(0) || 'G'}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {order.user?.name || 'Guest'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {order.items?.slice(0, 3).map((item, i) => (
                                                        <Tooltip key={i} title={item.product?.name}>
                                                            <Avatar 
                                                                src={getPublicUrl(item.product?.image_url)} 
                                                                variant="rounded" 
                                                                sx={{ width: 32, height: 32, border: '1px solid #eee' }} 
                                                            />
                                                        </Tooltip>
                                                    ))}
                                                    {order.items?.length > 3 && (
                                                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.7rem', bgcolor: 'action.selected' }}>
                                                            +{order.items.length - 3}
                                                        </Avatar>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>
                                                ₹{parseFloat(order.total_price).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={statusObj.label}
                                                    color={statusObj.color || STATUS_COLOR_MAP[order.status] || 'default'}
                                                    size="small"
                                                    sx={{ 
                                                        fontWeight: 700, 
                                                        borderRadius: 2,
                                                        textTransform: 'capitalize'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={() => navigate('/admin/orders')}
                                                    sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                                                >
                                                    <ArrowForwardIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {recentOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No recent orders found</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Quick Actions & Tips */}
                <Grid item xs={12} lg={4}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h3" sx={{ mb: 2 }}>Quick Actions</Typography>
                        <Grid container spacing={1.5}>
                            {quickActions.map((action, i) => (
                                <Grid item xs={6} key={i}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color={action.color}
                                        onClick={action.onClick}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: '12px',
                                            flexDirection: 'column',
                                            gap: 0.5,
                                            borderWidth: 1,
                                            bgcolor: 'rgba(18, 26, 47, 0.4)',
                                            '&:hover': { borderWidth: 1, bgcolor: `${action.color}.main`, color: 'white' },
                                            '.MuiButton-startIcon': { display: 'none' } // Hide default startIcon
                                        }}
                                    >
                                        {React.cloneElement(action.icon, { sx: { fontSize: 24, mb: 0.5 } })}
                                        <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{action.label}</Typography>
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Paper sx={{ p: 4, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Store Insights</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                            Your store traffic is up 15% this week. Consider adding more "Custom Photo Frames" to capitalize on the trend.
                        </Typography>
                        <Button 
                            variant="contained" 
                            fullWidth
                            sx={{ 
                                bgcolor: 'white', 
                                color: 'primary.main',
                                fontWeight: 700,
                                borderRadius: 3,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                            }}
                        >
                            View All Analytics
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;
