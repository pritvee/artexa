import React from 'react';
import { Box, Container, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PremiumCustomizerLayout
 * 
 * A high-end, mobile-first layout for product customization.
 * 
 * Mobile: [Top: 3D/Preview] -> [Middle: Scrollable Controls] -> [Bottom: Sticky Action Bar]
 * Desktop: [Left: 3D/Preview] | [Right: Scrollable Controls] -> [Bottom: Sticky Action Bar]
 */
const PremiumCustomizerLayout = ({ 
    previewContent, 
    controlContent, 
    actionBarContent,
    title,
    subtitle
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Glassmorphism Styles (duplicated from ThemeContext for safety/local control)
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: '#fff',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            pt: { xs: 8, md: 10 }, // Navbar spacing
            pb: '80px', // Action bar spacing
        }}>
            {/* Background Decorative Glows */}
            <Box sx={{
                position: 'fixed', top: '5%', right: '5%', width: '40vw', height: '40vw',
                background: 'radial-gradient(circle, rgba(108, 99, 255, 0.1) 0%, transparent 70%)',
                filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'fixed', bottom: '15%', left: '5%', width: '35vw', height: '35vw',
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
                filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none',
            }} />

            <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, px: { xs: 2, md: 4 } }}>
                {/* Header info (Optional - useful on desktop, maybe hidden/minimal on mobile) */}
                {!isMobile && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h1" sx={{ 
                            fontSize: { xs: '24px', md: '36px' }, 
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                )}

                <Grid container spacing={4} sx={{ flexGrow: 1 }}>
                    {/* PREVIEW SIDE: Perfect Square Layout for Mobile & Desktop */}
                    <Grid item xs={12} md={7} sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: { xs: 'center', md: 'flex-start' },
                        position: { md: 'sticky' }, 
                        top: { md: 100 },
                        minHeight: { md: 'calc(100vh - 200px)' }
                    }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ 
                                width: '100%',
                                // Use aspect-ratio 1/1 but max-out at available viewport height
                                aspectRatio: '1 / 1',
                                maxHeight: 'calc(100vh - 260px)',
                                maxWidth: 'calc(100vh - 260px)',
                                margin: '0 auto'
                            }}
                        >
                            <Box sx={{ 
                                ...glassStyle, 
                                height: '100%', 
                                width: '100%', 
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0,0,0,0.2)'
                            }}>
                                {previewContent}
                            </Box>
                        </motion.div>
                    </Grid>

                    {/* CONTROLS SIDE */}
                    <Grid item xs={12} md={5}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <Box sx={{ 
                                ...glassStyle, 
                                p: { xs: 2, md: 3 },
                                mb: 10 // Extra space for mobile flow
                            }}>
                                {controlContent}
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>

            {/* STICKY ACTION BAR */}
            <Box sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80px',
                background: 'rgba(11, 15, 26, 0.8)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                px: { xs: 2, md: 4 },
                boxShadow: '0 -10px 30px rgba(0,0,0,0.4)'
            }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {actionBarContent}
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default PremiumCustomizerLayout;
