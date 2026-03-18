import React from 'react';
import {
    AppBar, Toolbar, Typography, Button, Container,
    IconButton, Badge, Box, Drawer, List, ListItem,
    ListItemText, ListItemIcon, Stack, Avatar, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useThemeMode } from '../store/ThemeContext';
import { useCart } from '../store/CartContext';

const NAV_LINKS = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Shop', path: '/shop', icon: <StoreIcon /> },
    { name: 'My Orders', path: '/orders', icon: <ReceiptLongIcon /> },
];

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const { mode, toggleTheme } = useThemeMode();
    const navigate = useNavigate();
    const location = useLocation();

    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setDrawerOpen(false);
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const allLinks = [...NAV_LINKS, ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon /> }] : [])];

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    top: isScrolled ? 10 : 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: { xs: 'calc(100% - 32px)', md: isScrolled ? '85%' : '90%' },
                    maxWidth: '1400px',
                    borderRadius: '24px',
                    zIndex: 2000,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isScrolled
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(25px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isScrolled
                        ? '0 20px 40px rgba(0,0,0,0.4)'
                        : '0 8px 32px rgba(0,0,0,0.1)',
                }}
            >
                <Toolbar disableGutters sx={{ px: { xs: 2, md: 4 }, minHeight: { xs: '60px !important', md: '75px !important' }, justifyContent: 'space-between' }}>

                    {/* Logo */}
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            textDecoration: 'none',
                            fontWeight: 900,
                            fontSize: { xs: '1.3rem', md: '1.8rem' },
                            letterSpacing: '-0.05em',
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #6C63FF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        ARTEXA
                    </Typography>

                    {/* Desktop: center nav links */}
                    <Box sx={{ 
                        display: { xs: 'none', md: 'flex' }, 
                        gap: 1.5,
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        px: 1.5, py: 0.75,
                        borderRadius: '100px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        {NAV_LINKS.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Button
                                    key={item.name}
                                    component={RouterLink}
                                    to={item.path}
                                    sx={{
                                        color: 'white',
                                        fontWeight: isActive ? 800 : 500,
                                        fontSize: '0.95rem',
                                        px: 3,
                                        borderRadius: '100px',
                                        opacity: isActive ? 1 : 0.6,
                                        bgcolor: isActive ? 'rgba(108, 99, 255, 0.15)' : 'transparent',
                                        textTransform: 'none',
                                        transition: 'all 0.3s',
                                        '&:hover': { opacity: 1, bgcolor: 'rgba(255, 255, 255, 0.08)' }
                                    }}
                                >
                                    {item.name}
                                </Button>
                            );
                        })}
                    </Box>

                    {/* Right: Cart + Menu/Profile */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                        {/* Cart */}
                        <IconButton
                            component={RouterLink}
                            to="/cart"
                            sx={{ 
                                color: 'white', 
                                width: 48, height: 48, 
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', transform: 'scale(1.05)' } 
                            }}
                        >
                            <Badge
                                badgeContent={cartCount}
                                sx={{ 
                                    '& .MuiBadge-badge': { 
                                        background: 'linear-gradient(135deg, #6C63FF, #FF4D9D)', 
                                        color: '#fff', 
                                        fontWeight: 900, 
                                        fontSize: '11px', 
                                        minWidth: 20, height: 20, 
                                        border: '2px solid #05070A',
                                        boxShadow: '0 0 15px rgba(108, 99, 255, 0.5)'
                                    } 
                                }}
                            >
                                <ShoppingCartIcon sx={{ fontSize: 24 }} />
                            </Badge>
                        </IconButton>

                        {/* Hamburger */}
                        <IconButton
                            onClick={() => setDrawerOpen(true)}
                            sx={{ 
                                color: 'white', width: 48, height: 48, 
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } 
                            }}
                            aria-label="Open menu"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ─── Side Drawer ─── */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 320 },
                        background: 'rgba(5, 7, 13, 0.8)',
                        backdropFilter: 'blur(30px)',
                        color: 'white',
                        p: 0,
                        border: 'none',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.04em', color: 'white' }}>
                        ARTEXA
                    </Typography>
                    <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white', width: 40, height: 40, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* Profile block */}
                <Box sx={{ p: 3 }}>
                    {user ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(108, 99, 255, 0.1)', borderRadius: '20px', border: '1px solid rgba(108, 99, 255, 0.2)' }}>
                            <Avatar sx={{ 
                                background: 'linear-gradient(135deg, #6C63FF, #FF4D9D)', 
                                width: 48, height: 48, fontWeight: 900, fontSize: '1.1rem' 
                            }}>
                                {(user.name || 'U')[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="body1" sx={{ fontWeight: 800, color: 'white' }} noWrap>
                                    {user.name || 'User'}
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to="/profile"
                                    onClick={() => setDrawerOpen(false)}
                                    sx={{ p: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', minHeight: 0, '&:hover': { color: '#FF4D9D' } }}
                                >
                                    My Account →
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Button
                            fullWidth
                            component={RouterLink}
                            to="/login"
                            variant="contained"
                            onClick={() => setDrawerOpen(false)}
                            sx={{ 
                                borderRadius: '16px', height: '56px', 
                                background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)', 
                                fontWeight: 800, fontSize: '16px' 
                            }}
                        >
                            Sign In / Register
                        </Button>
                    )}
                </Box>

                {/* Nav links */}
                <List sx={{ px: 2, gap: 1, display: 'flex', flexDirection: 'column' }}>
                    {allLinks.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem
                                key={item.name}
                                component={RouterLink}
                                to={item.path}
                                onClick={() => setDrawerOpen(false)}
                                sx={{
                                    borderRadius: '16px',
                                    color: 'white',
                                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                    border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' },
                                    minHeight: '56px',
                                }}
                            >
                                <ListItemIcon sx={{ color: isActive ? '#6C63FF' : 'rgba(255, 255, 255, 0.4)', minWidth: 44 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.name}
                                    primaryTypographyProps={{ fontWeight: isActive ? 800 : 500, fontSize: '16px' }}
                                />
                            </ListItem>
                        );
                    })}
                </List>

                {/* Bottom actions */}
                <Box sx={{ mt: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    
                    {user && (
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{ borderRadius: '16px', height: '52px', fontWeight: 700, borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        >
                            Sign Out
                        </Button>
                    )}
                </Box>
            </Drawer>
        </>
    );
};

export default Navbar;
