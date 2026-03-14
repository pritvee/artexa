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
    const [phone, setPhone] = useState(user?.phone_number || "");
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

    if (!user) return <Container sx={{ py: 8 }}><Typography>Please login to view profile.</Typography></Container>;

    return (
        <Container maxWidth="lg">
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>My Profile</Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                        <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 3, bgcolor: 'primary.main', fontSize: 40 }}>
                            {name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{name}</Typography>
                        <Typography color="text.secondary">{email}</Typography>
                        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button fullWidth variant="contained" component={RouterLink} to="/orders" startIcon={<ReceiptLongIcon />}>View My Orders</Button>
                            <Button fullWidth variant="outlined" startIcon={<LockResetIcon />}>Change Password</Button>
                            <Button fullWidth variant="text" color="error" onClick={logout}>Logout Account</Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Stack spacing={4}>
                        <Paper sx={{ p: 4, borderRadius: 4 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Account Information</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                                    <TextField fullWidth label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </Box>
                                <TextField fullWidth label="Email Address" value={email} disabled />
                                <Button variant="contained" size="large" sx={{ width: 220 }} onClick={handleUpdateProfile}>Update Information</Button>
                            </Box>
                        </Paper>

                        <Paper sx={{ p: 4, borderRadius: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>Shipping Addresses</Typography>
                                <Button startIcon={<AddIcon />} onClick={() => setShowAddrForm(!showAddrForm)}>
                                    {showAddrForm ? 'Cancel' : 'Add New'}
                                </Button>
                            </Box>

                            {showAddrForm && (
                                <Box sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}><TextField fullWidth label="Street" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} /></Grid>
                                        <Grid item xs={6}><TextField fullWidth label="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} /></Grid>
                                        <Grid item xs={6}><TextField fullWidth label="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} /></Grid>
                                        <Grid item xs={12}><TextField fullWidth label="ZIP Code" value={newAddress.zip_code} onChange={e => setNewAddress({ ...newAddress, zip_code: e.target.value })} /></Grid>
                                    </Grid>
                                    <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddAddress}>Save Address</Button>
                                </Box>
                            )}

                            <List>
                                {addresses.map((addr) => (
                                    <ListItem key={addr.id} divider>
                                        <ListItemText
                                            primary={addr.street}
                                            secondary={`${addr.city}, ${addr.state} - ${addr.zip_code}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" color="error" onClick={() => handleDeleteAddress(addr.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                                {addresses.length === 0 && <Typography color="text.secondary">No addresses saved.</Typography>}
                            </List>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;

