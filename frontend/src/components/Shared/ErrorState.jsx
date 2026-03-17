import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ErrorState = ({ 
    message = "Oops! Something went wrong", 
    onRetry, 
    showBackToShop = true 
}) => {
    const navigate = useNavigate();

    return (
        <Box 
            sx={{ 
                py: 10, 
                px: 2,
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '40vh'
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <ErrorOutlineIcon sx={{ fontSize: 80, color: 'accent.main', mb: 3, opacity: 0.8 }} />
                
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                    {message}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 450, mx: 'auto' }}>
                    We encountered an unexpected error while processing your request. Our team has been notified.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    {onRetry && (
                        <Button 
                            variant="contained" 
                            onClick={onRetry}
                            sx={{ 
                                height: 52, 
                                px: 4, 
                                borderRadius: '16px', 
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%)',
                                boxShadow: '0 8px 20px rgba(108, 99, 255, 0.3)'
                            }}
                        >
                            Retry
                        </Button>
                    )}
                    
                    {showBackToShop && (
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate('/shop')}
                            sx={{ 
                                height: 52, 
                                px: 4, 
                                borderRadius: '16px', 
                                fontWeight: 700,
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.02)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            Back to Shop
                        </Button>
                    )}
                </Stack>
            </motion.div>
        </Box>
    );
};

export default ErrorState;
