import React from 'react';
import { Box, Skeleton, Grid, Container, Stack } from '@mui/material';

const LoadingState = ({ type = 'product' }) => {
    if (type === 'customizer') {
        return (
            <Container maxWidth="xl" sx={{ py: 6 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 6, mb: 2 }} />
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Skeleton variant="circular" width={40} height={40} />
                            <Skeleton variant="circular" width={40} height={40} />
                            <Skeleton variant="circular" width={40} height={40} />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Skeleton variant="text" width="80%" height={60} sx={{ mb: 4 }} />
                        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 4, mb: 3 }} />
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 3 }} />
                        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 4 }} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Grid item xs={6} sm={4} md={3} key={i}>
                        <Box sx={{ p: 2, borderRadius: 5, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 2 }} />
                            <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 3 }} />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default LoadingState;
