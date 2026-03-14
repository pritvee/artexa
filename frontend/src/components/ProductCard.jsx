import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button, IconButton, Chip } from '@mui/material';
import { FavoriteBorder as FavoriteIcon, ShoppingCartOutlined as CartIcon, PreviewOutlined as ViewIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getPublicUrl } from '../api/axios';

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="card3d"
        >
            <Card className="glass" sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s ease',
            }}>
                {/* Image Section */}
                <Box sx={{ position: 'relative', height: { xs: 180, md: 280 }, overflow: 'hidden', bgcolor: 'background.default' }}>
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }}>
                        <CardMedia
                            component="img"
                            image={getPublicUrl(product.image_url) || "https://picsum.photos/seed/gift/400/500"}
                            alt={product.name}
                            loading="lazy"
                            sx={{ height: '100%', objectFit: 'cover' }}
                        />
                    </motion.div>

                    {/* Tags */}
                    <Box sx={{ position: 'absolute', top: { xs: 8, md: 15 }, left: { xs: 8, md: 15 }, display: 'flex', gap: 1 }}>
                        <Chip 
                            label={product.is_new ? "New" : "Best Seller"} 
                            size="small" 
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.95)', 
                                backdropFilter: 'blur(5px)',
                                color: 'primary.main',
                                fontWeight: 900,
                                px: 0.5,
                                fontSize: '0.6rem',
                                height: 18,
                                border: '1px solid rgba(124, 58, 237, 0.1)'
                            }} 
                        />
                    </Box>

                    {/* Favorite Action */}
                    <Box sx={{ position: 'absolute', top: { xs: 8, md: 15 }, right: { xs: 8, md: 15 } }}>
                        <IconButton size="small" sx={{ 
                            bgcolor: 'rgba(255,255,255,0.9)', 
                            color: 'secondary.main',
                            width: 28, height: 28,
                            '&:hover': { bgcolor: '#fff', transform: 'scale(1.1)' },
                            transition: 'all 0.2s'
                        }}>
                            <FavoriteIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                    </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, md: 3 }, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: { xs: 1, md: 2 } }}>
                        <Typography variant="subtitle1" sx={{ 
                            fontWeight: 900, 
                            mb: 0.5, 
                            fontSize: { xs: '0.85rem', md: '1.2rem' }, 
                            color: 'text.primary', 
                            letterSpacing: '-0.02em',
                            lineHeight: 1.2,
                            minHeight: { xs: '2.4em', md: 'auto' }
                        }}>
                            {product.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.6rem' }}>
                            {product.category_name || product.customization_type || 'Customizable'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mt: 'auto', gap: { xs: 1.5, md: 0 } }}>
                        <Box>
                            <Typography variant="h5" color="primary" sx={{ fontWeight: 900, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                                ₹{product.price.toFixed(0)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800, fontSize: '0.65rem' }}>Free Delivery</Typography>
                        </Box>
                        
                        <Button 
                            variant="contained" 
                            component={RouterLink}
                            to={`/product/${product.id}`}
                            fullWidth={true}
                            sx={{ 
                                borderRadius: 1.5, 
                                px: { xs: 1.5, md: 3 },
                                py: { xs: 0.8, md: 1.2 },
                                fontWeight: 900,
                                fontSize: { xs: '0.7rem', md: '0.85rem' },
                                boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.3)'
                            }}
                        >
                            Customize
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ProductCard;
