import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button, IconButton, Chip, Stack, Rating } from '@mui/material';
import { FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon, ShoppingCartOutlined as CartIcon } from '@mui/icons-material';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getPublicUrl } from '../api/axios';
import { useCart } from '../store/CartContext';
import ThreeDButton from './Shared/ThreeDButton';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [wishlist, setWishlist] = useState(false);

    // Tilt effect logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;
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
                rotateX, rotateY, 
                transformStyle: "preserve-3d",
                height: '100%' 
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
        >
            <Card 
                sx={{ 
                    height: '100%', 
                    borderRadius: '24px', 
                    p: 2, 
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'border-color 0.3s ease',
                    transformStyle: "preserve-3d",
                    '&:hover': {
                        borderColor: 'primary.main',
                        '& .product-image-container': { transform: 'translateZ(20px) scale(1.05)' }
                    }
                }}
                onClick={() => navigate(`/product/${product.id}`)}
            >
                {/* Wishlist Icon */}
                <IconButton 
                    onClick={(e) => { e.stopPropagation(); setWishlist(!wishlist); }}
                    sx={{ 
                        position: 'absolute', top: 12, right: 12, zIndex: 10, 
                        bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                        width: 36, height: 36, 
                        border: '1px solid rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)', transform: 'scale(1.1) translateZ(30px)' },
                        transition: 'all 0.2s'
                    }}
                >
                    {wishlist ? <FavoriteIcon sx={{ color: '#F50057', fontSize: 20 }} /> : <FavoriteBorderIcon sx={{ color: 'white', fontSize: 20 }} />}
                </IconButton>

                {/* Image Section */}
                <Box 
                    className="product-image-container"
                    sx={{ 
                        position: 'relative', height: { xs: 180, md: 220 }, borderRadius: '18px', 
                        overflow: 'hidden', mb: 2.5, bgcolor: '#05070A',
                        transition: 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)',
                        transformStyle: "preserve-3d",
                    }}
                >
                    <CardMedia
                        component="img"
                        image={getPublicUrl(product.image_url) || "https://picsum.photos/seed/gift/400/500"}
                        alt={product.name}
                        loading="lazy"
                        sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                    />
                    {product.is_new && (
                        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                            <Chip 
                                label="NEW" 
                                size="small" 
                                sx={{ 
                                    background: 'linear-gradient(135deg, #7C4DFF 0%, #F50057 100%)', 
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '10px',
                                    height: 22,
                                    boxShadow: '0 4px 12px rgba(124, 77, 255, 0.4)'
                                }} 
                            />
                        </Box>
                    )}
                </Box>

                {/* Content Section */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', transform: 'translateZ(10px)' }}>
                    <Typography variant="body2" sx={{ 
                        fontWeight: 800, 
                        mb: 1, 
                        lineHeight: 1.4, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden', 
                        minHeight: '2.8em',
                        color: 'white',
                        fontSize: '16px'
                    }}>
                        {product.name}
                    </Typography>

                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 2 }}>
                        <Rating value={5} readOnly size="small" sx={{ fontSize: '12px', color: '#FFD700' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>({Math.floor(Math.random() * 50) + 10} reviews)</Typography>
                    </Stack>
                    
                    <Box sx={{ mt: 'auto' }}>
                        <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 900, mb: 2, fontSize: '22px' }}>
                            ₹{(product.price || 0).toLocaleString()}
                        </Typography>
                        
                        <ThreeDButton 
                            variant="contained" 
                            fullWidth
                            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                            sx={{ 
                                borderRadius: '14px', 
                                height: '52px', 
                                fontSize: '14px', 
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #7C4DFF 0%, #F50057 100%)',
                            }}
                        >
                            Customize It
                        </ThreeDButton>
                    </Box>
                </Box>
            </Card>
        </motion.div>
    );
};

export default ProductCard;
