import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Box, Typography, TextField, 
    InputAdornment, Pagination, Stack, Skeleton,
    Breadcrumbs, Link, Chip, FormControl, InputLabel, Select, MenuItem, Card
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../store/ProductContext';
import ProductCard from '../components/ProductCard';

const Shop = () => {
    const [searchParams] = useSearchParams();
    const categoryQuery = searchParams.get('category');
    
    const { products, pagination, fetchProducts, loading, categoryMap } = useProducts();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Debounce search so we don't call API on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            const catId = categoryQuery ? categoryMap[categoryQuery.toLowerCase()] : null;
            fetchProducts(1, 12, catId, searchQuery, null, true);
        }, searchQuery ? 300 : 0); // No delay when category changes
        return () => clearTimeout(timer);
    }, [categoryQuery, searchQuery]);

    const handlePageChange = (event, value) => {
        const catId = categoryQuery ? categoryMap[categoryQuery.toLowerCase()] : null;
        fetchProducts(value, 12, catId, searchQuery, null, true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Apply client-side sorting to fetched results
    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'popular') return (b.id || 0) - (a.id || 0);
        return 0; // newest (default order from server)
    });

    const filteredProducts = sortedProducts;

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 6, md: 10 } }}>
            <Container maxWidth="xl">
                {/* Header Section */}
                <Box sx={{ mb: 8 }}>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                        <Link underline="hover" color="inherit" href="/" sx={{ fontWeight: 700, opacity: 0.6 }}>Home</Link>
                        <Typography color="primary" sx={{ fontWeight: 900 }}>Collection</Typography>
                    </Breadcrumbs>
                    <Typography variant="h1" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '3rem', md: '4.5rem' }, letterSpacing: '-0.04em' }}>
                        Curated Gifts
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.8 }}>
                        Find the perfect vessel for your most precious moments.
                    </Typography>
                </Box>

                {/* Filters & Search Toolbar */}
                <Card className="glass" sx={{ 
                    p: 2, mb: 6, borderRadius: '24px', 
                    display: 'flex', flexWrap: 'wrap', gap: 3, 
                    alignItems: 'center', justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(17, 24, 39, 0.4)'
                }}>
                    <TextField 
                        placeholder="Search our collection..." 
                        value={searchQuery}
                        onChange={handleSearch}
                        fullWidth={false}
                        sx={{ 
                            width: { xs: '100%', md: 450 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '18px',
                                bgcolor: 'background.default',
                                '& fieldset': { border: 'none' },
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ ml: 1 }}>
                                    <SearchIcon sx={{ color: 'primary.main', opacity: 0.5 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Stack direction="row" spacing={3} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase', opacity: 0.5, letterSpacing: '0.05em' }}>Sort</Typography>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                sx={{ 
                                    borderRadius: '16px', fontWeight: 700, bgcolor: 'background.default',
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                                }}
                            >
                                <MenuItem value="newest">Featured First</MenuItem>
                                <MenuItem value="price-low">Price: Low to High</MenuItem>
                                <MenuItem value="price-high">Price: High to Low</MenuItem>
                                <MenuItem value="popular">Most Popular</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Card>

                {/* Product Grid */}
                <Grid container spacing={{ xs: 2, md: 4 }}>
                    {loading ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <Grid item xs={6} sm={6} md={3} key={i}>
                                <Box sx={{ borderRadius: 2, p: 1.5, bgcolor: 'background.paper', height: { xs: 300, md: 400 }, opacity: 0.5 }}>
                                    <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 1.5 }} />
                                    <Skeleton width="80%" sx={{ mt: 2 }} />
                                    <Skeleton width="40%" />
                                </Box>
                            </Grid>
                        ))
                    ) : filteredProducts.length > 0 ? (
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => (
                                <Grid item xs={6} sm={6} md={3} key={product.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: (index % 4) * 0.1 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                </Grid>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 15 }}>
                                <SearchIcon sx={{ fontSize: 100, color: 'text.secondary', opacity: 0.1, mb: 3 }} />
                                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>No products found</Typography>
                                <Typography color="text.secondary" sx={{ fontWeight: 600 }}>Try adjusting your search or filters.</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>

                {/* Styled Pagination */}
                {pagination.total > pagination.limit && (
                    <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
                        <Pagination 
                            count={Math.ceil(pagination.total / pagination.limit)} 
                            page={pagination.page} 
                            onChange={handlePageChange} 
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontWeight: 900,
                                    borderRadius: '12px',
                                    height: 48,
                                    width: 48,
                                    margin: '0 6px',
                                    '&.Mui-selected': {
                                        background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                                        color: '#fff',
                                        '&:hover': { opacity: 0.9 }
                                    }
                                }
                            }}
                        />
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default Shop;
