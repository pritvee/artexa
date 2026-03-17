import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, Avatar, TextField, Button, Divider, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Stack } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../store/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';

const Profile = () => {
    const { user, logout } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip_code: '' });
    const [showAddrForm, setShowAddrForm] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await api.get('/users/me/addresses');
                setAddresses(res.data);
            } catch (err) {
                console.error("Failed to fetch addresses", err);
            }
        };
        if (user) fetchAddresses();
    }, [user]);

    const handleUpdateProfile = async () => {
        try {
            await api.patch('/users/me', { name, phone: phone });
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Failed to update profile");
        }
    };

    const handleAddAddress = async () => {
        try {
            const res = await api.post('/users/me/addresses', newAddress);
            setAddresses([...addresses, res.data]);
            setNewAddress({ street: '', city: '', state: '', zip_code: '' });
            setShowAddrForm(false);
        } catch (err) {
            alert("Failed to add address");
        }
    };

    const handleDeleteAddress = async (id) => {
        try {
            await api.delete(`/users/me/addresses/${id}`);
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (err) {
            alert("Failed to delete address");
        }
    };

    if (!user) return <ErrorState message="Please login to view your profile." onRetry={() => navigate('/login')} />;

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
            <Typography variant="h3" sx={{ 
                fontWeight: 900, 
                mb: 6,
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                My Profile
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper className="glass-card" sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Avatar sx={{ 
                            width: 120, 
                            height: 120, 
                            mx: 'auto', 
                            mb: 3, 
                            background: 'linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%)',
                            fontSize: 40,
                            boxShadow: '0 8px 32px rgba(108, 99, 255, 0.3)'
                        }}>
                            {name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{name}</Typography>
                        <Typography color="text.secondary" sx={{ mb: 4 }}>{email}</Typography>
                        
                        <Stack spacing={2}>
                            <Button fullWidth variant="contained" component={RouterLink} to="/orders" startIcon={<ReceiptLongIcon />} className="premium-gradient" sx={{ borderRadius: 3, py: 1.5 }}>
                                View My Orders
                            </Button>
                            <Button fullWidth variant="outlined" startIcon={<LockResetIcon />} sx={{ borderRadius: 3, py: 1.5, borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                Change Password
                            </Button>
                            <Button fullWidth variant="text" color="error" onClick={logout} sx={{ borderRadius: 3, py: 1.5 }}>
                                Logout Account
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Stack spacing={4}>
                        <Paper className="glass-card" sx={{ p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 2 }} />
                                Account Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} variant="filled" sx={{ bgcolor: 'rgba(255,255,255,0.03)' }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} variant="filled" sx={{ bgcolor: 'rgba(255,255,255,0.03)' }} />
                                    </Grid>
                                </Grid>
                                <TextField fullWidth label="Email Address" value={email} disabled variant="filled" sx={{ bgcolor: 'rgba(255,255,255,0.01)' }} />
                                <Button variant="contained" className="premium-gradient" size="large" sx={{ width: { xs: '100%', sm: 220 }, borderRadius: 3, py: 1.5 }} onClick={handleUpdateProfile}>
                                    Update Profile
                                </Button>
                            </Box>
                        </Paper>

                        <Paper className="glass-card" sx={{ p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 4, height: 24, bgcolor: 'secondary.main', borderRadius: 2 }} />
                                    Shipping Addresses
                                </Typography>
                                <Button startIcon={showAddrForm ? null : <AddIcon />} color={showAddrForm ? 'error' : 'primary'} onClick={() => setShowAddrForm(!showAddrForm)}>
                                    {showAddrForm ? 'Cancel' : 'Add New'}
                                </Button>
                            </Box>

                            <AnimatePresence>
                                {showAddrForm && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <Box sx={{ mb: 4, p: 3, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}><TextField fullWidth label="Street" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} variant="filled" /></Grid>
                                                <Grid item xs={6}><TextField fullWidth label="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} variant="filled" /></Grid>
                                                <Grid item xs={6}><TextField fullWidth label="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} variant="filled" /></Grid>
                                                <Grid item xs={12}><TextField fullWidth label="ZIP Code" value={newAddress.zip_code} onChange={e => setNewAddress({ ...newAddress, zip_code: e.target.value })} variant="filled" /></Grid>
                                            </Grid>
                                            <Button variant="contained" className="premium-gradient" sx={{ mt: 3, borderRadius: 3, px: 4 }} onClick={handleAddAddress}>Save Address</Button>
                                        </Box>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {addresses.map((addr) => (
                                    <ListItem key={addr.id} sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, p: 2 }}>
                                        <ListItemText
                                            primary={<Typography fontWeight={700}>{addr.street}</Typography>}
                                            secondary={<Typography variant="body2" color="text.secondary">{`${addr.city}, ${addr.state} - ${addr.zip_code}`}</Typography>}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" color="error" onClick={() => handleDeleteAddress(addr.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                                {addresses.length === 0 && (
                                    <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                        No addresses saved yet.
                                    </Typography>
                                )}
                            </List>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;

