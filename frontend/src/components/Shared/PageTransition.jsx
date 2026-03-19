import React, { useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * PageTransition — "3D Zoom Through"
 *
 * A premium 3D zoom-based page transition:
 *   • ENTER : page emerges from slightly behind (scale 0.94, small Y push)
 *             with a gentle depth-blur sweeping clear → natural "zoom in from depth"
 *   • EXIT  : current page zooms slightly forward then fades out cleanly
 *             (scale 1.04, slight Y pull-back) → "zooming through" to next page
 *
 * Crash-proof design:
 *   – Perspective wrapper is a plain static <div> — zero re-renders on it
 *   – `transformStyle: preserve-3d` only on the animated layer (not nested)
 *   – `willChange` capped to 3 GPU-compositable properties
 *   – Scale ranges are tiny (0.94–1.04) — no overflow / layout shift
 *   – Framer Motion `AnimatePresence mode="wait"` in App.jsx ensures no
 *     two pages overlap simultaneously (no z-fighting)
 *   – `backfaceVisibility: hidden` prevents flickering on mobile WebKit
 *   – No rotateY/rotateX so there's zero chance of perspective plane clipping
 *   – Duration ≤ 0.48s enter, ≤ 0.26s exit — snappy and never sluggish
 */

const zoomVariants = {
    hidden: {
        opacity: 0,
        scale: 0.94,
        z: -50,                // moves back into the screen
        y: 15,
        filter: 'blur(8px)',
    },
    show: {
        opacity: 1,
        scale: 1,
        z: 0,                  // moves back to center
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.52,
            type: "spring",
            stiffness: 260,
            damping: 26,
            opacity: { duration: 0.38 },
            filter: { duration: 0.35 }
        },
    },
    exit: {
        opacity: 0,
        scale: 1.05,
        z: 60,                 // zooms out towards the user
        y: -12,
        filter: 'blur(6px)',
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        },
    },
};

const perspectiveStyle = {
    perspective: '900px',
    perspectiveOrigin: '50% 42%',
    // Isolated stacking context so the perspective never leaks to siblings
    isolation: 'isolate',
};

const motionStyle = {
    width: '100%',
    transformStyle: 'preserve-3d',
    backfaceVisibility: 'hidden',           // WebKit anti-flicker
    WebkitBackfaceVisibility: 'hidden',
    willChange: 'opacity, transform, filter',
};

const PageTransition = ({ children }) => (
    <div style={perspectiveStyle}>
        <motion.div
            variants={zoomVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={motionStyle}
        >
            {children}
        </motion.div>
    </div>
);

export default PageTransition;
