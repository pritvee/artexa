import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const ROUTE_COLORS = {
    '/': { primary: '#6C63FF', secondary: '#FF4D9D', accent: '#FF7A59' }, // Purple, Pink, Orange
    '/shop': { primary: '#B066FE', secondary: '#6366f1', accent: '#818cf8' },
    '/cart': { primary: '#f43f5e', secondary: '#9C4DFF', accent: '#fb7185' },
    '/customize': { primary: '#4f46e5', secondary: '#7c3aed', accent: '#6366f1' },
    'default': { primary: '#6366f1', secondary: '#a855f7', accent: '#8b5cf6' }
};

const PremiumBackground = () => {
    const location = useLocation();
    const { scrollYProgress } = useScroll();
    
    // Detect if we are in a customizer (frame, mug, hamper, giftbox, or generic customize)
    const isCustomizer = useMemo(() => {
        return location.pathname.includes('/customize/');
    }, [location.pathname]);

    // Color selection logic
    const colors = useMemo(() => {
        const path = location.pathname;
        if (path === '/') return ROUTE_COLORS['/'];
        if (path.startsWith('/shop')) return ROUTE_COLORS['/shop'];
        if (path.startsWith('/cart')) return ROUTE_COLORS['/cart'];
        if (path.includes('/customize/')) return ROUTE_COLORS['/customize'];
        return ROUTE_COLORS['default'];
    }, [location.pathname]);

    // Smoother scroll for parallax
    const smoothScroll = useSpring(scrollYProgress, {
        stiffness: 70,
        damping: 30,
        restDelta: 0.001
    });

    // Parallax transforms
    const flow1X = useTransform(smoothScroll, [0, 1], ['0%', isCustomizer ? '0%' : '15%']);
    const flow1Y = useTransform(smoothScroll, [0, 1], ['0%', isCustomizer ? '0%' : '25%']);
    const flow2X = useTransform(smoothScroll, [0, 1], ['0%', isCustomizer ? '0%' : '-15%']);
    const flow2Y = useTransform(smoothScroll, [0, 1], ['0%', isCustomizer ? '0%' : '35%']);
    const flow3Y = useTransform(smoothScroll, [0, 1], ['0%', isCustomizer ? '0%' : '-20%']);

    return (
        <Box 
            sx={{ 
                position: 'fixed', 
                top: 0, left: 0, 
                width: '100vw', height: '100vh', 
                zIndex: 0, 
                pointerEvents: 'none',
                overflow: 'hidden',
                // Deep navy base
                background: '#05070d', 
            }}
        >
            {/* Dynamic Background Gradient */}
            <motion.div
                animate={{
                    background: [
                        `radial-gradient(circle at 0% 0%, ${colors.primary}25 0%, transparent 50%)`,
                        `radial-gradient(circle at 100% 100%, ${colors.secondary}25 0%, transparent 50%)`,
                        `radial-gradient(circle at 100% 0%, ${colors.accent}15 0%, transparent 50%)`,
                        `radial-gradient(circle at 0% 100%, ${colors.primary}20 0%, transparent 50%)`,
                        `radial-gradient(circle at 0% 0%, ${colors.primary}25 0%, transparent 50%)`,
                    ]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0
                }}
            />

            {/* Glowing Blobs */}
            
            {/* Blob 1 - Purple Glow */}
            <motion.div
                animate={{ 
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    top: '-10%', left: '-5%',
                    width: '60vw', height: '60vw',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
                    filter: 'blur(100px)',
                    x: flow1X,
                    y: flow1Y,
                    zIndex: 1
                }}
            />

            {/* Blob 2 - Pink Glow */}
            <motion.div
                animate={{ 
                    scale: [1, 1.3, 1],
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{
                    position: 'absolute',
                    bottom: '-15%', right: '-10%',
                    width: '70vw', height: '70vw',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
                    filter: 'blur(120px)',
                    x: flow2X,
                    y: flow2Y,
                    zIndex: 1
                }}
            />

            {/* Blob 3 - Orange/Accent Glow */}
            <motion.div
                animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.1, 0.25, 0.1]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                style={{
                    position: 'absolute',
                    top: '20%', right: '10%',
                    width: '40vw', height: '40vw',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`,
                    filter: 'blur(140px)',
                    y: flow3Y,
                    zIndex: 1
                }}
            />

            {/* Glass Blob - A sharp floating blurred shape */}
            <motion.div
                animate={{ 
                    y: [0, 40, 0],
                    rotate: [0, 10, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '15%',
                    width: '200px',
                    height: '200px',
                    borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 2,
                }}
            />

            {/* Noise Texture for that premium feel */}
            <Box 
                sx={{ 
                    position: 'absolute', 
                    inset: 0, 
                    opacity: 0.03,
                    zIndex: 5,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }} 
            />

            {/* Subtle Grid overlay */}
            <Box 
                sx={{ 
                    position: 'absolute', 
                    inset: 0, 
                    opacity: 0.1, 
                    zIndex: 2,
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '100px 100px',
                    maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
                }} 
            />
        </Box>
    );
};

export default PremiumBackground;
