import { useState } from 'react';
import { Card, CardMedia, Typography, Box, Button, IconButton, Chip, Stack, Rating } from '@mui/material';
import { FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getPublicUrl } from '../api/axios';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
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
                    borderRadius: '35px', 
                    p: 2.5, 
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1.2px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    transformStyle: "preserve-3d",
                    transform: 'translate3d(0,0,0)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    '&:hover': {
                        borderColor: 'rgba(108, 99, 255, 0.65)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 45px 90px rgba(0,0,0,0.6), 0 0 35px rgba(108, 99, 255, 0.25)',
                        transform: 'translate3d(0,-6px,0) scale(1.02)',
                        '& .product-image-container': { transform: 'translateZ(40px) scale(1.05)' },
                        '& .glow-effect': { opacity: 1 }
                    },
                    '&::before': { // Top edge highlight
                        content: '""',
                        position: 'absolute', top: 0, left: '20%', right: '20%', height: '1.5px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                        opacity: 0.6, zIndex: 5
                    }
                }}
                onClick={() => navigate(`/product/${product.id}`)}
            >
                {/* Background Glow Effect */}
                <Box 
                    className="glow-effect"
                    sx={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-20%',
                        width: '140%',
                        height: '140%',
                        background: 'radial-gradient(circle at center, rgba(108, 99, 255, 0.08) 0%, transparent 70%)',
                        opacity: 0,
                        transition: 'opacity 0.4s ease',
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                />

                {/* Wishlist Icon */}
                <IconButton 
                    onClick={(e) => { e.stopPropagation(); setWishlist(!wishlist); }}
                    sx={{ 
                        position: 'absolute', top: 20, right: 20, zIndex: 10, 
                        bgcolor: 'rgba(5, 7, 10, 0.6)', backdropFilter: 'blur(10px)',
                        width: 44, height: 44, 
                        border: '1px solid rgba(255,255,255,0.1)',
                        '&:hover': { 
                            bgcolor: 'rgba(5, 7, 10, 0.8)', 
                            transform: 'scale(1.1) translateZ(40px)',
                            borderColor: '#FF4D9D'
                        },
                        transition: 'all 0.2s'
                    }}
                >
                    {wishlist ? <FavoriteIcon sx={{ color: '#FF4D9D', fontSize: 22 }} /> : <FavoriteBorderIcon sx={{ color: 'white', fontSize: 22 }} />}
                </IconButton>

                {/* Image Section */}
                <Box 
                    className="product-image-container"
                    sx={{ 
                        position: 'relative', 
                        height: { xs: 200, md: 240 }, 
                        borderRadius: '24px', 
                        overflow: 'hidden', 
                        mb: 3, 
                        bgcolor: 'rgba(0,0,0,0.2)',
                        transition: 'transform 0.6s cubic-bezier(0.2, 0, 0.2, 1)',
                        transformStyle: "preserve-3d",
                        border: '1px solid rgba(255,255,255,0.05)'
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
                        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                            <Chip 
                                label="NEW" 
                                size="small" 
                                sx={{ 
                                    background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)', 
                                    color: 'white',
                                    fontWeight: 900,
                                    fontSize: '11px',
                                    height: 24,
                                    px: 1,
                                    boxShadow: '0 8px 16px rgba(108, 99, 255, 0.4)',
                                    border: 'none'
                                }} 
                            />
                        </Box>
                    )}
                </Box>

                {/* Content Section */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', transform: 'translateZ(20px)', zIndex: 1 }}>
                    <Typography variant="body2" sx={{ 
                        fontWeight: 800, 
                        mb: 1.5, 
                        lineHeight: 1.4, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden', 
                        minHeight: '2.8em',
                        color: 'white',
                        fontSize: '18px',
                        letterSpacing: '-0.01em'
                    }}>
                        {product.name}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
                        <Rating value={5} readOnly size="small" sx={{ fontSize: '14px', color: '#FF7A59' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '12px' }}>
                            ({Math.floor(Math.random() * 50) + 120} REVIEWS)
                        </Typography>
                    </Stack>
                    
                    <Box sx={{ mt: 'auto' }}>
                        <Typography variant="h4" sx={{ 
                            color: 'white', 
                            fontWeight: 900, 
                            mb: 2.5, 
                            fontSize: '24px',
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #6C63FF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            ₹{(product.price || 0).toLocaleString()}
                        </Typography>
                        
                        <Button 
                            variant="contained" 
                            fullWidth
                            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                            sx={{ 
                                borderRadius: '18px', 
                                height: '56px', 
                                fontSize: '15px', 
                                fontWeight: 900,
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)',
                                boxShadow: '0 10px 20px rgba(108, 99, 255, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 15px 30px rgba(108, 99, 255, 0.4)',
                                }
                            }}
                        >
                            Personalize Now
                        </Button>
                    </Box>
                </Box>
            </Card>
        </motion.div>
    );
};

export default ProductCard;
