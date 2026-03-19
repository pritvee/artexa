import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Grid, Box, Button,
    Card, CardMedia, Chip, Paper, Stack,
    Rating, Avatar, Divider, TextField, IconButton,
    Fab, Zoom, Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useProducts } from '../store/ProductContext';
import ProductCard from '../components/ProductCard';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { getPublicUrl } from '../api/axios';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { 
            duration: 0.4, 
            ease: [0.22, 1, 0.36, 1] 
        }
    }
};

const CATEGORIES_DATA = [
    { name: 'Frames', img: getPublicUrl('/assets/cat_frames.png'), path: '/shop?category=frames' },
    { name: 'Mugs', img: getPublicUrl('/assets/cat_mugs.png'), path: '/shop?category=mugs' },
    { name: 'Hampers', img: getPublicUrl('/assets/perfect_chocolate_hamper.png'), path: '/shop?category=hampers' },
    { name: 'Photo Gifts', img: getPublicUrl('/assets/luxury_giftbox.png'), path: '/shop?category=gifts' },
];

const REVIEWS = [
    { name: 'Sarah M.', text: 'Best anniversary gift I ordered! The quality is amazing and it arrived so fast.', rating: 5, avatar: 'S' },
    { name: 'Rahul K.', text: 'The custom mug turned out perfect. My wife loved it! Highly recommend Artexa.', rating: 5, avatar: 'R' },
    { name: 'Priya S.', text: 'Elegant design and very emotional gifting experience. Packaging was premium.', rating: 4, avatar: 'P' },
];

const Home = () => {
    const navigate = useNavigate();
    const { products, fetchProducts, loading } = useProducts();

    useEffect(() => {
        fetchProducts(1, 10, null, '', true); 
    }, []);

    return (
        <Box sx={{ bgcolor: 'transparent', pb: 10, position: 'relative' }}>
            {/* Promo Banner - Glassy */}
            <Box sx={{ 
                background: 'rgba(124, 77, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#fff', py: 1, textAlign: 'center', fontSize: '12px', fontWeight: 600,
                position: 'relative', zIndex: 10
            }}>
                <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    ✨ Experience Premium Gifting · Free shipping on orders over ₹1000
                </motion.div>
            </Box>

            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                {/* HERO SECTION */}
                <Box sx={{ 
                    py: { xs: 8, md: 15 }, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' }, 
                    alignItems: 'center',
                    gap: { xs: 8, md: 4 },
                    position: 'relative',
                    zIndex: 2
                }}>
                    <Box sx={{ flex: 1.2 }}>
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, borderRadius: '100px', background: 'rgba(108, 99, 255, 0.1)', border: '1px solid rgba(108, 99, 255, 0.2)', mb: 3 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6C63FF', boxShadow: '0 0 10px #6C63FF' }} />
                                <Typography variant="caption" sx={{ color: '#6C63FF', fontWeight: 800 }}>Premium Custom Gifts</Typography>
                            </Box>
                            
                            <Typography variant="h1" sx={{ 
                                fontSize: { xs: '48px', md: '82px' }, 
                                fontWeight: 900, mb: 3, lineHeight: 0.95,
                                letterSpacing: '-0.05em',
                                color: '#fff'
                            }}>
                                Gift the <Box component="span" sx={{ 
                                    background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 50%, #FF7A59 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: { xs: 'block', md: 'inline' }
                                }}>Extraordinary</Box>
                            </Typography>
                            
                            <Typography variant="h3" sx={{ 
                                mb: 5, fontWeight: 400, maxWidth: 600, 
                                fontSize: { xs: '18px', md: '22px' },
                                color: 'rgba(255, 255, 255, 0.7)',
                                lineHeight: 1.6
                            }}>
                                Elevate your memories with Artexa's premium custom photo gifts. Designed for those who appreciate the finer things.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                <Button 
                                    component={RouterLink} to="/shop" variant="contained" 
                                    sx={{ 
                                        height: '64px', px: 5, borderRadius: '20px', fontSize: '18px', fontWeight: 800,
                                        background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)',
                                        boxShadow: '0 20px 40px rgba(108, 99, 255, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 25px 50px rgba(108, 99, 255, 0.4)',
                                            transform: 'translateY(-3px)'
                                        }
                                    }}
                                >
                                    Start Creating
                                </Button>
                                <Button 
                                    component={RouterLink} to="/shop?category=frames" variant="outlined" 
                                    sx={{ 
                                        height: '64px', px: 5, borderRadius: '20px', fontSize: '18px', fontWeight: 800,
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        backdropFilter: 'blur(20px)',
                                        '&:hover': { 
                                            background: 'rgba(255, 255, 255, 0.08)', 
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            transform: 'translateY(-3px)'
                                        }
                                    }}
                                >
                                    Explore Gallery
                                </Button>
                            </Stack>

                            <Stack direction="row" spacing={5} sx={{ mt: 8 }}>
                                {[
                                    { label: 'Happy Users', val: '10k+' },
                                    { label: 'Total Gifts', val: '50k+' },
                                    { label: 'Delivery', val: '24h' }
                                ].map((stat) => (
                                    <Box key={stat.label}>
                                        <Typography sx={{ fontWeight: 900, fontSize: '28px', color: '#fff' }}>{stat.val}</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, letterSpacing: '0.1em' }}>{stat.label}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </motion.div>
                    </Box>

                    <Box sx={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            style={{ position: 'relative', width: '100%', maxWidth: '550px', perspective: '1000px' }}
                        >
                            <Box 
                                className="tilt-3d"
                                sx={{ 
                                    position: 'relative',
                                    borderRadius: '40px',
                                    overflow: 'visible',
                                    boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '10px'
                                }}
                            >
                                <img 
                                    src={getPublicUrl("/assets/hero.png")} 
                                    alt="Artexa Premium Product" 
                                    style={{ width: '100%', borderRadius: '30px', display: 'block', pointerEvents: 'none' }}
                                />
                                
                                {/* Floating elements */}
                                <motion.div 
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    style={{ 
                                        position: 'absolute', top: '-15%', right: '-10%', width: '140px',
                                        background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(15px)',
                                        padding: '12px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.15)',
                                        boxShadow: '0 20px 40px rgba(0,0.0.3)'
                                    }}
                                >
                                    <img src={getPublicUrl("/assets/cat_frames.png")} style={{ width: '100%', borderRadius: '16px' }} alt="" />
                                </motion.div>

                                <motion.div 
                                    animate={{ y: [0, 20, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    style={{ 
                                        position: 'absolute', bottom: '15%', left: '-15%', width: '120px',
                                        background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(15px)',
                                        padding: '12px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.15)',
                                        boxShadow: '0 20px 40px rgba(0,0.0.3)'
                                    }}
                                >
                                    <img src={getPublicUrl("/assets/cat_mugs.png")} style={{ width: '100%', borderRadius: '16px' }} alt="" />
                                </motion.div>

                                {/* Decorative glow behind hero image */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: '50%', left: '50%',
                                    width: '120%', height: '120%',
                                    transform: 'translate(-50%, -50%)',
                                    background: 'radial-gradient(circle, rgba(108, 99, 255, 0.2) 0%, transparent 70%)',
                                    zIndex: -1,
                                    borderRadius: '50%',
                                    filter: 'blur(40px)'
                                }} />
                            </Box>
                        </motion.div>
                    </Box>
                </Box>

                {/* FEATURED CATEGORIES */}
                <Box sx={{ py: { xs: 8, md: 10 } }}>
                    <Typography variant="h2" sx={{ 
                        mb: 5, fontSize: { xs: '32px', md: '48px' }, 
                        fontWeight: 900, color: '#fff',
                        textAlign: { xs: 'center', md: 'left' }
                    }}>
                        Popular <Box component="span" sx={{ 
                            background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Categories</Box>
                    </Typography>
                    <Grid container spacing={3}>
                        {CATEGORIES_DATA.map((cat, i) => (
                            <Grid item xs={6} sm={3} key={cat.name}>
                                <motion.div 
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card 
                                        onClick={() => navigate(cat.path)}
                                        sx={{ 
                                            borderRadius: '24px', cursor: 'pointer', overflow: 'hidden', 
                                            position: 'relative', border: '1px solid rgba(255, 255, 255, 0.05)',
                                            bgcolor: 'rgba(255, 255, 255, 0.02)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            p: 3, textAlign: 'center',
                                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            '&:hover': {
                                                transform: 'translateY(-10px) scale(1.02)',
                                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                borderColor: 'rgba(108, 99, 255, 0.3)',
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ 
                                            width: 80, height: 80, mb: 2, borderRadius: '24px', 
                                            overflow: 'hidden', bgcolor: 'rgba(108, 99, 255, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#fff' }}>{cat.name}</Typography>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* BEST SELLERS */}
                <Box sx={{ py: { xs: 8, md: 10 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
                        <Typography variant="h2" sx={{ 
                            fontSize: { xs: '32px', md: '48px' }, 
                            fontWeight: 900, color: '#fff' 
                        }}>
                             <Box component="span" sx={{ 
                                background: 'linear-gradient(135deg, #FF7A59 0%, #FF4D9D 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Best</Box> Sellers
                        </Typography>
                        <Button 
                            onClick={() => navigate('/shop')} 
                            sx={{ 
                                fontWeight: 800, color: '#FF4D9D', fontSize: '16px',
                                '&:hover': { background: 'rgba(255, 77, 157, 0.1)' }
                            }}
                        >
                            View All →
                        </Button>
                    </Stack>
                    
                    <Grid container spacing={4}>
                        {loading ? (
                             [1,2,3,4].map(i => <Grid item xs={6} sm={4} md={3} key={i}><Box sx={{ height: 350, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }} /></Grid>)
                        ) : (
                            products.slice(0, 4).map((product, index) => (
                                <Grid item xs={6} sm={4} md={3} key={product.id}>
                                    <motion.div 
                                        variants={fadeUp}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        style={{ height: '100%' }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Box>

                {/* CTA BANNER - Large Glassmorphism */}
                <Box sx={{ py: { xs: 8, md: 12 } }}>
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Paper sx={{ 
                            p: { xs: 6, md: 10 }, borderRadius: '40px', 
                            background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(255, 77, 157, 0.05) 100%)',
                            backdropFilter: 'blur(30px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute', top: '-20%', left: '-10%', width: '40%', height: '150%',
                                background: 'radial-gradient(circle, rgba(108, 99, 255, 0.15) 0%, transparent 70%)',
                                zIndex: 0, pointerEvents: 'none'
                            }} />
                            
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h1" sx={{ 
                                    mb: 2, fontSize: { xs: '36px', md: '56px' }, fontWeight: 900,
                                    color: '#fff'
                                }}>
                                    Your Memory, <Box component="span" sx={{ color: '#6C63FF' }}>Our Masterpiece</Box>
                                </Typography>
                                <Typography variant="h3" sx={{ mb: 6, color: 'rgba(255,255,255,0.6)', maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
                                    Join over 10,000 satisfied customers who've captured their most precious moments with Artexa.
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    onClick={() => navigate('/shop')} 
                                    sx={{ 
                                        height: '64px', borderRadius: '20px', px: 6, fontSize: '18px', fontWeight: 800,
                                        background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)',
                                        boxShadow: '0 20px 40px rgba(108, 99, 255, 0.3)'
                                    }}
                                >
                                    Start Designing Now
                                </Button>
                            </Box>
                        </Paper>
                    </motion.div>
                </Box>




                {/* CUSTOMER REVIEWS - Glassy Carousel */}
                <Box sx={{ py: { xs: 8, md: 10 } }}>
                    <Typography variant="h2" sx={{ mb: 6, fontWeight: 900, color: '#fff', fontSize: '42px' }}>What Our <Box component="span" sx={{ color: '#FF7A59' }}>Users Say</Box></Typography>
                    <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 4, snapType: 'x mandatory', '&::-webkit-scrollbar': { display: 'none' } }}>
                        {REVIEWS.map((rev, i) => (
                            <Card key={rev.name} sx={{ 
                                minWidth: 320, maxWidth: 350, p: 4, borderRadius: '32px', scrollSnapAlign: 'start', flexShrink: 0,
                                bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(20px)',
                                transition: '0.4s ease',
                                '&:hover': { transform: 'translateY(-10px)', borderColor: 'rgba(255,255,255,0.1)' }
                            }}>
                                <Rating value={rev.rating} readOnly size="small" sx={{ mb: 2, color: '#FF7A59' }} />
                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 4, fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', minHeight: '4.5em', lineHeight: 1.6 }}>"{rev.text}"</Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ 
                                        background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)', 
                                        width: 48, height: 48, fontSize: '18px', fontWeight: 800 
                                    }}>{rev.avatar}</Avatar>
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#fff', display: 'block' }}>{rev.name}</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Verified Customer</Typography>
                                    </Box>
                                </Stack>
                            </Card>
                        ))}
                    </Box>
                </Box>
            </Container>

            {/* FLOATING ACTION BUTTON - Interactive Glow */}
            <Tooltip title="Chat with Artexa Support">
                <Fab 
                    color="primary" 
                    aria-label="chat" 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 30, 
                        right: 30, 
                        width: 64, 
                        height: 64,
                        boxShadow: '0 15px 30px rgba(108, 99, 255, 0.4)',
                        background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                            boxShadow: '0 20px 40px rgba(108, 99, 255, 0.6)',
                        }
                    }}
                >
                    <ChatBubbleIcon sx={{ fontSize: '28px' }} />
                </Fab>
            </Tooltip>
        </Box>
    );
};

export default Home;
