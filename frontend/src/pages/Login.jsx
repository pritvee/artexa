import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';


import api from '../api/axios';
import { useEffect } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, user, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || (user?.role === 'admin' ? '/admin' : '/');

    useEffect(() => {
        if (token && user) {
            navigate(from, { replace: true });
        }
    }, [token, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', email.trim()); // FastAPI OAuth2 uses 'username' field
            formData.append('password', password);

            const res = await api.post('/auth/login', formData);
            const { access_token, user_data } = res.data;

            login(access_token, user_data.role, user_data.email, user_data.name, user_data.id);
        } catch (err) {
            let errorMsg = 'Invalid email or password';
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
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 800 }}>
                    Welcome Back
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                    Login to your account to continue
                </Typography>


                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        id="login-email"
                        fullWidth
                        label="Email Address"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        id="login-password"
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button id="login-submit" fullWidth variant="contained" size="large" type="submit" sx={{ mt: 3 }}>
                        Login
                    </Button>
                </form>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Don't have an account?{' '}
                        <Link component={RouterLink} to="/register">Register</Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
