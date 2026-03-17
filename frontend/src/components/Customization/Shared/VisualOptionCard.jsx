import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * VisualOptionCard
 * 
 * A premium selectable card for customization options.
 */
const VisualOptionCard = ({ 
    label, 
    value, 
    selected, 
    onClick, 
    icon, 
    description,
    price 
}) => {
    const theme = useTheme();

    return (
        <Box
            component={motion.div}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(value)}
            sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: '16px',
                border: '2px solid',
                borderColor: selected ? 'primary.main' : 'rgba(255,255,255,0.05)',
                bgcolor: selected ? 'rgba(108, 99, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 1,
                minWidth: '100px',
                flex: 1,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Selection Glow */}
            {selected && (
                <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    boxShadow: 'inset 0 0 20px rgba(108,99,255,0.2)',
                    pointerEvents: 'none'
                }} />
            )}

            {icon && (
                <Box sx={{ 
                    fontSize: '24px', 
                    mb: 0.5,
                    color: selected ? 'primary.main' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.3s ease'
                }}>
                    {icon}
                </Box>
            )}

            <Typography sx={{ 
                fontWeight: 700, 
                fontSize: '13px',
                color: selected ? '#fff' : 'rgba(255,255,255,0.7)' 
            }}>
                {label}
            </Typography>

            {price && (
                <Typography sx={{ 
                    fontSize: '11px', 
                    color: 'primary.main',
                    fontWeight: 800
                }}>
                    +₹{price}
                </Typography>
            )}

            {description && (
                <Typography sx={{ 
                    fontSize: '10px', 
                    color: 'rgba(255,255,255,0.4)',
                    mt: 0.5
                }}>
                    {description}
                </Typography>
            )}
        </Box>
    );
};

export default VisualOptionCard;
