import React from 'react';
import {
    AppBar, Toolbar, Typography, Button, Container,
    IconButton, Badge, Box, Tooltip, Divider, Drawer, List, ListItem, ListItemText, ListItemIcon, Stack
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChatIcon from '@mui/icons-material/Chat';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { useThemeMode } from '../store/ThemeContext';

import { useCart } from '../store/CartContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const { mode, toggleTheme } = useThemeMode();
    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === '/';
    const isCustomizing = location.pathname.includes('/customize/');
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isDark = mode === 'dark';
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Dynamic Sizing based on page for the smooth transition
    const navSize = isHome ? { 
        py: 2.5, 
        px: 5, 
        width: '96%',
        maxWidth: '1300px'
    } : (isCustomizing ? {
        py: 1,
        px: 3,
        width: '90%',
        maxWidth: '1100px'
    } : {
        py: 1.5,
        px: 4,
        width: '93%',
        maxWidth: '1200px'
    });

    return (
        <AppBar 
            position={isCustomizing ? "absolute" : "fixed"} 
            elevation={0} 
            sx={{ 
                top: isCustomizing ? 0 : (isScrolled ? 10 : 20), 
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2000, 
                width: isCustomizing ? '100%' : { xs: 'calc(100% - 32px)', md: isScrolled ? '85%' : navSize.width },
                maxWidth: isCustomizing ? '100%' : { md: isScrolled ? '1000px' : navSize.maxWidth },
                borderRadius: isCustomizing ? '0 0 24px 24px' : '100px',
                transition: 'all 400ms cubic-bezier(0.22, 1, 0.36, 1)',
                background: isScrolled 
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(59, 7, 100, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(59, 7, 100, 0.95) 100%)',
                backdropFilter: isScrolled ? 'blur(4px)' : 'blur(12px)',
                WebkitBackdropFilter: isScrolled ? 'blur(4px)' : 'blur(12px)',
                border: isCustomizing ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                borderBottom: isCustomizing ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
                opacity: isScrolled ? 0.85 : 1,
                boxShadow: isScrolled 
                    ? '0 4px 20px rgba(0,0,0,0.2)'
                    : (isCustomizing ? '0 4px 20px rgba(0,0,0,0.4)' : '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05)'),
                overflow: 'hidden',
                '&:hover': {
                    opacity: 1,
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(59, 7, 100, 0.95) 100%)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: isCustomizing ? '0 6px 25px rgba(0,0,0,0.5)' : '0 15px 50px -10px rgba(0, 0, 0, 0.6)',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                }
            }}
        >
            <Container maxWidth={false}>
                <Toolbar 
                    disableGutters 
                    sx={{ 
                        justifyContent: 'space-between', 
                        minHeight: { xs: 60, md: isScrolled ? 60 : (isHome ? 80 : 70) },
                        px: { xs: 2, md: isScrolled ? 3 : navSize.px },
                        transition: 'all 400ms ease'
                    }}
                >
                    {/* Left side: Logo or Back Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isCustomizing && (
                            <IconButton 
                                onClick={() => navigate(-1)} 
                                sx={{ 
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    mr: 1.5,
                                    width: 40,
                                    height: 40,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        transform: 'translateX(-4px)',
                                        boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <ArrowBackIcon fontSize="small" />
                            </IconButton>
                        )}
                        <Typography
                            variant="h5"
                            component={RouterLink}
                            to="/"
                            sx={{
                                textDecoration: 'none',
                                color: 'white',
                                fontWeight: 900,
                                fontSize: { xs: '1.2rem', md: isScrolled ? '1.4rem' : (isHome ? '1.9rem' : '1.6rem') },
                                letterSpacing: '-0.04em',
                                background: 'linear-gradient(135deg, #fff 30%, #ec4899 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                transition: 'all 400ms ease',
                                '&:hover': {
                                    opacity: 0.9,
                                    transform: 'scale(1.02)'
                                }
                            }}
                        >
                            ARTEXA
                        </Typography>
                    </Box>

                    {/* Center Navigation links */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
                        {[
                            { name: 'Home', path: '/' },
                            { name: 'Shop', path: '/shop' },
                            { name: 'My Orders', path: '/orders' },
                            ...(user?.role === 'admin' ? [{ name: 'Dashboard', path: '/admin' }] : [])
                        ].map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Button
                                    key={item.name}
                                    component={RouterLink}
                                    to={item.path}
                                    sx={{
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        px: 2.5,
                                        py: 1,
                                        borderRadius: '100px',
                                        opacity: isActive ? 1 : 0.6,
                                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                                        transition: 'all 0.3s ease',
                                        textTransform: 'none',
                                        '&:hover': { 
                                            opacity: 1,
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            transform: 'translateY(-1px)'
                                        }
                                    }}
                                >
                                    {item.name}
                                </Button>
                            );
                        })}
                    </Box>

                    {/* Right side icons */}
                    <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, alignItems: 'center' }}>
                        <IconButton sx={{ color: 'white', display: { xs: 'none', sm: 'flex' }, opacity: 0.8, '&:hover': { opacity: 1 } }}>
                            <SearchIcon fontSize="small" />
                        </IconButton>

                        <IconButton 
                            component={RouterLink} 
                            to="/cart" 
                            sx={{ 
                                color: 'white',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.1)' }
                            }}
                        >
                            <Badge 
                                badgeContent={cartCount} 
                                sx={{ 
                                    '& .MuiBadge-badge': { 
                                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                        color: 'white',
                                        fontWeight: 900,
                                        fontSize: '0.65rem',
                                        minWidth: 18,
                                        height: 18,
                                        border: '2px solid #3b0764'
                                    } 
                                }}
                            >
                                <ShoppingCartIcon fontSize="small" />
                            </Badge>
                        </IconButton>

                        <IconButton onClick={toggleTheme} sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={mode}
                                    initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                    exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isDark ? <LightModeIcon sx={{ color: '#fbbf24' }} /> : <DarkModeIcon />}
                                </motion.div>
                            </AnimatePresence>
                        </IconButton>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto', borderColor: 'rgba(255,255,255,0.1)' }} />

                        {user ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                                <IconButton 
                                    component={RouterLink} 
                                    to="/profile"
                                    sx={{ 
                                        color: 'white',
                                        p: 0.5,
                                        border: '2px solid rgba(255,255,255,0.1)',
                                        '&:hover': { 
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            borderColor: 'rgba(255,255,255,0.3)',
                                            transform: 'scale(1.05)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <AccountCircleIcon />
                                </IconButton>
                            </Box>
                        ) : (
                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="contained"
                                sx={{
                                    borderRadius: '100px',
                                    bgcolor: '#7c3aed',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    '&:hover': { 
                                        bgcolor: '#6d28d9',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
                                    },
                                    fontWeight: 800,
                                    px: 2.5,
                                    py: 0.6,
                                    display: { xs: 'none', sm: 'flex' },
                                    transition: 'all 0.2s ease',
                                    textTransform: 'none'
                                }}
                            >
                                Join ARTEXA
                            </Button>
                        )}
                        
                        <IconButton
                            onClick={toggleMobileMenu}
                            sx={{ display: { md: 'none' }, color: 'white', ml: 1 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </Container>

            {/* Mobile Drawer remains similar but with updated colors */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={toggleMobileMenu}
                PaperProps={{
                    sx: {
                        width: 280,
                        background: '#0f172a',
                        color: 'white',
                        p: 2
                    }
                }}
            >
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>
                        ARTEXA
                    </Typography>
                    <IconButton onClick={toggleMobileMenu} sx={{ color: 'white' }}>
                        <ArrowBackIcon />
                    </IconButton>
                </Box>
                <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
                    {[
                        { name: 'Home', path: '/', icon: <HomeIcon /> },
                        { name: 'Shop', path: '/shop', icon: <StoreIcon /> },
                        { name: 'My Orders', path: '/orders', icon: <ReceiptLongIcon /> },
                        ...(user?.role === 'admin' ? [{ name: 'Admin Dashboard', path: '/admin', icon: <AdminPanelSettingsIcon /> }] : [])
                    ].map((item) => (
                        <ListItem 
                            key={item.name} 
                            component={RouterLink} 
                            to={item.path} 
                            onClick={toggleMobileMenu}
                            sx={{ 
                                borderRadius: '12px',
                                background: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: 'white',
                                '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.name} primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ mt: 'auto', p: 2 }}>
                    {user ? (
                        <Button fullWidth onClick={handleLogout} variant="outlined" color="error" sx={{ borderRadius: '12px' }}>
                            Logout
                        </Button>
                    ) : (
                        <Button fullWidth component={RouterLink} to="/login" variant="contained" sx={{ borderRadius: '12px', bgcolor: '#7c3aed' }}>
                            Login
                        </Button>
                    )}
                </Box>
            </Drawer>
        </AppBar>
    );
};

export default Navbar;
