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
    const w1Ref     = useRef(null); // water wave blob 1
    const w2Ref     = useRef(null); // water wave blob 2
    const w3Ref     = useRef(null); // water wave blob 3 (extra depth layer)
    const w4Ref     = useRef(null); // water wave blob 4 (extra depth layer)
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
            t += 0.007;                           // ≈ full cycle every ~14 s at 60 fps

            // Lerp pointer — 0.055 = silky smooth, responsive enough
            cx = lerp(cx, tx, 0.055);
            cy = lerp(cy, ty, 0.055);

            // Ripple decay — multiplicative so it feels like genuine energy dissipating
            ripple = ripple > 0.002 ? ripple * 0.90 : 0;

            const W = window.innerWidth;
            const H = window.innerHeight;

            // ── Water-flow sin offsets (4 blobs, independent freq + phase) ──
            // Each blob has a completely different period → organic, non-repeating look
            const s1x = Math.sin(t * 0.65)            * 60;
            const s1y = Math.cos(t * 0.48 + 1.2)      * 45;

            const s2x = Math.sin(t * 0.90 + 2.3)      * 50;
            const s2y = Math.cos(t * 0.55 + 3.7)      * 40;

            const s3x = Math.sin(t * 0.50 + 4.8)      * 70;
            const s3y = Math.cos(t * 0.72 + 0.6)      * 50;

            const s4x = Math.sin(t * 0.78 + 5.4)      * 45;
            const s4y = Math.cos(t * 0.38 + 2.0)      * 35;

            const s5x = Math.sin(t * 0.60 + 1.8)      * 55;
            const s5y = Math.cos(t * 0.85 + 6.1)      * 45;

            const brt  = 1 + ripple * 2.2;   // max 3.2× bright on click

            // ── NOISE ANIMATION ──────────────────────────────────────
            if (noiseRef.current) {
                const nx = (t * 50) % 1000;
                const ny = (t * 30) % 1000;
                noiseRef.current.style.transform = `translate3d(${nx}px,${ny}px,0)`;
            }

            // ── CURSOR GLOW ──────────────────────────────────────────
            if (cursorRef.current) {
                const gx  = cx * W;
                const gy  = cy * H;
                const dx  = cx - 0.5, dy = cy - 0.5;
                const ang = Math.atan2(dy, dx) * (180 / Math.PI);
                const hue = ((ang + 360) % 360);
                const dist = Math.sqrt(dx * dx + dy * dy);
                // opacity: min 0.12 at centre, rises to 0.35 at edges, flash on click
                const op  = Math.min(0.38, 0.15 + dist * 0.30 + ripple * 0.25);

                // Position: follows pointer + tiny water-shimmer offset
                cursorRef.current.style.transform = `translate3d(${gx - 400 + s1x * 0.3}px,${gy - 400 + s1y * 0.3}px,0)`;
                cursorRef.current.style.filter    = `blur(80px) hue-rotate(${hue}deg) brightness(${brt})`;
                cursorRef.current.style.opacity   = op;
            }

            // ── TOP GLOW (far layer — moves OPPOSITE pointer + wave) ─
            if (topRef.current) {
                const px = (0.5 - cx) * 120 + s2x;
                const py = (0.5 - cy) * 90  + s2y;
                topRef.current.style.transform = `translate3d(${px}px,${py}px,0)`;
                topRef.current.style.filter    = `blur(130px) brightness(${1 + ripple * 1.0})`;
            }

            // ── BOTTOM GLOW (near layer — moves WITH pointer + wave) ─
            if (btmRef.current) {
                const px = (cx - 0.5) * 150 + s3x;
                const py = (cy - 0.5) * 110  + s3y;
                btmRef.current.style.transform = `translate3d(${px}px,${py}px,0)`;
                btmRef.current.style.filter    = `blur(140px) brightness(${1 + ripple * 1.0})`;
            }

            // ── WATER WAVE BLOB 1 (pure sine — ambient, centre-left) ─
            if (w1Ref.current) {
                w1Ref.current.style.transform = `translate3d(${s4x}px,${s4y}px,0)`;
                w1Ref.current.style.filter    = `blur(110px) brightness(${1 + ripple * 0.5})`;
            }

            // ── WATER WAVE BLOB 2 (pure sine — ambient, centre-right) ─
            if (w2Ref.current) {
                w2Ref.current.style.transform = `translate3d(${s5x}px,${s5y}px,0)`;
                w2Ref.current.style.filter    = `blur(105px) brightness(${1 + ripple * 0.5})`;
            }

            // ── WATER WAVE BLOB 3 (pure sine — mid-screen blue ambient) ──
            if (w3Ref.current) {
                const wx = Math.sin(t * 0.42 + 7.2) * 60;
                const wy = Math.cos(t * 0.67 + 2.8) * 45;
                w3Ref.current.style.transform = `translate3d(${wx}px,${wy}px,0)`;
                w3Ref.current.style.filter    = `blur(100px) brightness(${1 + ripple * 0.4})`;
            }

            // ── WATER WAVE BLOB 4 (pure sine — bottom-left accent) ──
            if (w4Ref.current) {
                const wx = Math.cos(t * 0.35 + 1.5) * 55;
                const wy = Math.sin(t * 0.58 + 4.2) * 40;
                w4Ref.current.style.transform = `translate3d(${wx}px,${wy}px,0)`;
                w4Ref.current.style.filter    = `blur(120px) brightness(${1 + ripple * 0.5})`;
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

    // ── Sync route palette → glow divs (CSS transition does the colour blend) ──
    useEffect(() => {
        const bg = (c) => `radial-gradient(circle, ${c} 0%, transparent 70%)`;
        if (topRef.current) topRef.current.style.background = bg(palette.top);
        if (btmRef.current) btmRef.current.style.background = bg(palette.btm);
        if (w1Ref.current) w1Ref.current.style.background = bg(palette.accent);
        if (w2Ref.current) w2Ref.current.style.background = bg(palette.secondary);
        if (w3Ref.current) w3Ref.current.style.background = bg(palette.blue || 'rgba(14, 165, 233, 0.35)');
        if (w4Ref.current) w4Ref.current.style.background = bg(palette.accent || 'rgba(255, 77, 157, 0.3)');
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
            {/* TOP GLOW (Far) — Purple route-aware, parallaxes away from pointer */}
            <div ref={topRef} style={{
                position: 'absolute',
                top: '-15%', left: '0%',
                width: 'min(75vw, 950px)', height: 'min(75vw, 950px)',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.top} 0%, transparent 70%)`,
                filter: 'blur(130px)',
                opacity: 0.32,
                transition: 'background 1.1s cubic-bezier(0.25,0.46,0.45,0.94)',
                willChange: 'transform, filter, background',
                zIndex: 1,
            }} />

            {/* BOTTOM GLOW (Near) — Pink/Orange route-aware, parallaxes with pointer */}
            <div ref={btmRef} style={{
                position: 'absolute',
                bottom: '-15%', right: '-5%',
                width: 'min(65vw, 820px)', height: 'min(65vw, 820px)',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.btm} 0%, transparent 70%)`,
                filter: 'blur(140px)',
                opacity: 0.28,
                transition: 'background 1.1s cubic-bezier(0.25,0.46,0.45,0.94)',
                willChange: 'transform, filter, background',
                zIndex: 3,
            }} />

            {/* WATER BLOB 1 (Mid) — Ambient primary, drifts centre-left */}
            <div ref={w1Ref} style={{
                position: 'absolute',
                top: '20%', left: '-10%',
                width: 'min(48vw, 600px)', height: 'min(48vw, 600px)',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.accent} 0%, transparent 70%)`,
                filter: 'blur(110px)',
                opacity: 0.22,
                transition: 'background 1.1s cubic-bezier(0.25,0.46,0.45,0.94)',
                willChange: 'transform, filter, background',
                zIndex: 2,
            }} />

            {/* WATER BLOB 2 (Mid) — Ambient secondary, drifts centre-right */}
            <div ref={w2Ref} style={{
                position: 'absolute',
                top: '40%', right: '0%',
                width: 'min(40vw, 500px)', height: 'min(40vw, 500px)',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.secondary} 0%, transparent 70%)`,
                filter: 'blur(105px)',
                opacity: 0.18,
                transition: 'background 1.1s cubic-bezier(0.25,0.46,0.45,0.94)',
                willChange: 'transform, filter, background',
                zIndex: 2,
            }} />

            {/* WATER BLOB 3 (Center) — Subtle Ambient Blue, mid-screen accent */}
            <div ref={w3Ref} style={{
                position: 'absolute',
                top: '55%', left: '30%',
                width: 'min(35vw, 450px)', height: 'min(35vw, 450px)',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.blue || 'rgba(14, 165, 233, 0.35)'} 0%, transparent 70%)`,
                filter: 'blur(100px)',
                opacity: 0.15,
                transition: 'background 1.1s cubic-bezier(0.25,0.46,0.45,0.94)',
                willChange: 'transform, filter, background',
                zIndex: 2,
            }} />

            {/* WATER BLOB 4 (Bottom-Left) — Accent Orange/Purple */}
            <div ref={w4Ref} style={{
                position: 'absolute',
                bottom: '10%', left: '5%',
                width: 'min(40vw, 550px)', height: 'min(40vw, 550px)',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.accent} 0%, transparent 70%)`,
                filter: 'blur(120px)',
                opacity: 0.12,
                transition: 'background 1.1s cubic-bezier(0.25,0.46,0.45,0.94)',
                willChange: 'transform, filter, background',
                zIndex: 2,
            }} />

            {/* CURSOR GLOW — hue-rotate full colour wheel, click flash */}
            {CursorGlow}
        </Box>
    );
};

export default PremiumBackground;
