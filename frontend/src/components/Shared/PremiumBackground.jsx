import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const ROUTE_COLORS = {
    '/': { primary: '#6C63FF', secondary: '#9C4DFF', accent: '#7B61FF' },
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

    // Faster, responsive spring for quicker user feedback
    const smoothScroll = useSpring(scrollYProgress, {
        stiffness: 40, // Increased for faster response
        damping: 20,   // Balanced for snappy but smooth feel
        restDelta: 0.001
    });

    // Flow Parallax - ACTIVE only on non-customizer pages
    const flow1X = useTransform(smoothScroll, [0, 1], ['0%', isCustomizer ? '0%' : '30%']);
    const flow1Y = useTransform(smoothScroll, [0, 1], ['0%', isCustomizer ? '0%' : '50%']);
    const flow2X = useTransform(smoothScroll, [0, 1], ['0%', isCustomizer ? '0%' : '-25%']);
    const flow2Y = useTransform(smoothScroll, [0, 1], ['0%', isCustomizer ? '0%' : '65%']);

    // Balanced blur for a "Smooth yet Visible" aesthetic
    const baseBlur = '60px'; 
    const highBlur = '80px';

    return (
        <Box 
            sx={{ 
                position: 'fixed', 
                top: 0, left: 0, 
                width: '100vw', height: '100vh', 
                zIndex: 0, 
                pointerEvents: 'none',
                overflow: 'hidden',
                bgcolor: '#020617',
                transition: 'background-color 2s ease' // Slower, smoother transitions
            }}
        >
            {/* Background Texture Layers */}
            <Box 
                sx={{ 
                    position: 'absolute', 
                    inset: 0, 
                    opacity: 0.05, 
                    zIndex: 2,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3Detected%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }} 
            />

            {/* SMOOTH COLOR CHANGE EFFECT */}
            
            {/* Orb 1 - Increased opacity for visibility */}
            <motion.div
                animate={{ 
                    backgroundColor: colors.primary,
                    filter: [`blur(${baseBlur})`, `blur(${highBlur})`, `blur(${baseBlur})`],
                }}
                transition={{ 
                    backgroundColor: { duration: 2 }, // Longer, smoother color shifts
                    filter: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                    position: 'absolute',
                    top: '-15%', left: '-10%',
                    width: '90vw', height: '90vw', // Slightly larger for better "presence"
                    borderRadius: '50%',
                    opacity: isCustomizer ? 0.08 : 0.18, 
                    x: flow1X,
                    y: flow1Y,
                }}
            />

            {/* Orb 2 */}
            <motion.div
                animate={{ 
                    backgroundColor: colors.secondary,
                    scale: isCustomizer ? 1 : [1, 1.15, 1],
                }}
                transition={{ 
                    backgroundColor: { duration: 2 },
                    scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                    position: 'absolute',
                    bottom: '-10%', right: '-15%',
                    width: '80vw', height: '80vw',
                    borderRadius: '50%',
                    opacity: isCustomizer ? 0.06 : 0.15,
                    filter: `blur(${baseBlur})`,
                    x: flow2X,
                    y: flow2Y,
                }}
            />

            {/* Central Glow Wash - Persistent smooth color shift */}
            <motion.div 
                animate={{ 
                    background: `radial-gradient(circle at 50% 50%, ${colors.primary}15 0%, transparent 80%)` 
                }}
                transition={{ duration: 1.5 }}
                style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    zIndex: 1 
                }} 
            />

            {/* Subtle Grid */}
            <Box 
                sx={{ 
                    position: 'absolute', 
                    inset: 0, 
                    opacity: 0.06,
                    zIndex: 2,
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 0)',
                    backgroundSize: '80px 80px',
                    maskImage: 'linear-gradient(to bottom, black, transparent)',
                }} 
            />
        </Box>
    );
};

export default PremiumBackground;
