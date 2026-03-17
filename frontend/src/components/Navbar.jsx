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
                    borderRadius: '20px',
                    zIndex: 2000,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isScrolled
                        ? 'rgba(8, 12, 24, 0.85)'
                        : 'rgba(15, 22, 40, 0.65)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isScrolled
                        ? '0 10px 40px rgba(0,0,0,0.5)'
                        : '0 8px 32px rgba(0,0,0,0.2)',
                }}
            >
                <Toolbar disableGutters sx={{ px: { xs: 2, md: 4 }, minHeight: { xs: '60px !important', md: '70px !important' }, justifyContent: 'space-between' }}>

                    {/* Logo */}
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            textDecoration: 'none',
                            fontWeight: 900,
                            fontSize: { xs: '1.2rem', md: '1.6rem' },
                            letterSpacing: '-0.04em',
                            background: 'linear-gradient(135deg, #fff 30%, #a78bfa 100%)',
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
                        gap: 1,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        px: 1, py: 0.5,
                        borderRadius: '100px',
                        border: '1px solid rgba(255,255,255,0.05)'
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
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.9rem',
                                        px: 2.5,
                                        borderRadius: '100px',
                                        opacity: isActive ? 1 : 0.7,
                                        bgcolor: isActive ? 'rgba(108, 99, 255, 0.2)' : 'transparent',
                                        textTransform: 'none',
                                        transition: 'all 0.3s',
                                        '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.08)' }
                                    }}
                                >
                                    {item.name}
                                </Button>
                            );
                        })}
                    </Box>

                    {/* Right: Cart + Menu/Profile */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
                        {/* Desktop Search or similar can go here */}
                        
                        {/* Cart */}
                        <IconButton
                            component={RouterLink}
                            to="/cart"
                            sx={{ 
                                color: 'white', 
                                width: 44, height: 44, 
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', transform: 'scale(1.05)' } 
                            }}
                        >
                            <Badge
                                badgeContent={cartCount}
                                sx={{ 
                                    '& .MuiBadge-badge': { 
                                        background: 'linear-gradient(135deg,#6C63FF,#9C4DFF)', 
                                        color: '#fff', 
                                        fontWeight: 800, 
                                        fontSize: '10px', 
                                        minWidth: 18, height: 18, 
                                        border: '2px solid #0a0f1e',
                                        boxShadow: '0 0 10px rgba(108, 99, 255, 0.5)'
                                    } 
                                }}
                            >
                                <ShoppingCartIcon sx={{ fontSize: 22 }} />
                            </Badge>
                        </IconButton>

                        {/* Desktop Profile Icon */}
                        {user && (
                            <IconButton
                                component={RouterLink}
                                to="/profile"
                                sx={{ 
                                    display: { xs: 'none', md: 'flex' },
                                    color: 'white', 
                                    width: 44, height: 44,
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '14px', fontWeight: 700 }}>
                                    {(user.name || 'U')[0].toUpperCase()}
                                </Avatar>
                            </IconButton>
                        )}

                        {/* Hamburger — always visible on mobile, visible on desktop for extra menu */}
                        <IconButton
                            onClick={() => setDrawerOpen(true)}
                            sx={{ 
                                color: 'white', width: 44, height: 44, 
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } 
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
                        width: 280,
                        background: 'linear-gradient(160deg, #0f172a 0%, #1a0f3c 100%)',
                        color: 'white',
                        p: 0,
                        border: 'none',
                    }
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'white' }}>
                        ARTEXA
                    </Typography>
                    <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white', width: 36, height: 36 }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                {/* Profile block */}
                <Box sx={{ p: 2 }}>
                    {user ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'rgba(108,99,255,0.12)', borderRadius: '12px', border: '1px solid rgba(108,99,255,0.2)' }}>
                            <Avatar sx={{ bgcolor: '#6C63FF', width: 40, height: 40, fontWeight: 700, fontSize: '1rem' }}>
                                {(user.name || 'U')[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }} noWrap>
                                    {user.name || 'User'}
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to="/profile"
                                    onClick={() => setDrawerOpen(false)}
                                    sx={{ p: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)', minHeight: 0, '&:hover': { color: 'primary.main' } }}
                                >
                                    View Profile →
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
                            sx={{ borderRadius: '12px', height: '44px', background: 'linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%)', fontWeight: 700 }}
                        >
                            Login / Join Artexa
                        </Button>
                    )}
                </Box>

                {/* Nav links */}
                <List sx={{ px: 2, gap: 0.25, display: 'flex', flexDirection: 'column' }}>
                    {allLinks.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem
                                key={item.name}
                                component={RouterLink}
                                to={item.path}
                                onClick={() => setDrawerOpen(false)}
                                sx={{
                                    borderRadius: '12px',
                                    mb: 0.25,
                                    color: 'white',
                                    bgcolor: isActive ? 'rgba(108,99,255,0.15)' : 'transparent',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                    minHeight: '48px',
                                }}
                            >
                                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'rgba(255,255,255,0.5)', minWidth: 38 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.name}
                                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '14px' }}
                                />
                            </ListItem>
                        );
                    })}
                </List>

                {/* Bottom actions */}
                <Box sx={{ mt: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 0.5 }} />
                    {/* Theme toggle */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                            {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </Typography>
                        <IconButton onClick={toggleTheme} sx={{ color: 'white', width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                            {mode === 'dark' ? <LightModeIcon fontSize="small" sx={{ color: '#fbbf24' }} /> : <DarkModeIcon fontSize="small" />}
                        </IconButton>
                    </Box>

                    {user && (
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{ borderRadius: '12px', height: '44px', fontWeight: 600, borderColor: 'rgba(239,68,68,0.4)' }}
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
