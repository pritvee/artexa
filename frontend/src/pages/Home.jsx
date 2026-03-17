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
        <Box sx={{ bgcolor: 'background.default', pb: 10 }}>
            {/* Promo */}
            <Box sx={{ 
                background: 'linear-gradient(90deg, #6C63FF 0%, #9C4DFF 100%)', 
                color: '#fff', py: 1, textAlign: 'center', fontSize: '12px', fontWeight: 600
            }}>
                Use mobile-first design · Free shipping on orders over ₹1000
            </Box>

            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                {/* HERO SECTION */}
                <Box sx={{ 
                    py: { xs: 6, md: 10 }, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' }, 
                    alignItems: 'center',
                    gap: { xs: 6, md: 4 },
                    position: 'relative'
                }}>
                    {/* Background Blobs */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                        overflow: 'hidden'
                    }}>
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            style={{
                                position: 'absolute',
                                top: '-20%',
                                right: '-10%',
                                width: '400px',
                                height: '400px',
                                background: 'radial-gradient(circle, rgba(108, 99, 255, 0.2) 0%, transparent 70%)',
                                borderRadius: '50%',
                                filter: 'blur(60px)'
                            }}
                        />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                            <Typography variant="h1" sx={{ 
                                fontSize: { xs: '40px', md: '64px' }, 
                                fontWeight: 900, mb: 2, lineHeight: 1.05,
                                letterSpacing: '-0.04em'
                            }}>
                                Gift the <Box component="span" className="gradient-text">Extraordinary</Box>
                            </Typography>
                            <Typography variant="h3" color="text.secondary" sx={{ mb: 4, fontWeight: 500, maxWidth: 600, fontSize: { xs: '16px', md: '20px' } }}>
                                Elevate your memories with Artexa's premium custom photo gifts. Designed for those who appreciate the finer things.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                <Button 
                                    component={RouterLink} to="/shop" variant="contained" 
                                    className="pulse-glow"
                                    sx={{ 
                                        height: '56px', px: 4, borderRadius: '16px', fontSize: '16px', fontWeight: 700,
                                        background: 'linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%)',
                                    }}
                                >
                                    Start Creating
                                </Button>
                                <Button 
                                    component={RouterLink} to="/shop?category=frames" variant="outlined" 
                                    sx={{ 
                                        height: '56px', px: 4, borderRadius: '16px', fontSize: '16px', fontWeight: 700,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.02)',
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)' }
                                    }}
                                >
                                    Explore Gallery
                                </Button>
                            </Stack>

                            <Stack direction="row" spacing={3} sx={{ mt: 6 }}>
                                {[
                                    { label: 'Happy Users', val: '10k+' },
                                    { label: 'Total Gifts', val: '50k+' },
                                    { label: 'Fast delivery', val: '24h' }
                                ].map((stat) => (
                                    <Box key={stat.label}>
                                        <Typography sx={{ fontWeight: 800, fontSize: '20px', color: 'primary.main' }}>{stat.val}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{stat.label}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </motion.div>
                    </Box>

                    <Box sx={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            style={{ position: 'relative', width: '100%', maxWidth: '500px' }}
                        >
                            <Box sx={{ 
                                position: 'relative',
                                borderRadius: '32px',
                                overflow: 'visible',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: -2,
                                    borderRadius: '34px',
                                    padding: '2px',
                                    background: 'linear-gradient(135deg, rgba(108,99,255,0.5), rgba(156,77,255,0.2))',
                                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'xor',
                                    maskComposite: 'exclude',
                                }
                            }}>
                                <img 
                                    src={getPublicUrl("/assets/hero.png")} 
                                    alt="Artexa Premium Product" 
                                    style={{ width: '100%', borderRadius: '32px', display: 'block' }}
                                />
                                
                                {/* Floating mini images */}
                                <motion.div 
                                    className="float"
                                    style={{ 
                                        position: 'absolute', top: '-10%', right: '-5%', width: '120px',
                                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                                        padding: '10px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)'
                                    }}
                                >
                                    <img src={getPublicUrl("/assets/cat_frames.png")} style={{ width: '100%', borderRadius: '10px' }} alt="" />
                                </motion.div>
                                <motion.div 
                                    className="float"
                                    style={{ 
                                        position: 'absolute', bottom: '10%', left: '-10%', width: '100px',
                                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                                        padding: '10px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)',
                                        animationDelay: '1s'
                                    }}
                                >
                                    <img src={getPublicUrl("/assets/cat_mugs.png")} style={{ width: '100%', borderRadius: '10px' }} alt="" />
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Box>
                </Box>

                {/* FEATURED CATEGORIES */}
                <Box sx={{ py: { xs: 4, md: 6 } }}>
                    <Typography variant="h2" sx={{ mb: 3 }}>Popular Categories</Typography>
                    <Grid container spacing={1.5}>
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
                                            borderRadius: '16px', cursor: 'pointer', overflow: 'hidden', 
                                            position: 'relative', border: 'none',
                                            bgcolor: 'rgba(18, 26, 47, 0.4)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            p: 2, textAlign: 'center'
                                        }}
                                    >
                                        <Box sx={{ width: 64, height: 64, mb: 1.5, borderRadius: '50%', overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.05)' }}>
                                            <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{cat.name}</Typography>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* FEATURED COLLECTIONS (Best Sellers) */}
                <Box sx={{ py: { xs: 4, md: 6 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h2">Best Sellers</Typography>
                        <Button color="primary" size="small" onClick={() => navigate('/shop')} sx={{ fontWeight: 600 }}>See All</Button>
                    </Stack>
                    
                    <Grid container spacing={1.5}>
                        {loading ? (
                             [1,2,3,4].map(i => <Grid item xs={6} sm={4} md={3} key={i}><Box sx={{ height: 280, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} /></Grid>)
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

                {/* LIVE CUSTOMIZATION BANNER */}
                <Box sx={{ py: { xs: 4, md: 6 } }}>
                    <Paper sx={{ 
                        p: { xs: 3, md: 5 }, borderRadius: '16px', 
                        background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(156, 77, 255, 0.1) 100%)',
                        border: '1px solid rgba(108, 99, 255, 0.2)',
                        textAlign: 'center'
                    }}>
                        <Typography variant="h2" sx={{ mb: 1 }}>Design Your Own</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
                            Upload a photo, add text, and see a live preview instantly.
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/shop?category=frames')} sx={{ height: '48px', borderRadius: '12px', px: 4, fontWeight: 700 }}>
                            Start Designing
                        </Button>
                    </Paper>
                </Box>

                {/* AI GIFT RECOMMENDATION TOOL */}
                <Box sx={{ py: { xs: 4, md: 6 } }}>
                    <Typography variant="h2" sx={{ mb: 3 }}>AI Gift Matchmaker</Typography>
                    <Paper sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(18, 26, 47, 0.8)', border: '1px solid rgba(108, 99, 255, 0.3)' }}>
                        <Stack spacing={2}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Who are you shopping for?</Typography>
                            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                                {['For Girlfriend', 'For Mom', 'For Friend'].map(filter => (
                                    <Chip key={filter} label={filter} sx={{ bgcolor: 'rgba(255,255,255,0.08)', fontWeight: 600, color: 'white', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                                ))}
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Occasion?</Typography>
                            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                                {['Birthday', 'Anniversary', 'Farewell'].map(filter => (
                                    <Chip key={filter} label={filter} sx={{ bgcolor: 'rgba(255,255,255,0.08)', fontWeight: 600, color: 'white', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                                ))}
                            </Box>
                            <Button 
                                variant="contained" 
                                fullWidth 
                                sx={{ 
                                    borderRadius: '12px', 
                                    height: '48px',
                                    background: 'linear-gradient(90deg, #6C63FF 0%, #9C4DFF 100%)',
                                    fontWeight: 700,
                                    mt: 2,
                                    boxShadow: '0 4px 15px rgba(108, 99, 255, 0.3)'
                                }}
                            >
                                Get AI Recommendations
                            </Button>
                        </Stack>
                    </Paper>
                </Box>

                {/* TRENDING GIFTS */}
                <Box sx={{ py: { xs: 4, md: 6 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h2">Trending Gifts</Typography>
                    </Stack>
                    
                    <Grid container spacing={1.5}>
                        {products.length > 4 ? products.slice(4, 8).map((product, index) => (
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
                        )) : (
                            <Grid item xs={12}><Typography variant="body2" color="text.secondary">More products arriving soon.</Typography></Grid>
                        )}
                    </Grid>
                </Box>

                {/* CUSTOMER REVIEWS */}
                <Box sx={{ py: { xs: 4, md: 6 } }}>
                    <Typography variant="h2" sx={{ mb: 3 }}>Customer Reviews</Typography>
                    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, snapType: 'x mandatory', '&::-webkit-scrollbar': { display: 'none' } }}>
                        {REVIEWS.map((rev, i) => (
                            <Card key={rev.name} sx={{ 
                                minWidth: 260, maxWidth: 300, p: 2.5, borderRadius: '16px', scrollSnapAlign: 'start', flexShrink: 0,
                                bgcolor: 'rgba(18, 26, 47, 0.6)', border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <Rating value={rev.rating} readOnly size="small" sx={{ mb: 1.5 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 2, fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', minHeight: '3em' }}>"{rev.text}"</Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '14px', fontWeight: 600 }}>{rev.avatar}</Avatar>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{rev.name}</Typography>
                                    </Box>
                                </Stack>
                            </Card>
                        ))}
                    </Box>
                </Box>
                
                {/* INSTAGRAM GALLERY */}
                <Box sx={{ py: { xs: 4, md: 6 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h2">@ArtexaGifts on Instagram</Typography>
                        <Button color="primary" size="small" sx={{ fontWeight: 600 }}>Follow Us</Button>
                    </Stack>
                    <Grid container spacing={1}>
                        {[1, 2, 3, 4].map((i) => (
                            <Grid item xs={6} md={3} key={i}>
                                <Box sx={{ 
                                    aspectRatio: '1', 
                                    borderRadius: '16px', 
                                    overflow: 'hidden',
                                    position: 'relative',
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    backgroundImage: `url(https://picsum.photos/seed/insta${i}/400/400)`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    '&:hover .insta-overlay': { opacity: 1 }
                                }}>
                                    <Box className="insta-overlay" sx={{ 
                                        position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer'
                                    }}>
                                        <FavoriteIcon sx={{ color: 'white' }} />
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {/* FLOATING ACTION BUTTON */}
            <Tooltip title="Chat with Support">
                <Fab 
                    color="primary" 
                    aria-label="chat" 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 16, 
                        right: 16, 
                        width: 48, 
                        height: 48,
                        boxShadow: '0 4px 20px rgba(108, 99, 255, 0.4)',
                        background: 'linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%)'
                    }}
                >
                    <ChatBubbleIcon />
                </Fab>
            </Tooltip>
        </Box>
    );
};

export default Home;
