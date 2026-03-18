import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider, Stack } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
    return (
        <Box component="footer" sx={{ 
            bgcolor: 'transparent', 
            pt: { xs: 10, md: 15 }, 
            pb: 6, 
            borderTop: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            zIndex: 1
        }}>
            <Container maxWidth="xl">
                <Grid container spacing={{ xs: 6, md: 10 }} sx={{ mb: 10 }}>
                    <Grid item xs={12} md={4}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: '#fff',
                                fontWeight: 900,
                                letterSpacing: '-0.05em',
                                mb: 3,
                                background: 'linear-gradient(135deg, #FFFFFF 0%, #6C63FF 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            ARTEXA
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4, maxWidth: 380, lineHeight: 1.8, fontSize: '1.05rem' }}>
                            Redefining the art of gifting through premium personalization and handcrafted excellence. Your memories, elevated.
                        </Typography>
                        <Stack direction="row" spacing={2.5}>
                            {[
                                { Icon: FacebookIcon, url: '#' },
                                { Icon: InstagramIcon, url: 'https://www.instagram.com/artexa.in/' },
                                { Icon: TwitterIcon, url: '#' }
                            ].map((social, i) => (
                                <IconButton 
                                    key={i} 
                                    component="a"
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.03)', 
                                        color: '#fff',
                                        width: 48, height: 48,
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.3s',
                                        '&:hover': { 
                                            bgcolor: '#6C63FF', 
                                            color: '#fff',
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 10px 20px rgba(108, 99, 255, 0.3)'
                                        }
                                    }}
                                >
                                    <social.Icon fontSize="small" />
                                </IconButton>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={6} sm={6} md={2}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 4, fontSize: '1.1rem' }}>Collections</Typography>
                        <Stack spacing={2.5}>
                            {[
                                { name: 'Photo Frames', path: '/shop?category=frames' },
                                { name: 'Custom Mugs', path: '/shop?category=mugs' },
                                { name: 'Gift Hampers', path: '/shop?category=hampers' },
                                { name: 'Crystal Cubes', path: '/shop?category=crystal' },
                                { name: 'New Arrivals', path: '/shop' }
                            ].map(link => (
                                <Link 
                                    key={link.name} 
                                    component={RouterLink} 
                                    to={link.path} 
                                    underline="none" 
                                    sx={{ 
                                        color: 'rgba(255,255,255,0.4)',
                                        fontWeight: 500, 
                                        transition: 'all 0.2s', 
                                        '&:hover': { color: '#6C63FF', pl: 1 } 
                                    }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={6} sm={6} md={2}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 4, fontSize: '1.1rem' }}>Company</Typography>
                        <Stack spacing={2.5}>
                            {['Our Story', 'Designers', 'Contact Us', 'Careers', 'Gift Cards'].map(link => (
                                <Link key={link} href="#" underline="none" sx={{ 
                                    color: 'rgba(255,255,255,0.4)',
                                    fontWeight: 500, 
                                    transition: 'all 0.2s', 
                                    '&:hover': { color: '#6C63FF', pl: 1 } 
                                }}>
                                    {link}
                                </Link>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 4, fontSize: '1.1rem' }}>The Atelier</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 2, mb: 4, fontSize: '0.95rem' }}>
                            123 Design Street, Creative Valley<br />
                            New Delhi, India 110001<br />
                            Email: hello@artexa.in<br />
                            Phone: +91 98765 43210
                        </Typography>
                        <Box sx={{ 
                            p: 2.5, 
                            borderRadius: '20px', 
                            bgcolor: 'rgba(255,255,255,0.02)', 
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2 
                        }}>
                            <Box sx={{ 
                                width: 12, height: 12, borderRadius: '50%', 
                                bgcolor: '#10b981',
                                boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
                                animation: 'pulse 2s infinite'
                            }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.02em' }}>
                                SYSTEM STATUS: ONLINE & OPERATIONAL
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mt: 6, gap: 3 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                        © {new Date().getFullYear()} Artexa Personalization Lab.
                    </Typography>
                    <Stack direction="row" spacing={4}>
                        {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(item => (
                            <Link key={item} href="#" underline="none" sx={{ 
                                color: 'rgba(255,255,255,0.3)', 
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                '&:hover': { color: '#fff' }
                            }}>
                                {item}
                            </Link>
                        ))}
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default Footer;
