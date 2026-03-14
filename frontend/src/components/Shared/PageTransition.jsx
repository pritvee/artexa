import React from 'react';
import { motion } from 'framer-motion';

const pageTransition = {
  hidden: { 
    opacity: 0, 
    scale: 0.99,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.33, 1, 0.68, 1], // Faster, hardware-friendly ease
    }
  },
  exit: {
    opacity: 0, 
    transition: { 
      duration: 0.2, 
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
        willChange: 'opacity, transform' // Hardware acceleration
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
