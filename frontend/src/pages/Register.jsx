import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

import api from '../api/axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', {
                name: name.trim(),
                email: email.trim(),
                password,
                phone: '', // Added dummy phone to fix required field from backend UserCreate model
                role: 'user' // Default role
            });
            alert('Registered successfully! Please login.');
            navigate('/login');
        } catch (err) {
            let errorMsg = 'Registration failed. Try a different email.';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMsg = err.response.data.detail.map(d => d.msg).join(', ');
                } else {
                    errorMsg = err.response.data.detail;
                }
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 800 }}>Create Account</Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
                    Start your journey with us
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button fullWidth variant="contained" size="large" type="submit" sx={{ mt: 4 }}>
                        Register
                    </Button>
                </form>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Already have an account? <Link component={RouterLink} to="/login">Login</Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;
