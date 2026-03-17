import React from 'react';
import { Button, Box } from '@mui/material';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const ThreeDButton = ({ children, sx = {}, ...props }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
                display: 'inline-block'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Button
                {...props}
                sx={{
                    ...sx,
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    '& > *': {
                        transform: 'translateZ(20px)',
                    },
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 20px 40px rgba(123, 97, 255, 0.4)',
                    }
                }}
            >
                <Box component="span" sx={{ 
                    position: 'relative', 
                    zIndex: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    transform: 'translateZ(20px)',
                }}>
                    {children}
                </Box>
                {/* Shine Effect */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        '&:hover': { opacity: 1 },
                        borderRadius: 'inherit',
                        pointerEvents: 'none'
                    }}
                />
            </Button>
        </motion.div>
    );
};

export default ThreeDButton;
