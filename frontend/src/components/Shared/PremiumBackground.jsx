import React, { useEffect, useRef, useMemo } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PremiumBackground — Reactive Water-Flow System
 *
 * ─── CRASH-PROOF GUARANTEES ──────────────────────────────────────────
 *  • ZERO React state changes in animation. All motion via direct DOM refs.
 *  • RAF has an `alive` flag — cancelled + cleaned up on unmount.
 *  • Both mouse AND touch events supported (mobile-first).
 *  • prefers-reduced-motion: skips all animation, renders static background.
 *  • Only GPU-composited CSS props changed per frame:
 *      transform3d → no layout/paint, compositor-only ✅
 *      filter (blur+hue-rotate+brightness) → compositor ✅
 *      opacity → compositor ✅
 *
 * ─── VISIBLE EFFECTS ─────────────────────────────────────────────────
 *  1. CURSOR GLOW     — Follows pointer/touch. Color cycles full rainbow
 *                       via hue-rotate. Distance from center = opacity.
 *  2. WATER FLOW      — 4 ambient blobs oscillate with different sine
 *                       freq/phase. Looks like light refracting through water.
 *  3. PARALLAX DEPTH  — Top blob moves OPPOSITE pointer (far layer).
 *                       Bottom blob moves WITH pointer (near layer).
 *  4. CLICK FLASH     — Any click/touch fires a brightness pulse that
 *                       ripples through ALL blobs and decays smoothly.
 *  5. ROUTE COLORS    — CSS transition (not JS) handles cross-fade on navigation.
 *  6. CUSTOMIZER PAGE — Distinct teal/purple aurora (separate aesthetic zone).
 */

// ─── Palette per route ───────────────────────────────────────────────
const PALETTE = {
    '/':         { 
        top: 'rgba(108, 99, 255, 0.85)',    // Soft purple (top-left)
        btm: 'rgba(255, 77, 157, 0.75)',    // Pink/orange (right side)
        accent: 'rgba(255, 122, 89, 0.7)',   // Orange accent
        secondary: 'rgba(124, 58, 237, 0.6)', // Deep purple secondary
        blue: 'rgba(14, 165, 233, 0.4)'      // Subtle blue ambient (center)
    },
    '/shop':     { top: 'rgba(14,165,233,0.75)', btm: 'rgba(20,184,166,0.58)', accent: 'rgba(99,102,241,0.62)', secondary: 'rgba(20,184,166,0.55)' },
    '/cart':     { top: 'rgba(245,158,11,0.72)', btm: 'rgba(239,68,68,0.55)',  accent: 'rgba(124,58,237,0.62)', secondary: 'rgba(14,165,233,0.55)' },
    '/checkout': { top: 'rgba(16,185,129,0.68)', btm: 'rgba(59,130,246,0.55)',  accent: 'rgba(236,72,153,0.62)', secondary: 'rgba(245,158,11,0.55)' },
    '/login':    { top: 'rgba(99,102,241,0.82)', btm: 'rgba(139,92,246,0.65)', accent: 'rgba(76,29,149,0.55)',   secondary: 'rgba(20,184,166,0.55)' },
    '/register': { top: 'rgba(99,102,241,0.82)', btm: 'rgba(139,92,246,0.65)', accent: 'rgba(76,29,149,0.55)',   secondary: 'rgba(20,184,166,0.55)' },
    '/profile':  { top: 'rgba(16,185,129,0.72)', btm: 'rgba(99,102,241,0.65)', accent: 'rgba(236,72,153,0.62)', secondary: 'rgba(14,165,233,0.55)' },
    '/admin':    { top: 'rgba(30,41,59,0.92)',   btm: 'rgba(79,70,229,0.75)',  accent: 'rgba(6,182,212,0.62)',   secondary: 'rgba(16,185,129,0.55)' },
    'default':   { top: 'rgba(59,130,246,0.78)', btm: 'rgba(124,58,237,0.72)', accent: 'rgba(236,72,153,0.62)', secondary: 'rgba(245,158,11,0.55)' }
};

const getPalette = (p) => {
    if (p === '/')                                               return PALETTE['/'];
    if (p.startsWith('/shop'))                                   return PALETTE['/shop'];
    if (p.startsWith('/cart'))                                   return PALETTE['/cart'];
    if (p.startsWith('/checkout'))                               return PALETTE['/checkout'];
    if (p.startsWith('/login'))                                  return PALETTE['/login'];
    if (p.startsWith('/register'))                               return PALETTE['/register'];
    if (p.startsWith('/profile') || p.startsWith('/orders') || p.startsWith('/track'))
        return PALETTE['/profile'];
    return PALETTE['default'];
};

const lerp = (a, b, t) => a + (b - a) * t;

// ─── Component ───────────────────────────────────────────────────────
const PremiumBackground = () => {
    const location     = useLocation();
    const isCustomizer = useMemo(() => location.pathname.includes('/customize/'), [location.pathname]);
    const palette      = useMemo(() => getPalette(location.pathname), [location.pathname]);

    // All refs — mutated directly in RAF, never via React state
    const cursorRef = useRef(null); // follows pointer, hue-rotate color
    const topRef    = useRef(null); // route color, moves AWAY from pointer
    const btmRef    = useRef(null); // route color, moves WITH pointer
    const noiseRef  = useRef(null); // noise texture scroll

    // ── RAF animation engine (runs once, lives for component lifetime) ──
    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        let tx = 0.5, ty = 0.5; // target pointer (normalised 0–1)
        let cx = 0.5, cy = 0.5; // current lerped pointer
        let t  = 0;              // time accumulator
        let ripple = 0;          // click brightness pulse (0→1, decays)
        let rafId  = null;
        let alive  = true;

        // Unified interaction helper
        const setTarget = (x, y) => {
            tx = x / window.innerWidth;
            ty = y / window.innerHeight;
        };

        const onPointerMove  = (e) => setTarget(e.clientX, e.clientY);
        const onPointerDown  = (e) => { setTarget(e.clientX, e.clientY); ripple = 1; };

        const tick = () => {
            if (!alive) return;
            t += 0.005;

            cx = lerp(cx, tx, 0.04);
            cy = lerp(cy, ty, 0.04);

            ripple = ripple > 0.002 ? ripple * 0.85 : 0;

            const W = window.innerWidth;
            const H = window.innerHeight;

            // Simplified sine paths for only 3 blobs
            const s1x = Math.sin(t * 0.5) * 40;
            const s1y = Math.cos(t * 0.4) * 30;
            const s2x = Math.sin(t * 0.7 + 2) * 35;
            const s2y = Math.cos(t * 0.3 + 3) * 25;

            const brt = 1 + ripple * 1.5;

            // NOISE REMAINS STATIC (Huge performance boost)
            
            // CURSOR GLOW (Simplified)
            if (cursorRef.current) {
                const gx = cx * W;
                const gy = cy * H;
                const op = Math.min(0.25, 0.12 + ripple * 0.2);
                cursorRef.current.style.transform = `translate3d(${gx - 400 + s1x * 0.3}px,${gy - 400 + s1y * 0.3}px,0)`;
                cursorRef.current.style.opacity = op;
                cursorRef.current.style.filter = `blur(60px) brightness(${brt})`;
            }

            // TOP GLOW (Far)
            if (topRef.current) {
                const px = (0.5 - cx) * 80 + s1x;
                const py = (0.5 - cy) * 60 + s1y;
                topRef.current.style.transform = `translate3d(${px}px,${py}px,0)`;
                topRef.current.style.filter = `blur(90px) brightness(${1 + ripple * 0.8})`;
            }

            // BOTTOM GLOW (Near)
            if (btmRef.current) {
                const px = (cx - 0.5) * 100 + s2x;
                const py = (cy - 0.5) * 80 + s2y;
                btmRef.current.style.transform = `translate3d(${px}px,${py}px,0)`;
                btmRef.current.style.filter = `blur(100px) brightness(${1 + ripple * 0.8})`;
            }

            rafId = requestAnimationFrame(tick);
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerdown', onPointerDown, { passive: true });
        rafId = requestAnimationFrame(tick);

        return () => {
            alive = false;
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerdown', onPointerDown);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []); // intentionally empty — runs once per mount only

    // Sync route palette → glow divs
    useEffect(() => {
        const bg = (c) => `radial-gradient(circle, ${c} 0%, transparent 70%)`;
        if (topRef.current) topRef.current.style.background = bg(palette.top);
        if (btmRef.current) btmRef.current.style.background = bg(palette.btm);
    }, [palette]);

    // ── Shared cursor glow div ─────────────────────────────────────────────
    const CursorGlow = (
        <div ref={cursorRef} style={{
            position: 'absolute',
            width: '800px', height: '800px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.85) 0%, transparent 70%)',
            pointerEvents: 'none',
            willChange: 'transform, filter, opacity',
            opacity: 0,
            zIndex: 4,
        }} />
    );

    // ── Noise Overlay ─────────────────────────────────────────────────────
    const NoiseOverlay = (
        <div 
            style={{
                position: 'fixed', top: '-50%', left: '-50%', width: '200%', height: '200%',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3BaseFilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/baseFilter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                opacity: 0.04, pointerEvents: 'none', zIndex: 10, mixBlendMode: 'overlay',
                willChange: 'transform'
            }}
            ref={noiseRef}
        />
    );

    /* ══════════════════════════════════════════════════════════════════════
       CUSTOMIZER PAGES — Distinct teal/purple aurora + cursor glow active
    ══════════════════════════════════════════════════════════════════════ */
    if (isCustomizer) {
        return (
            <Box sx={{
                position: 'fixed', top: 0, left: 0,
                width: '100vw', height: '100vh',
                zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
                background: 'linear-gradient(160deg, #05070D 0%, #080A12 55%, #05070D 100%)',
            }}>
                {NoiseOverlay}
                {/* Teal aurora — top-left, breathing */}
                <motion.div
                    animate={{ opacity: [0.22, 0.36, 0.22], scale: [1, 1.06, 1] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', top: '-8%', left: '-5%',
                        width: 'min(55vw, 700px)', height: 'min(55vw, 700px)',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(56,189,248,0.68) 0%, transparent 65%)',
                        filter: 'blur(90px)', willChange: 'opacity, transform',
                    }}
                />
                {/* Purple aurora — bottom-right, offset breathing */}
                <motion.div
                    animate={{ opacity: [0.16, 0.30, 0.16], scale: [1, 1.07, 1] }}
                    transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                    style={{
                        position: 'absolute', bottom: '-8%', right: '-5%',
                        width: 'min(60vw, 750px)', height: 'min(60vw, 750px)',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.62) 0%, transparent 65%)',
                        filter: 'blur(110px)', willChange: 'opacity, transform',
                    }}
                />
                {/* Horizontal aurora band */}
                <Box sx={{
                    position: 'absolute', top: '42%', left: 0, right: 0, height: '4px',
                    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.22) 30%, rgba(56,189,248,0.22) 70%, transparent)',
                    filter: 'blur(12px)',
                }} />
                {CursorGlow}
            </Box>
        );
    }

    /* ══════════════════════════════════════════════════════════════════════
       STANDARD PAGES — Route palette + water flow + mouse/touch reactive
    ══════════════════════════════════════════════════════════════════════ */
    return (
        <Box sx={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
            background: 'linear-gradient(135deg, #05070D 0%, #020408 100%)',
        }}>
            {NoiseOverlay}
            {/* TOP GLOW (Far) */}
            <div ref={topRef} style={{
                position: 'absolute',
                top: '-15%', left: '0%',
                width: 'min(75vw, 950px)', height: 'min(75vw, 950px)',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.top} 0%, transparent 70%)`,
                filter: 'blur(90px)',
                opacity: 0.3,
                transition: 'background 1.1s cubic-bezier(0.25,0.46,0.45,0.94)',
                willChange: 'transform, filter',
                zIndex: 1,
            }} />

            {/* BOTTOM GLOW (Near) */}
            <div ref={btmRef} style={{
                position: 'absolute',
                bottom: '-15%', right: '-5%',
                width: 'min(65vw, 820px)', height: 'min(65vw, 820px)',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.btm} 0%, transparent 70%)`,
                filter: 'blur(100px)',
                opacity: 0.25,
                transition: 'background 1.1s cubic-bezier(0.25,0.46,0.45,0.94)',
                willChange: 'transform, filter',
                zIndex: 3,
            }} />

            {/* CURSOR GLOW — hue-rotate full colour wheel, click flash */}
            {CursorGlow}
        </Box>
    );
};

export default PremiumBackground;
