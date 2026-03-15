import React, { useEffect } from 'react';
import {
    Container, Typography, Grid, Box, Button,
    Card, CardMedia, Chip, Paper, Stack,
    Rating, Avatar, Divider, TextField
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useProducts } from '../store/ProductContext';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import TimerIcon from '@mui/icons-material/Timer';
import { getPublicUrl } from '../api/axios';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: { 
            duration: 0.5, 
            ease: [0.22, 1, 0.36, 1] 
        }
    }
};

const CATEGORIES_DATA = [
    { name: 'Frames',   img: getPublicUrl('/assets/cat_frames.png'), count: 24, path: '/shop?category=frames' },
    { name: 'Mugs',     img: getPublicUrl('/assets/cat_mugs.png'),   count: 18, path: '/shop?category=mugs' },
    { name: 'Hampers',  img: getPublicUrl('/assets/perfect_chocolate_hamper.png'), count: 12, path: '/shop?category=hampers' },
    { name: 'Gifts',    img: getPublicUrl('/assets/luxury_giftbox.png'), count: 32, path: '/shop?category=gifts' },
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
        fetchProducts(1, 8, null, '', true); 
    }, []);

    return (
        <Box sx={{ bgcolor: 'background.default', pb: 10 }}>
            {/* 1. Promotional Banner */}
            <Box sx={{ 
                background: 'linear-gradient(90deg, #7C3AED 0%, #EC4899 100%)', 
                color: '#fff', py: 1.5, textAlign: 'center', fontSize: '0.8rem', fontWeight: 800,
                letterSpacing: '0.1em', textTransform: 'uppercase'
            }}>
                <motion.div animate={{ opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                    ✨ 20% OFF on All Custom Frames | Use: <Box component="span" sx={{ bgcolor: 'rgba(0,0,0,0.2)', px: 1.5, py: 0.2, borderRadius: 1.5, ml: 1 }}>MEMORIES20</Box>
                </motion.div>
            </Box>

            <Container maxWidth="xl">
                {/* 2. Hero Section */}
                <Grid container spacing={8} sx={{ py: { xs: 8, md: 15 }, alignItems: 'center', minHeight: '90vh' }}>
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
                            <Box sx={{ mb: 3 }}>
                                <Chip label="Handcrafted with Love" color="primary" sx={{ borderRadius: 2, fontWeight: 900, px: 1 }} />
                            </Box>
                            <Typography variant="h1" sx={{ 
                                fontSize: { xs: '3.5rem', md: '5.5rem' }, 
                                fontWeight: 900, mb: 3, lineHeight: 1,
                                letterSpacing: '-0.04em'
                            }}>
                                Gift the <Box component="span" sx={{ color: 'primary.main', position: 'relative' }}>
                                    Extraordinary
                                    <Box sx={{ position: 'absolute', bottom: 10, left: 0, width: '100%', height: 8, bgcolor: 'secondary.main', opacity: 0.2, borderRadius: 4, zIndex: -1 }} />
                                </Box>
                            </Typography>
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 550, lineHeight: 1.8, fontSize: '1.25rem', fontWeight: 600 }}>
                                Transform your digital moments into physical masterpieces. Artisanal gifts designed to last a lifetime.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                <Button 
                                    component={RouterLink} to="/shop" variant="contained" size="large" 
                                    sx={{ 
                                        px: { xs: 4, md: 8 }, py: 2.5, borderRadius: '20px', fontSize: { xs: '1rem', md: '1.2rem' }, fontWeight: 900,
                                        boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.4)'
                                    }}
                                >
                                    Start Creating
                                </Button>
                                <Button 
                                    component={RouterLink} to="/shop?category=frames" variant="outlined" size="large" 
                                    sx={{ px: { xs: 4, md: 6 }, py: 2.5, borderRadius: '20px', fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 800 }}
                                >
                                    View Gallery
                                </Button>
                            </Stack>

                            <Stack direction="row" spacing={4} sx={{ mt: 8, opacity: 0.7 }}>
                                {[
                                    { icon: <LocalShippingIcon />, label: 'Express Delivery' },
                                    { icon: <VerifiedIcon />, label: 'Premium Quality' },
                                    { icon: <TimerIcon />, label: '24h Dispatch' }
                                ].map((item, idx) => (
                                    <Box key={item.label} sx={{ textAlign: 'center' }}>
                                        <Box sx={{ mb: 1, color: 'primary.main' }}>{item.icon}</Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800 }}>{item.label}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </motion.div>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <motion.div 
                            initial="hidden"
                            whileInView="show"
                            variants={fadeUp}
                            viewport={{ once: true }}
                        >
                            <Box sx={{ position: 'relative' }}>
                                {/* Floating decorative elements */}
                                <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ position: 'absolute', top: -40, right: 20, zIndex: 1 }}>
                                    <Box className="glass" sx={{ p: 2, borderRadius: 4 }}>
                                        <Typography sx={{ fontWeight: 900, color: 'primary.main', fontSize: '0.8rem' }}>⭐ 4.9 Rating</Typography>
                                    </Box>
                                </motion.div>
                                
                                <Box className="heroFloat" sx={{ 
                                    borderRadius: 4, overflow: 'hidden',
                                    boxShadow: '0 60px 120px -20px rgba(0,0,0,0.15)',
                                    transform: 'perspective(1000px) rotateY(-5deg)',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                                    p: 1.5, border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                }}>
                                    <img 
                                        src={getPublicUrl("/assets/hero.png")} 
                                        alt="Premium Gifts" 
                                        loading="lazy"
                                        style={{ width: '100%', borderRadius: '14px', display: 'block' }} 
                                    />
                                </Box>
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>

                {/* 3. Categories Grid */}
                <Box sx={{ mb: { xs: 10, md: 20 } }}>
                    <Box sx={{ mb: { xs: 4, md: 8 }, textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3.75rem' } }}>The Gift Studio</Typography>
                        <Divider sx={{ width: 60, height: 4, bgcolor: 'primary.main', mx: 'auto', borderRadius: 2 }} />
                    </Box>
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {CATEGORIES_DATA.map((cat, i) => (
                            <Grid item xs={6} md={3} key={cat.name}>
                                <motion.div 
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="card3d"
                                >
                                    <Card 
                                        onClick={() => navigate(cat.path)}
                                        className="glass"
                                        sx={{ 
                                            borderRadius: 2, cursor: 'pointer', overflow: 'hidden', 
                                            height: { xs: 220, md: 350 },
                                            position: 'relative', border: 'none',
                                            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <img 
                                            src={cat.img} 
                                            alt={cat.name} 
                                            loading="lazy"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                        <Box sx={{ 
                                            position: 'absolute', inset: 0, 
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                                            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                            p: { xs: 2, md: 4 }
                                        }}>
                                            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '1.2rem', md: '2rem' } }}>{cat.name}</Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: { xs: '0.7rem', md: '1rem' } }}>{cat.count}+ Products</Typography>
                                        </Box>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* 4. Trending Products */}
                <Box sx={{ mb: 20 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 8 }}>
                        <Box>
                            <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '2.5rem', md: '3.75rem' } }}>Trending Now</Typography>
                            <Typography color="text.secondary" sx={{ fontWeight: 700 }}>Most loved gifts this month</Typography>
                        </Box>
                        <Button 
                            color="primary" 
                            sx={{ fontWeight: 900, fontSize: '1.1rem' }} 
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate('/shop')}
                        >
                            See All
                        </Button>
                    </Box>
                    
                    <Grid container spacing={{ xs: 2, md: 4 }}>
                        {loading ? (
                             [1,2,3,4].map(i => <Grid item xs={6} sm={6} md={3} key={i}><Box sx={{ height: { xs: 250, md: 400 }, bgcolor: 'background.paper', borderRadius: 2, opacity: 0.5 }} /></Grid>)
                        ) : (
                            products.slice(0, 8).map((product, index) => (
                                <Grid item xs={6} sm={6} md={3} key={product.id}>
                                    <motion.div 
                                        variants={fadeUp}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true, margin: "50px" }}
                                        transition={{ delay: (index % 4) * 0.1 }}
                                        className="card3d"
                                    >
                                        <Card className="glass" sx={{ 
                                            height: '100%', 
                                            borderRadius: 2, 
                                            p: { xs: 1.5, md: 2 }, 
                                            transition: 'all 0.3s', 
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <Box sx={{ 
                                                position: 'relative', 
                                                height: { xs: 180, md: 280 }, 
                                                borderRadius: 2, 
                                                overflow: 'hidden', 
                                                bgcolor: 'background.default', 
                                                mb: { xs: 1.5, md: 3 } 
                                            }}>
                                                <CardMedia component="img" image={getPublicUrl(product.image_url)} loading="lazy" sx={{ height: '100%', objectFit: 'cover' }} />
                                                <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
                                                    <Chip 
                                                        label="Bestseller" 
                                                        className="glass"
                                                        sx={{ 
                                                            fontWeight: 900, 
                                                            fontSize: '0.6rem',
                                                            height: 20
                                                        }} 
                                                        size="small" 
                                                    />
                                                </Box>
                                            </Box>
                                            <Box sx={{ px: 0.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="body1" sx={{ fontWeight: 900, mb: 0.5, fontSize: { xs: '0.9rem', md: '1.1rem' }, lineHeight: 1.2, minHeight: { xs: '2.4em', md: 'auto' } }}>
                                                    {product.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mt: 'auto', mb: 2, gap: 0.5 }}>
                                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 900, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>₹{(product.price || 0).toFixed(0)}</Typography>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <Rating value={5} readOnly size="small" sx={{ fontSize: '0.8rem' }} />
                                                    </Stack>
                                                </Box>
                                                <Button 
                                                    className="btn"
                                                    variant="contained" 
                                                    component={RouterLink}
                                                    to={`/product/${product.id}`}
                                                    fullWidth
                                                    sx={{ 
                                                        borderRadius: 2, 
                                                        px: 2,
                                                        py: { xs: 0.8, md: 1.2 },
                                                        fontWeight: 900,
                                                        fontSize: { xs: '0.7rem', md: '0.85rem' },
                                                        boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.3)'
                                                    }}
                                                >
                                                    Customize
                                                </Button>
                                            </Box>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Box>

                {/* 5. Reviews */}
                <Box sx={{ mb: 20 }}>
                    <Grid container spacing={4}>
                        {REVIEWS.map((rev, i) => (
                            <Grid item xs={12} md={4} key={rev.name}>
                                <Card sx={{ p: 5, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Rating value={rev.rating} readOnly sx={{ mb: 3 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>"{rev.text}"</Typography>
                                    </Box>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontWeight: 800 }}>{rev.avatar}</Avatar>
                                        <Box>
                                            <Typography sx={{ fontWeight: 900 }}>{rev.name}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>Verified Customer</Typography>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* 6. Newsletter */}
                <Paper sx={{ 
                    p: { xs: 6, md: 12 }, borderRadius: 2, 
                    background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                    color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden'
                }}>
                    {/* Decorative elements - Removed circles */}

                    <Typography variant="h2" sx={{ mb: 2, fontWeight: 900, fontSize: { xs: '2.5rem', md: '3.75rem' } }}>Join the Circle</Typography>
                    <Typography variant="h5" sx={{ mb: 8, opacity: 0.9, fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>Get curated gift ideas & 15% off your first order.</Typography>
                    
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ maxWidth: 650, mx: 'auto', position: 'relative', zIndex: 1 }}>
                        <TextField 
                            fullWidth 
                            placeholder="Enter your email" 
                            sx={{ 
                                bgcolor: '#fff', borderRadius: '24px',
                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '& input': { py: 2.5, px: 3, fontWeight: 600 }
                            }}
                        />
                        <Button variant="contained" size="large" sx={{ 
                            px: 8, bgcolor: '#1F2937', color: '#fff', borderRadius: '24px',
                            fontWeight: 900, '&:hover': { bgcolor: '#000' }
                        }}>
                            Subscribe
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};

export default Home;
