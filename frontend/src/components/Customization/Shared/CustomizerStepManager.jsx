import React from 'react';
import { Box, Typography, Stack, Chip, Button, IconButton, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

/**
 * CustomizerStepManager
 * 
 * Manages steps in a product customizer.
 * Provides a tab-like interface but styled with chips/pills for a premium feel.
 */
const CustomizerStepManager = ({ 
    steps, 
    activeStep, 
    onStepChange, 
    children 
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Step Navigation (Chips) */}
            <Box sx={{ 
                display: 'flex', 
                overflowX: 'auto', 
                pb: 1,
                gap: 1.5,
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
            }}>
                {steps.map((step, index) => (
                    <Chip
                        key={step.id}
                        label={step.label}
                        icon={step.icon}
                        onClick={() => onStepChange(index)}
                        sx={{
                            px: 1,
                            py: 2.5,
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: '13px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            bgcolor: activeStep === index ? 'primary.main' : 'rgba(255,255,255,0.05)',
                            color: activeStep === index ? '#fff' : 'rgba(255,255,255,0.6)',
                            border: '1px solid',
                            borderColor: activeStep === index ? 'primary.main' : 'rgba(255,255,255,0.1)',
                            '&:hover': {
                                bgcolor: activeStep === index ? 'primary.dark' : 'rgba(255,255,255,0.1)',
                                transform: 'translateY(-2px)',
                            },
                        }}
                    />
                ))}
            </Box>

            {/* Current Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <Box sx={{ minHeight: '300px' }}>
                        {children}
                    </Box>
                </motion.div>
            </AnimatePresence>

            {/* Step Navigation Buttons (Optional but helpful) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                    startIcon={<ChevronLeftIcon />}
                    disabled={activeStep === 0}
                    onClick={() => onStepChange(activeStep - 1)}
                    sx={{ color: 'rgba(255,255,255,0.6)' }}
                >
                    Back
                </Button>
                <Button
                    endIcon={<ChevronRightIcon />}
                    disabled={activeStep === steps.length - 1}
                    onClick={() => onStepChange(activeStep + 1)}
                    variant="contained"
                    sx={{ borderRadius: '12px', bgcolor: 'primary.main' }}
                >
                    Next Step
                </Button>
            </Box>
        </Box>
    );
};

export default CustomizerStepManager;
