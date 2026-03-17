import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
const Home = React.lazy(() => import('./pages/Home'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Profile = React.lazy(() => import('./pages/Profile'));
const OrderTracking = React.lazy(() => import('./pages/OrderTracking'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const ManageProducts = React.lazy(() => import('./pages/admin/ManageProducts'));
const ManageOrders = React.lazy(() => import('./pages/admin/ManageOrders'));
const ProductCustomizerPage = React.lazy(() => import('./pages/ProductCustomizerPage'));
const MugCustomizerPage = React.lazy(() => import('./pages/MugCustomizerPage'));
const FrameCustomizerPage = React.lazy(() => import('./pages/FrameCustomizerPage'));
const GiftBoxCustomizerPage = React.lazy(() => import('./pages/GiftBoxCustomizerPage'));
const ChocolateHamperPage = React.lazy(() => import('./pages/ChocolateHamperPage'));
const Shop = React.lazy(() => import('./pages/Shop'));
const MyOrders = React.lazy(() => import('./pages/MyOrders'));
const AdminChat = React.lazy(() => import('./pages/admin/AdminChat'));

import ChatWidget from './components/Shared/ChatWidget';
import { useAuth } from './store/AuthContext';
import { useThemeMode } from './store/ThemeContext';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/Shared/PageTransition';
import ErrorBoundary from './components/Shared/ErrorBoundary';
import PremiumBackground from './components/Shared/PremiumBackground';

const LoadingFallback = () => (
    <Box sx={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '60vh', background: 'transparent' 
    }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(124, 58, 237, 0.1)', borderTopColor: '#7C3AED', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Box>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, token } = useAuth();
    if (!token) return <Navigate to="/login" />;
    if (adminOnly && user?.role !== 'admin') return <Navigate to="/" />;
    return children;
};

function App() {
    const { mode } = useThemeMode();
    const location = useLocation();
    const navigate = useNavigate();
    
    const isFrameCustomizer = location.pathname.startsWith('/customize/frame');
    const isGiftBoxCustomizer = location.pathname.startsWith('/customize/giftbox');
    const isHamperCustomizer = location.pathname.startsWith('/customize/hamper');
    const isMugCustomizer = location.pathname.startsWith('/customize/mug');
    const isGenericCustomizer = location.pathname.startsWith('/customize/') && !isFrameCustomizer && !isGiftBoxCustomizer && !isHamperCustomizer && !isMugCustomizer;
    const isFullscreen = isFrameCustomizer || isGiftBoxCustomizer || isHamperCustomizer || isMugCustomizer || isGenericCustomizer;
    const isHome = location.pathname === '/';
    
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh', 
            overflowX: 'hidden',
            position: 'relative',
            background: mode === 'dark' 
                ? '#020617'
                : '#f8fafc',
        }}>



            <PremiumBackground />

            <Navbar />
            <Box sx={{ flexGrow: 1, pt: { xs: 8, md: 12 }, pb: isFullscreen ? 0 : 4, position: 'relative', zIndex: 1 }}>
                <ErrorBoundary>
                    <AnimatePresence mode="wait">
                        <React.Suspense fallback={<LoadingFallback />}>
                            <Routes location={location} key={location.pathname}>
                                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                                <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
                                <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
                                <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
                                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                                <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                                <Route path="/customize/:id/:cartItemId?" element={<PageTransition><ProductCustomizerPage /></PageTransition>} />
                                <Route path="/customize/mug/:id/:cartItemId?" element={<PageTransition><MugCustomizerPage /></PageTransition>} />
                                <Route path="/customize/frame/:id/:cartItemId?" element={<PageTransition><FrameCustomizerPage /></PageTransition>} />
                                <Route path="/customize/giftbox/:id/:cartItemId?" element={<PageTransition><GiftBoxCustomizerPage /></PageTransition>} />
                                <Route path="/customize/hamper/:id/:cartItemId?" element={<PageTransition><ChocolateHamperPage /></PageTransition>} />

                                <Route path="/hampers" element={<Navigate to="/shop?category=hampers" replace />} />
                                <Route path="/chocolate-hamper" element={<Navigate to="/shop?category=hampers" replace />} />
                                <Route path="/categories/frames" element={<Navigate to="/shop?category=frames" replace />} />
                                <Route path="/categories/mugs" element={<Navigate to="/shop?category=mugs" replace />} />
                                <Route path="/categories/hampers" element={<Navigate to="/shop?category=hampers" replace />} />
                                <Route path="/categories/giftbox" element={<Navigate to="/shop?category=gifts" replace />} />
                                <Route path="/categories/:id" element={<Navigate to="/shop" replace />} />
                                <Route path="/checkout" element={
                                    <ProtectedRoute><PageTransition><Checkout /></PageTransition></ProtectedRoute>
                                } />
                                <Route path="/profile" element={
                                    <ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>
                                } />
                                <Route path="/orders" element={
                                    <ProtectedRoute><PageTransition><MyOrders /></PageTransition></ProtectedRoute>
                                } />
                                <Route path="/track-order" element={
                                    <ProtectedRoute><PageTransition><OrderTracking /></PageTransition></ProtectedRoute>
                                } />

                                {/* Admin Routes */}
                                <Route path="/admin" element={
                                    <ProtectedRoute adminOnly><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>
                                } />
                                <Route path="/admin/products" element={
                                    <ProtectedRoute adminOnly><PageTransition><ManageProducts /></PageTransition></ProtectedRoute>
                                } />
                                <Route path="/admin/orders" element={
                                    <ProtectedRoute adminOnly><PageTransition><ManageOrders /></PageTransition></ProtectedRoute>
                                } />
                                <Route path="/admin/chat" element={
                                    <ProtectedRoute adminOnly><PageTransition><AdminChat /></PageTransition></ProtectedRoute>
                                } />
                            </Routes>
                        </React.Suspense>
                    </AnimatePresence>
                </ErrorBoundary>
            </Box>
            {!isFullscreen && <Footer />}
            <ChatWidget />
        </Box>
    );
}

export default App;
