import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider, Stack } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
    return (
        <Box component="footer" sx={{ 
            bgcolor: '#020617', 
            pt: { xs: 6, md: 10 }, 
            pb: 4, 
            borderTop: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            zIndex: 1
        }}>
            <Container maxWidth="xl">
                <Grid container spacing={{ xs: 4, md: 8 }} sx={{ mb: 8 }}>
                    <Grid item xs={12} md={4}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: '#fff',
                                fontWeight: 900,
                                letterSpacing: '-0.03em',
                                mb: 3
                            }}
                        >
                            Art<Box component="span" sx={{ color: '#7B61FF' }}>exa</Box>
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4, maxWidth: 350, lineHeight: 1.8 }}>
                            Handcrafted high-quality photo gifts for every occasion. We help you preserve your most precious memories through art and personalization.
                        </Typography>
                        <Stack direction="row" spacing={2}>
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
                                        bgcolor: 'rgba(255,255,255,0.05)', color: '#fff',
                                        '&:hover': { bgcolor: '#7B61FF', color: '#fff' }
                                    }}
                                >
                                    <social.Icon fontSize="small" />
                                </IconButton>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={6} sm={6} md={2}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 4 }}>Shop Gifts</Typography>
                        <Stack spacing={2}>
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
                                        color: 'rgba(255,255,255,0.5)',
                                        fontWeight: 500, 
                                        transition: 'color 0.2s', 
                                        '&:hover': { color: 'primary.main' } 
                                    }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={6} sm={6} md={2}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 4 }}>Company</Typography>
                        <Stack spacing={2}>
                            {['Our Story', 'Designers', 'Contact Us', 'Careers', 'Gift Cards'].map(link => (
                                <Link key={link} href="#" underline="none" sx={{ 
                                    color: 'rgba(255,255,255,0.5)',
                                    fontWeight: 500, transition: 'color 0.2s', '&:hover': { color: 'primary.main' } 
                                }}>
                                    {link}
                                </Link>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 4 }}>Visit Our Atelier</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 2, mb: 3 }}>
                            123 Design Street, Creative Valley<br />
                            New Delhi, India 110001<br />
                            Email: hello@artexa.in<br />
                            Phone: +91 98765 43210
                        </Typography>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>System Status: Online & Accepting Orders</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mt: 4, gap: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        © {new Date().getFullYear()} Artexa Personalization Lab. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.4)' }} variant="caption">Privacy Policy</Link>
                        <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.4)' }} variant="caption">Terms of Service</Link>
                        <Link href="#" underline="none" sx={{ color: 'rgba(255,255,255,0.4)' }} variant="caption">Refund Policy</Link>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default Footer;
