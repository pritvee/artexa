import { useEffect } from 'react';
import {
    Container, Typography, Grid, Box, Button,
    Card, Paper, Stack, Rating, Avatar,
    Fab, Tooltip
} from '@mui/material';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useProducts } from '../store/ProductContext';
import ProductCard from '../components/ProductCard';
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
    
    // Smooth Mouse Parallax Engine (Optimized for performance)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 30, mass: 0.2 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 30, mass: 0.2 });
    const rotateXHero = useTransform(smoothMouseY, (v) => v * -0.03);
    const rotateYHero = useTransform(smoothMouseX, (v) => v * 0.03);
    const rotateXProduct = useTransform(smoothMouseY, (v) => v * 0.15);
    const rotateYProduct = useTransform(smoothMouseX, (v) => v * -0.15);

    // Scroll-based animations (Tightened for stability)
    const { scrollY } = useScroll();
    const springConfig = { stiffness: 180, damping: 40, mass: 1 }; // Increased stiffness/damping to stop "grouping"
    
    // Clean non-zoom Scroll Animations (Clamped to prevent overscroll artifacts)
    const foregroundOpacity = useSpring(useTransform(scrollY, [0, 150], [1, 0], { clamp: true }), springConfig);
    const foregroundY = useSpring(useTransform(scrollY, [0, 200], [0, -60], { clamp: true }), springConfig);
    
    const backgroundScale = 1;
    const backgroundZ = 0;
    const dynamicPerspective = useSpring(useTransform(scrollY, [0, 500], [2000, 3000]), springConfig);
    const glowExpansion = useSpring(useTransform(scrollY, [0, 600], [1, 1.1], { clamp: true }), springConfig);
    
    // Dynamic Parallax for Model Cards
    const card1Y = useSpring(useTransform(scrollY, [0, 400], [0, -40], { clamp: true }), springConfig);
    const card2Y = useSpring(useTransform(scrollY, [0, 400], [0, 50], { clamp: true }), springConfig);

    useEffect(() => {
        fetchProducts(1, 10, null, '', true); 
        
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth - 0.5) * 10; // Lowered from 20
            const y = (clientY / window.innerHeight - 0.5) * 10;
            mouseX.set(x);
            mouseY.set(y);
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [fetchProducts, mouseX, mouseY]);

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
            zIndex: 10
        }
    };

    return (
        <Box sx={{ bgcolor: 'transparent', pb: 10, position: 'relative' }}>
            {/* CINEMATIC LIGHT SOURCE (OPTIMIZED) */}
            <Box 
                component={motion.div}
                style={{ opacity: useTransform(glowExpansion, [1, 1.35], [0.5, 0.9]) }}
                sx={{
                    position: 'fixed',
                    top: '-15%', left: '-10%',
                    width: '60vw', height: '60vw',
                    background: 'radial-gradient(circle at center, rgba(108, 99, 255, 0.1) 0%, transparent 65%)',
                    zIndex: 0, pointerEvents: 'none', willChange: 'opacity'
                }} 
            />

            {/* Promo Banner */}
            <Box sx={{ 
                background: 'rgba(124, 77, 255, 0.05)', backdropFilter: 'blur(8px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', py: 1.2, 
                textAlign: 'center', fontSize: '13px', fontWeight: 800, position: 'relative', zIndex: 10,
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
            }}>
                <motion.div animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity }}>
                    ✨ Experience Premium Gifting · Free shipping on orders over ₹1000
                </motion.div>
            </Box>

            <Container maxWidth="xl" component={motion.div} style={{ perspective: dynamicPerspective }} sx={{ px: { xs: 2, sm: 3, md: 5 } }}>
                {/* HERO SECTION */}
                <Box 
                    component={motion.div}
                    initial="hidden"
                    animate="show"
                    style={{ 
                        opacity: foregroundOpacity, 
                        y: foregroundY
                    }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: { 
                            opacity: 1,
                            transition: { staggerChildren: 0.1, delayChildren: 0.15 }
                        }
                    }}
                    sx={{ 
                        py: { xs: 8, md: 24 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, 
                        alignItems: 'center', gap: { xs: 12, md: 10 }, position: 'relative', zIndex: 2,
                        willChange: 'transform, opacity'
                    }}
                >
                    <Box 
                        sx={{ flex: 1.3, zIndex: 20, perspective: '2000px' }}
                    >
                        <motion.div 
                            style={{ rotateX: rotateXHero, rotateY: rotateYHero, transformStyle: 'preserve-3d' }}
                        >
                            <motion.div variants={itemVariants}>
                                <Box sx={{ 
                                    display: 'inline-flex', alignItems: 'center', gap: 1.5, px: 3, py: 1.2, 
                                    borderRadius: '100px', background: 'rgba(108, 99, 255, 0.1)', 
                                    border: '1px solid rgba(108, 99, 255, 0.2)', mb: 6, backdropFilter: 'blur(12px)'
                                }}>
                                    <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#6C63FF', boxShadow: '0 0 25px rgba(108, 99, 255, 1)' }} />
                                    </motion.div>
                                    <Typography variant="caption" sx={{ color: '#A5B4FC', fontWeight: 950, letterSpacing: '0.2em', fontSize: '11px' }}>PREMIUM CUSTOM GIFTS</Typography>
                                </Box>
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                                <Typography variant="h1" sx={{ 
                                    fontSize: { xs: '58px', md: '108px' }, fontWeight: 950, mb: 4, lineHeight: 0.85,
                                    letterSpacing: '-0.075em', color: '#fff'
                                }}>
                                    Gift the <Box component="span" sx={{ 
                                        background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 50%, #FF7A59 100%)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                        filter: 'drop-shadow(0 0 50px rgba(108, 99, 255, 0.45))'
                                    }}>Extraordinary</Box>
                                </Typography>
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                                <Typography variant="h3" sx={{ 
                                    mb: 10, fontWeight: 400, maxWidth: 680, fontSize: { xs: '20px', md: '26px' },
                                    color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, opacity: 0.85
                                }}>
                                    Elevate your memories with Artexa&apos;s premium custom photo gifts. Designed for those who appreciate the finer things.
                                </Typography>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                    <Button 
                                        component={RouterLink} to="/shop" variant="contained" 
                                        sx={{ 
                                            height: '80px', px: 8, borderRadius: '24px', fontSize: '21px', fontWeight: 950,
                                            background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)',
                                            boxShadow: '0 30px 60px rgba(108, 99, 255, 0.45)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                            '&:hover': { transform: 'translateY(-8px) scale(1.03)', boxShadow: '0 40px 80px rgba(108, 99, 255, 0.6)' }
                                        }}
                                    >
                                        Start Creating
                                    </Button>
                                    <Button 
                                        component={RouterLink} to="/shop?category=frames" variant="outlined" 
                                        sx={{ 
                                            height: '80px', px: 8, borderRadius: '24px', fontSize: '21px', fontWeight: 950,
                                            border: '1.5px solid rgba(255, 255, 255, 0.25)', background: 'rgba(255, 255, 255, 0.05)',
                                            backdropFilter: 'blur(40px)', color: '#fff', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                            '&:hover': { background: 'rgba(255, 255, 255, 0.1)', transform: 'translateY(-8px) scale(1.03)', border: '1.5px solid #fff' }
                                        }}
                                    >
                                        Explore Gallery
                                    </Button>
                                </Stack>
                            </motion.div>

                            <Stack direction="row" spacing={8} sx={{ mt: 14 }}>
                                {[
                                    { label: 'Happy Users', val: '10k+' },
                                    { label: 'Total Gifts', val: '50k+' },
                                    { label: 'Delivery', val: '24h' }
                                ].map((stat) => (
                                    <Box key={stat.label}>
                                        <Typography sx={{ fontWeight: 950, fontSize: '42px', color: '#fff', letterSpacing: '-0.05em' }}>{stat.val}</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', fontWeight: 800, letterSpacing: '0.2em', fontSize: '13px', textTransform: 'uppercase' }}>{stat.label}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </motion.div>
                    </Box>

                    <Box sx={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: '4000px' }}>
                        <motion.div 
                            style={{ 
                                rotateY: rotateYProduct, 
                                rotateX: rotateXProduct, 
                                z: backgroundZ, 
                                scale: backgroundScale,
                                position: 'relative', width: '100%', maxWidth: '750px', transformStyle: 'preserve-3d' 
                            }}
                        >
                            <Box 
                                sx={{ 
                                    position: 'relative', borderRadius: '70px', background: 'rgba(255, 255, 255, 0.04)',
                                    backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255, 255, 255, 0.08)',
                                    padding: '16px', transformStyle: 'preserve-3d', willChange: 'transform',
                                    transform: 'translate3d(0,0,0)'
                                }}
                            >
                                <motion.div animate={{ y: [0, -25, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
                                    <img src={getPublicUrl("/assets/hero.png")} alt="Hero" style={{ width: '100%', borderRadius: '54px', display: 'block' }} />
                                </motion.div>
                                
                                <motion.div 
                                    animate={{ y: [0, -45, 0], rotate: [0, 10, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    style={{ 
                                        x: useTransform(smoothMouseX, (v) => v * 2.5),
                                        y: card1Y,
                                        position: 'absolute', top: '-15%', right: '-12%', width: '210px',
                                        background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
                                        padding: '16px', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.2)',
                                        zIndex: 40, transformStyle: 'preserve-3d', transform: 'translate3d(0,0,0)'
                                    }}
                                >
                                    <img src={getPublicUrl("/assets/cat_frames.png")} style={{ width: '100%', borderRadius: '28px' }} alt="" />
                                </motion.div>

                                <motion.div 
                                    animate={{ y: [0, 45, 0], rotate: [0, -10, 0] }}
                                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    style={{ 
                                        x: useTransform(smoothMouseX, (v) => v * -1.8),
                                        y: card2Y,
                                        position: 'absolute', bottom: '10%', left: '-18%', width: '190px',
                                        background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
                                        padding: '16px', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.2)',
                                        zIndex: 40, transformStyle: 'preserve-3d', transform: 'translate3d(0,0,0)'
                                    }}
                                >
                                    <img src={getPublicUrl("/assets/cat_mugs.png")} style={{ width: '100%', borderRadius: '28px' }} alt="" />
                                </motion.div>

                                <Box component={motion.div} style={{ opacity: useTransform(glowExpansion, [1, 1.3], [0.8, 1]) }} sx={{ position: 'absolute', top: '50%', left: '50%', width: '120%', height: '120%', transform: 'translate(-50%, -50%) translateZ(-50px)', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 60%)', zIndex: -1, borderRadius: '50%' }} />
                            </Box>
                        </motion.div>
                    </Box>
                </Box>

                {/* CATEGORIES */}
                <Box sx={{ py: { xs: 12, md: 20 }, position: 'relative' }}>
                    <Typography variant="h2" sx={{ mb: 10, fontSize: { xs: '38px', md: '56px' }, fontWeight: 950, color: '#fff', textAlign: 'center' }}>
                        Explore Our <Box component="span" sx={{ background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Popular Categories</Box>
                    </Typography>

                    <Grid container spacing={{ xs: 3, md: 5 }} justifyContent="center">
                        {CATEGORIES_DATA.map((cat, i) => (
                            <Grid item xs={12} sm={6} md={3} key={cat.name}>
                                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                                    <Card 
                                        onClick={() => navigate(cat.path)}
                                        sx={{ 
                                            borderRadius: '24px', cursor: 'pointer', p: { xs: 5, md: 6 }, textAlign: 'center',
                                            background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', 
                                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', transform: 'translate3d(0,0,0)',
                                            '&:hover': { background: 'rgba(255, 255, 255, 0.08)', transform: 'translate3d(0,-8px,0) scale(1.05)' }
                                        }}
                                    >
                                        <Box sx={{ width: 110, height: 110, mx: 'auto', mb: 4, borderRadius: '30%', overflow: 'hidden', bgcolor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={cat.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={cat.name} />
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 950, color: '#fff', fontSize: '22px' }}>{cat.name}</Typography>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* BEST SELLERS */}
                <Box sx={{ py: { xs: 8, md: 10 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
                        <Typography variant="h2" sx={{ fontSize: { xs: '32px', md: '48px' }, fontWeight: 900, color: '#fff' }}>
                             <Box component="span" sx={{ background: 'linear-gradient(135deg, #FF7A59 0%, #FF4D9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Best</Box> Sellers
                        </Typography>
                        <Button onClick={() => navigate('/shop')} sx={{ fontWeight: 800, color: '#FF4D9D' }}>View All →</Button>
                    </Stack>
                    
                    <Grid container spacing={4}>
                        {loading ? ([1,2,3,4].map(i => <Grid item xs={6} sm={4} md={3} key={i}><Box sx={{ height: 350, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '24px' }} /></Grid>)) : (
                            products.slice(0, 4).map((product, index) => (
                                <Grid item xs={6} sm={4} md={3} key={product.id}>
                                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                                        <ProductCard product={product} />
                                    </motion.div>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Box>

                {/* CTA */}
                <Box sx={{ py: { xs: 8, md: 15 } }}>
                    <Paper sx={{ p: { xs: 6, md: 12 }, borderRadius: '50px', background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                        <Typography variant="h1" sx={{ mb: 3, fontSize: { xs: '38px', md: '72px' }, fontWeight: 950, color: '#fff' }}>Your Memory, Our Masterpiece</Typography>
                        <Button onClick={() => navigate('/shop')} variant="contained" sx={{ height: '72px', borderRadius: '22px', px: 8, background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)' }}>Start Designing Now</Button>
                    </Paper>
                </Box>

                {/* REVIEWS */}
                <Box sx={{ py: { xs: 8, md: 15 } }}>
                    <Typography variant="h2" sx={{ mb: 8, fontWeight: 950, color: '#fff', fontSize: { xs: '36px', md: '56px' } }}>What Our Users Say</Typography>
                    <Box sx={{ display: 'flex', gap: 4, overflowX: 'auto', pb: 6 }}>
                        {REVIEWS.map((rev, i) => (
                            <motion.div key={rev.name} initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}>
                                <Card sx={{ ...glassStyle, minWidth: { xs: 300, md: 380 }, p: 5, borderRadius: '40px' }}>
                                    <Rating value={rev.rating} readOnly size="small" sx={{ mb: 3 }} />
                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 5, color: '#fff' }}>&quot;{rev.text}&quot;</Typography>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar>{rev.avatar}</Avatar>
                                        <Typography variant="body1" sx={{ fontWeight: 900, color: '#fff' }}>{rev.name}</Typography>
                                    </Stack>
                                </Card>
                            </motion.div>
                        ))}
                    </Box>
                </Box>
            </Container>

            <Tooltip title="Support">
                <Fab color="primary" sx={{ position: 'fixed', bottom: 30, right: 30, width: 64, height: 64, background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)' }}>
                    <ChatBubbleIcon />
                </Fab>
            </Tooltip>
        </Box>
    );
};

export default Home;
