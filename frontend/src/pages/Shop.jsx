import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Box, Typography, TextField, 
    InputAdornment, Pagination, Stack, Skeleton,
    Chip, Select, MenuItem, IconButton, Fab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../store/ProductContext';
import ProductCard from '../components/ProductCard';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';

const CATEGORY_CHIPS = [
    { label: 'All', value: '' },
    { label: 'Frames', value: 'frames' },
    { label: 'Mugs', value: 'mugs' },
    { label: 'Hampers', value: 'hampers' },
    { label: 'Photo Gifts', value: 'gifts' },
    { label: 'Crystals', value: 'crystals' },
];

const Shop = () => {
    const [searchParams] = useSearchParams();
    const categoryQuery = searchParams.get('category');
    
    const { products, pagination, fetchProducts, loading, categoryMap } = useProducts();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [activeCategory, setActiveCategory] = useState(categoryQuery || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            const catId = activeCategory ? categoryMap[activeCategory.toLowerCase()] : null;
            fetchProducts(1, 12, catId, searchQuery, null, true);
        }, searchQuery ? 300 : 0);
        return () => clearTimeout(timer);
    }, [activeCategory, searchQuery]);

    const handlePageChange = (event, value) => {
        const catId = activeCategory ? categoryMap[activeCategory.toLowerCase()] : null;
        fetchProducts(value, 12, catId, searchQuery, null, true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        return 0;
    });

    return (
        <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', py: { xs: 2, md: 4 } }}>
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>

                {/* ── Page header ── */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h1" sx={{ fontSize: { xs: '22px', md: '32px' }, fontWeight: 800, mb: 0.5 }}>
                        Our Collection
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {pagination.total || 0} products available
                    </Typography>
                </Box>

                {/* ── Search Bar ── */}
                <TextField
                    fullWidth
                    placeholder="Search gifts, frames, mugs…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'rgba(18, 26, 47, 0.6)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            height: '48px',
                            '& fieldset': { border: 'none' },
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* ── Category Filter Chips (horizontal scroll) ── */}
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1.5, mb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                    {CATEGORY_CHIPS.map((cat) => (
                        <Chip
                            key={cat.value}
                            label={cat.label}
                            onClick={() => setActiveCategory(cat.value)}
                            sx={{
                                flexShrink: 0,
                                height: '36px',
                                px: 0.5,
                                fontWeight: 600,
                                fontSize: '13px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                bgcolor: activeCategory === cat.value
                                    ? 'primary.main'
                                    : 'rgba(255,255,255,0.07)',
                                color: activeCategory === cat.value ? 'white' : 'text.secondary',
                                border: activeCategory === cat.value
                                    ? '1px solid transparent'
                                    : '1px solid rgba(255,255,255,0.08)',
                                '&:hover': { bgcolor: activeCategory === cat.value ? 'primary.main' : 'rgba(255,255,255,0.12)' }
                            }}
                        />
                    ))}
                </Box>

                {/* ── Sort + Count Row ── */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {sortedProducts.length} results
                    </Typography>
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        size="small"
                        sx={{
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 600,
                            bgcolor: 'rgba(18, 26, 47, 0.6)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'text.primary',
                            height: '36px',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                        }}
                    >
                        <MenuItem value="newest">Featured</MenuItem>
                        <MenuItem value="price-low">Price: Low → High</MenuItem>
                        <MenuItem value="price-high">Price: High → Low</MenuItem>
                    </Select>
                </Stack>

                {/* ── Product Grid ── */}
                {loading ? (
                    <LoadingState type="product" />
                ) : sortedProducts.length > 0 ? (
                    <Grid container spacing={1.5}>
                        <AnimatePresence mode="popLayout">
                            {sortedProducts.map((product, index) => (
                                <Grid item xs={6} sm={4} md={3} key={product.id} sx={{ display: 'flex' }}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: (index % 8) * 0.05 }}
                                        style={{ width: '100%' }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                </Grid>
                            ))}
                        </AnimatePresence>
                    </Grid>
                ) : (
                    <ErrorState 
                        message="No gifts found here!" 
                        onRetry={() => {
                            setActiveCategory('');
                            setSearchQuery('');
                        }}
                    />
                )}

                {/* ── Pagination ── */}
                {pagination.total > pagination.limit && (
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={Math.ceil(pagination.total / pagination.limit)}
                            page={pagination.page}
                            onChange={handlePageChange}
                            size="medium"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    '&.Mui-selected': {
                                        background: 'linear-gradient(135deg, #6C63FF, #9C4DFF)',
                                        color: '#fff',
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
