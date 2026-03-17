import React from 'react';
import { motion } from 'framer-motion';

/**
 * PageTransition - Premium 3D-ish Transition
 * Uses a combination of scale, slight rotation, and opacity for a depth-filled effect.
 */
const pageTransition = {
  hidden: { 
    opacity: 0, 
    scale: 0.96,
    rotateX: 4,
    y: 10,
    filter: 'blur(4px)'
  },
  show: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    y: 0,
    filter: 'blur(0px)',
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for premium feel
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0, 
    scale: 1.02,
    rotateX: -4,
    y: -10,
    filter: 'blur(4px)',
    transition: { 
      duration: 0.4, 
      ease: "easeOut"
    }
  }
}

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="show"
      exit="exit"
      style={{ 
        width: '100%',
        willChange: 'opacity, transform, filter',
        perspective: '1200px' // Provides the 3D depth for rotations
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
