import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box, Paper, Typography, TextField, IconButton, Fab,
    Badge, List, ListItem, ListItemText, Divider,
    Avatar, Fade, Zoom, Tooltip, CircularProgress
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AttachmentIcon from '@mui/icons-material/Attachment';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { useAuth } from '../../store/AuthContext';
import { useThemeMode } from '../../store/ThemeContext';
import api, { BASE_URL, API_BASE_URL } from '../../api/axios';

const ChatWidget = () => {
    const { user, token } = useAuth();
    const { mode } = useThemeMode();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const chatWindowRef = useRef(null);
    const shouldReconnect = useRef(true);
    const reconnectDelay = useRef(5000);
    const location = useLocation();
    const isCustomizing = location.pathname.includes('/customize');
    const [detectedDesign, setDetectedDesign] = useState(false);

    useEffect(() => {
        // Check if canvas elements exist to confirm active design
        const checkDesign = () => {
            const hasCanvas = !!document.getElementById('three-canvas') || !!document.querySelector('canvas');
            setDetectedDesign(isCustomizing && hasCanvas);
        };
        
        checkDesign();
        const interval = setInterval(checkDesign, 2000);
        return () => clearInterval(interval);
    }, [isCustomizing]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (open) {
            scrollToBottom();
            setUnreadCount(0);
        }
    }, [messages, open]);

    useEffect(() => {
        if (user && token) {
            shouldReconnect.current = true;
            reconnectDelay.current = 5000;
            fetchHistory();
            connectWebSocket();
        }
        return () => {
            // Signal that this is an intentional close — do not reconnect
            shouldReconnect.current = false;
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, [user, token]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/chat/history/${user.id}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch chat history", err);
        }
    };

    const connectWebSocket = () => {
        if (!user || ws.current) return;

        setIsConnecting(true);

        // Always connect to the backend domain, not the frontend (Vercel)
        const backendBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
        const wsProtocol = backendBase.startsWith('https') ? 'wss' : 'ws';
        const wsBase = backendBase.replace(/^https?/, wsProtocol);
        const wsUrl = `${wsBase}/api/v1/chat/ws/${user.id}:user`;
        
        console.log("[WS] Connecting to:", wsUrl);
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log("[WS] Connected");
            setIsConnecting(false);
            reconnectDelay.current = 5000; // reset backoff on success
        };

        ws.current.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                setMessages(prev => [...prev, msg]);
                if (!open) {
                    setUnreadCount(prev => prev + 1);
                }
            } catch (e) {
                console.warn("[WS] Failed to parse message", e);
            }
        };

        ws.current.onerror = (err) => {
            console.warn("[WS] Error:", err);
        };

        ws.current.onclose = (event) => {
            console.log(`[WS] Disconnected (code=${event.code})`)
            ws.current = null;
            setIsConnecting(false);
            // Only reconnect if this was not intentional
            if (shouldReconnect.current) {
                const delay = Math.min(reconnectDelay.current, 30000);
                console.log(`[WS] Reconnecting in ${delay}ms...`);
                setTimeout(() => {
                    if (shouldReconnect.current) connectWebSocket();
                }, delay);
                // Exponential backoff — double the delay each time, cap at 30s
                reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
            }
        };
    };

    const handleSend = () => {
        if (!message.trim() || !ws.current) return;

        const msgData = {
            message: message,
            attachment_2d: null,
            attachment_3d: null
        };

        ws.current.send(JSON.stringify(msgData));
        setMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const captureAndSendDesign = async () => {
        setLoading(true);
        try {
            // Find customization components in DOM
            // This is a bit hacky but avoids complex state management for this demo
            const canvas2d = document.querySelector('canvas'); // The react-konva canvas
            const canvas3d = document.getElementById('three-canvas');

            let attachment2d = null;
            let attachment3d = null;

            if (canvas2d) {
                // In a real app, we'd use stageRef.current.toDataURL()
                // For now, we'll try to get the active canvas
                attachment2d = canvas2d.toDataURL('image/png');
            }

            if (canvas3d) {
                attachment3d = canvas3d.toDataURL('image/png');
            }

            if (!attachment2d && !attachment3d) {
                alert("Please open a product customizer to share design.");
                setLoading(false);
                return;
            }

            // Upload these images first? Or send as base64?
            // The user request says "attachment option" and "Support file types: PNG, JPG, WebP"
            // Let's assume we upload them to get a URL
            
            const uploadImage = async (base64, name) => {
                const blob = await fetch(base64).then(res => res.blob());
                const formData = new FormData();
                formData.append('file', blob, name);
                const res = await api.post('/products/upload-customization', formData);
                return res.data.url || res.data.image_url;
            };

            let url2d = attachment2d ? await uploadImage(attachment2d, 'design_2d.png') : null;
            let url3d = attachment3d ? await uploadImage(attachment3d, 'design_3d.png') : null;

            const msgData = {
                message: "Here is my customization design:",
                attachment_2d: url2d,
                attachment_3d: url3d
            };

            ws.current.send(JSON.stringify(msgData));
        } catch (err) {
            console.error("Design share failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
            {/* Floating Button */}
            <Zoom in={true} style={{ transitionDelay: '500ms' }}>
                <Fab 
                    color="primary" 
                    aria-label="chat" 
                    onClick={() => setOpen(!open)}
                    sx={{ 
                        width: 48,
                        height: 48,
                        minHeight: 48,
                        background: 'linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%)',
                        boxShadow: '0 8px 24px rgba(108, 99, 255, 0.4)',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '&:hover': { transform: 'scale(1.1) rotate(5deg)', boxShadow: '0 12px 32px rgba(108, 99, 255, 0.5)' },
                        '&:active': { transform: 'scale(0.95)' }
                    }}
                >
                    <Badge 
                        badgeContent={unreadCount} 
                        color="error"
                        sx={{ 
                            '& .MuiBadge-badge': { 
                                top: 2, 
                                right: 2,
                                background: '#FF4D4D',
                                border: '2px solid #0B0F1A'
                            } 
                        }}
                    >
                        {open ? <CloseIcon sx={{ fontSize: 20 }} /> : <ChatIcon sx={{ fontSize: 20 }} />}
                    </Badge>
                </Fab>
            </Zoom>

            {/* Chat Window */}
            <Fade in={open}>
                <Paper
                    elevation={0}
                    className="glass"
                    sx={{
                        position: 'absolute',
                        bottom: 80,
                        right: 0,
                        width: { xs: 'calc(100vw - 48px)', sm: 400 },
                        height: 550,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '28px',
                        overflow: 'hidden',
                        bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ 
                        p: 2.5, 
                        background: 'linear-gradient(90deg, #7C3AED 0%, #EC4899 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40, border: '1px solid rgba(255,255,255,0.3)' }}>
                                <ChatIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="900" lineHeight={1.2}>
                                    Artexa Support
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 6, height: 6, bgcolor: '#4ade80', borderRadius: '50%' }} />
                                    {isConnecting ? 'Connecting...' : 'Active Now'}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Design Detection Banner */}
                    {detectedDesign && (
                        <Box sx={{ 
                            bgcolor: mode === 'dark' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.05)',
                            p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            borderBottom: '1px solid rgba(124, 58, 237, 0.1)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ViewInArIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                    LIVE DESIGN ACTIVE
                                </Typography>
                            </Box>
                            <Box 
                                component="button"
                                onClick={captureAndSendDesign}
                                disabled={loading}
                                sx={{ 
                                    bgcolor: 'primary.main', color: 'white', border: 'none',
                                    px: 1.5, py: 0.5, borderRadius: '8px', cursor: 'pointer',
                                    fontSize: '0.7rem', fontWeight: 900,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.05)', bgcolor: 'primary.dark' },
                                    '&:disabled': { opacity: 0.5 }
                                }}
                            >
                                {loading ? 'SHARING...' : 'SHARE NOW'}
                            </Box>
                        </Box>
                    )}

                    {/* Messages Body */}
                    <Box sx={{ 
                        flexGrow: 1, 
                        overflowY: 'auto', 
                        p: 2, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2,
                        background: mode === 'dark' 
                            ? 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.05) 0%, transparent 100%)'
                            : 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.02) 0%, transparent 100%)',
                    }}>
                        {messages.length === 0 && (
                            <Box sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                                <Typography variant="body1" fontWeight="700" color="text.secondary">👋 Hello!</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    How can we help you create something beautiful today?
                                </Typography>
                            </Box>
                        )}
                        {messages.map((msg, idx) => (
                            <Box 
                                key={msg.id || idx}
                                sx={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <Paper 
                                        elevation={0}
                                        sx={{ 
                                            p: 1.8, 
                                            borderRadius: msg.sender === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                                            background: msg.sender === 'user' 
                                                ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' 
                                                : (mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                                            color: msg.sender === 'user' ? 'white' : 'text.primary',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                            position: 'relative'
                                        }}
                                    >
                                        {msg.message && (
                                            <Typography variant="body2" sx={{ fontWeight: msg.sender === 'user' ? 600 : 500, lineHeight: 1.5 }}>
                                                {msg.message}
                                            </Typography>
                                        )}
                                        
                                        {(msg.attachment_2d || msg.attachment_3d) && (
                                            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {msg.attachment_2d && (
                                                    <Box sx={{ 
                                                        borderRadius: '12px', 
                                                        overflow: 'hidden', 
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        bgcolor: 'rgba(0,0,0,0.2)'
                                                    }}>
                                                        <img src={msg.attachment_2d.startsWith('http') ? msg.attachment_2d : `${window.location.origin}${msg.attachment_2d}`} alt="2D Design" style={{ width: '100%', display: 'block' }} />
                                                    </Box>
                                                )}

                                                {msg.attachment_3d && (
                                                    <Box sx={{ 
                                                        borderRadius: '12px', 
                                                        overflow: 'hidden', 
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        bgcolor: 'rgba(0,0,0,0.2)',
                                                        position: 'relative'
                                                    }}>
                                                        <img src={msg.attachment_3d.startsWith('http') ? msg.attachment_3d : `${window.location.origin}${msg.attachment_3d}`} alt="3D Preview" style={{ width: '100%', display: 'block' }} />
                                                        <Box sx={{ 
                                                            position: 'absolute', bottom: 8, right: 8, 
                                                            bgcolor: 'rgba(0,0,0,0.6)', px: 1, py: 0.3, 
                                                            borderRadius: 5, display: 'flex', alignItems: 'center', gap: 0.5
                                                        }}>
                                                            <ViewInArIcon sx={{ fontSize: 12, color: 'white' }} />
                                                            <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 900 }}>3D PREVIEW</Typography>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Paper>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            display: 'block', 
                                            mt: 0.5, 
                                            px: 1,
                                            opacity: 0.6,
                                            fontSize: '0.65rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Footer Input */}
                    <Box sx={{ 
                        p: 2, 
                        bgcolor: mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(10px)',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5 
                    }}>
                        <Tooltip title="Share 3D Customization">
                            <IconButton 
                                size="medium" 
                                onClick={captureAndSendDesign}
                                disabled={loading}
                                sx={{ 
                                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'primary.main', color: 'white' }
                                }}
                            >
                                {loading ? <CircularProgress size={20} color="inherit" /> : <ViewInArIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        
                        <TextField
                            fullWidth
                            variant="standard"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            multiline
                            maxRows={3}
                            InputProps={{ 
                                disableUnderline: true,
                                sx: { 
                                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    px: 2.5, 
                                    py: 1, 
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    '&:focus-within': { borderColor: 'primary.main', bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,1)' }
                                }
                            }}
                        />

                        <IconButton 
                            color="primary" 
                            onClick={handleSend}
                            disabled={!message.trim()}
                            sx={{ 
                                width: 44, 
                                height: 44, 
                                bgcolor: 'primary.main', 
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.1)' },
                                '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.2)' }
                            }}
                        >
                            <SendIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    );
};

export default ChatWidget;
