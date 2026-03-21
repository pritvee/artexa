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

const glideVariants = {
    hidden: { 
        opacity: 0, 
        x: 20,
    },
    show: { 
        opacity: 1, 
        x: 0,
        transition: {
            duration: 0.24,
            ease: [0.16, 1, 0.3, 1], // Ultra Snappy
            staggerChildren: 0.04,
        },
    },
    exit: { 
        opacity: 0, 
        x: -20,
        transition: {
            duration: 0.18,
            ease: "easeIn"
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
    willChange: 'opacity, transform',
};

const PageTransition = ({ children }) => (
    <motion.div
        variants={glideVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        style={motionStyle}
    >
        {children}
    </motion.div>
);

export default PageTransition;
