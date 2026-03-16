import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Grid, Paper, Typography, List, ListItem,
    ListItemText, ListItemAvatar, Avatar, Badge,
    Divider, TextField, IconButton, Chip, CircularProgress,
    Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../store/AuthContext';
import { useThemeMode } from '../../store/ThemeContext';
import api, { BASE_URL, API_BASE_URL } from '../../api/axios';

const AdminChat = () => {
    const { user, token } = useAuth();
    const { mode } = useThemeMode();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const shouldReconnect = useRef(true);
    const reconnectDelay = useRef(5000);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchConversations();
        shouldReconnect.current = true;
        reconnectDelay.current = 5000;
        connectWebSocket();
        return () => {
            shouldReconnect.current = false;
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, []);

    const fetchConversations = async () => {
        setLoadingConversations(true);
        try {
            const res = await api.get('/chat/conversations');
            setConversations(res.data);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        } finally {
            setLoadingConversations(false);
        }
    };

    const fetchMessages = async (userId) => {
        setLoadingMessages(true);
        try {
            const res = await api.get(`/chat/history/${userId}`);
            setMessages(res.data);
            // Mark as read
            await api.post(`/chat/read/${userId}`);
            // Refresh conversation list to clear badge
            fetchConversations();
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const connectWebSocket = () => {
        if (!user || ws.current) return;

        // Always connect to the backend domain, not the frontend (Vercel)
        const backendBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
        const wsProtocol = backendBase.startsWith('https') ? 'wss' : 'ws';
        const wsBase = backendBase.replace(/^https?/, wsProtocol);
        const wsUrl = `${wsBase}/api/v1/chat/ws/${user.id}:admin`;
        
        console.log("[AdminWS] Connecting to:", wsUrl);
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log("[AdminWS] Connected");
            reconnectDelay.current = 5000; // reset backoff
        };

        ws.current.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                
                // If the message belongs to the current open chat
                if (selectedUser && (msg.user_id === selectedUser.user_id)) {
                    setMessages(prev => [...prev, msg]);
                    api.post(`/chat/read/${selectedUser.user_id}`);
                }
                
                // Refresh conversation list
                fetchConversations();
                
                // Play notification sound
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
                    audio.play();
                } catch (e) {}
            } catch (e) {
                console.warn("[AdminWS] Failed to parse message", e);
            }
        };

        ws.current.onerror = (err) => {
            console.warn("[AdminWS] Error:", err);
        };

        ws.current.onclose = (event) => {
            console.log(`[AdminWS] Disconnected (code=${event.code})`);
            ws.current = null;
            if (shouldReconnect.current) {
                const delay = Math.min(reconnectDelay.current, 30000);
                console.log(`[AdminWS] Reconnecting in ${delay}ms...`);
                setTimeout(() => {
                    if (shouldReconnect.current) connectWebSocket();
                }, delay);
                reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
            }
        };
    };

    const handleSelectUser = (conv) => {
        setSelectedUser(conv);
        fetchMessages(conv.user_id);
    };

    const handleSend = () => {
        if (!message.trim() || !ws.current || !selectedUser) return;

        const msgData = {
            target_user_id: selectedUser.user_id,
            message: message,
            attachment_2d: null,
            attachment_3d: null
        };

        ws.current.send(JSON.stringify(msgData));
        setMessage('');
    };

    return (
        <Box sx={{ p: { xs: 1, md: 3 }, height: 'calc(100vh - 120px)', display: 'flex' }}>
            <Paper 
                elevation={0}
                className="glass"
                sx={{ 
                    flexGrow: 1, 
                    height: '100%', 
                    borderRadius: '28px', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                {/* Lateral Sidebar: Conversation List */}
                <Box sx={{ 
                    width: { xs: '100%', md: 380 }, 
                    height: { xs: selectedUser ? '0' : '100%', md: '100%' },
                    display: { xs: selectedUser ? 'none' : 'flex', md: 'flex' },
                    borderRight: '1px solid rgba(255,255,255,0.1)', 
                    flexDirection: 'column',
                    bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255,255,255,0.4)',
                }}>
                    <Box sx={{ 
                        p: 3, 
                        background: 'linear-gradient(90deg, #7C3AED 0%, #EC4899 100%)',
                        color: 'white',
                    }}>
                        <Typography variant="h5" fontWeight="900" display="flex" alignItems="center" gap={2}>
                            <ChatIcon fontSize="large" /> Conversations
                        </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TextField 
                            fullWidth 
                            size="small" 
                            placeholder="Search customers..." 
                            sx={{ 
                                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                                borderRadius: 10,
                                '& .MuiOutlinedInput-root': { borderRadius: 10 }
                            }}
                        />
                    </Box>

                    {loadingConversations ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : (
                        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {conversations.length === 0 && (
                                <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                                    <Typography variant="body1" fontWeight="600">No active chats.</Typography>
                                </Box>
                            )}
                            {conversations.map((conv) => (
                                <ListItem 
                                    button 
                                    key={conv.user_id}
                                    selected={selectedUser?.user_id === conv.user_id}
                                    onClick={() => handleSelectUser(conv)}
                                    sx={{ 
                                        borderRadius: '16px',
                                        py: 2,
                                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                                        bgcolor: !conv.is_read ? 'rgba(124, 77, 255, 0.08)' : 'transparent',
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'primary.dark' },
                                            '.MuiTypography-root': { color: 'white' },
                                            '.MuiAvatar-root': { border: '2px solid rgba(255,255,255,0.5)' }
                                        },
                                        '&:hover:not(.Mui-selected)': {
                                            bgcolor: 'rgba(0,0,0,0.05)',
                                            transform: 'translateX(4px)'
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Badge 
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            overlap="circular"
                                            color="error" 
                                            badgeContent={conv.unread_count} 
                                            invisible={conv.is_read}
                                        >
                                            <Avatar sx={{ 
                                                width: 50, height: 50, 
                                                bgcolor: 'secondary.main',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }}>
                                                {conv.user_name?.charAt(0) || <AccountCircleIcon />}
                                            </Avatar>
                                        </Badge>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="subtitle1" fontWeight="800">
                                                    {conv.user_name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                    {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </Box>
                                        } 
                                        secondary={
                                            <Typography 
                                                variant="body2" 
                                                noWrap 
                                                sx={{ 
                                                    opacity: 0.8,
                                                    fontWeight: !conv.is_read ? 700 : 400
                                                }}
                                            >
                                                {conv.last_message || "Shared a 3D design"}
                                            </Typography>
                                        } 
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                {/* Main Content: Chat Window */}
                <Box sx={{ 
                    flexGrow: 1, 
                    display: { xs: selectedUser ? 'flex' : 'none', md: 'flex' }, 
                    flexDirection: 'column', 
                    bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.2)' : 'rgba(248, 250, 252, 0.5)',
                    height: '100%'
                }}>
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <Box sx={{ 
                                p: 2.5, 
                                borderBottom: '1px solid rgba(0,0,0,0.05)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                bgcolor: mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'white',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <IconButton 
                                    onClick={() => setSelectedUser(null)} 
                                    sx={{ display: { md: 'none' } }}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                                <Avatar sx={{ width: 45, height: 45, bgcolor: 'secondary.main', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                    {selectedUser.user_name?.charAt(0) || <AccountCircleIcon />}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="900" lineHeight={1.2}>
                                        {selectedUser.user_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                                        Client ID: #{selectedUser.user_id} • Online
                                    </Typography>
                                </Box>
                                <IconButton color="primary" sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <PeopleIcon />
                                </IconButton>
                                <IconButton color="warning" sx={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <AssessmentIcon />
                                </IconButton>
                            </Box>

                            {/* Messages Container */}
                            <Box sx={{ 
                                flexGrow: 1, 
                                p: 3, 
                                overflowY: 'auto', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: 2.5 
                            }}>
                                {loadingMessages ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isSelf = msg.sender === 'admin';
                                        return (
                                            <Box 
                                                key={msg.id || idx}
                                                sx={{
                                                    alignSelf: isSelf ? 'flex-end' : 'flex-start',
                                                    maxWidth: '75%',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
                                                    <Paper 
                                                        elevation={0}
                                                        sx={{ 
                                                            p: 2, 
                                                            borderRadius: isSelf ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
                                                            bgcolor: isSelf ? 'primary.main' : (mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'),
                                                            color: isSelf ? 'white' : 'text.primary',
                                                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                                            border: '1px solid rgba(255,255,255,0.1)'
                                                        }}
                                                    >
                                                        {msg.message && (
                                                            <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                                                                {msg.message}
                                                            </Typography>
                                                        )}
                                                        
                                                        {(msg.attachment_2d || msg.attachment_3d) && (
                                                            <Grid container spacing={1.5} sx={{ mt: msg.message ? 2 : 0 }}>
                                                                {msg.attachment_2d && (
                                                                    <Grid item xs={12} sm={msg.attachment_3d ? 6 : 12}>
                                                                        <Paper sx={{ p: 0.5, borderRadius: '16px', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.05)' }}>
                                                                            <img 
                                                                                src={msg.attachment_2d.startsWith('http') ? msg.attachment_2d : `${window.location.origin}${msg.attachment_2d}`} 
                                                                                alt="2D Design" 
                                                                                style={{ width: '100%', borderRadius: 12, display: 'block' }} 
                                                                            />
                                                                            <Typography variant="caption" sx={{ p: 1, display: 'block', textAlign: 'center', fontWeight: 700 }}>2D CANVAS DESIGN</Typography>
                                                                        </Paper>
                                                                    </Grid>
                                                                )}
                                                                {msg.attachment_3d && (
                                                                    <Grid item xs={12} sm={msg.attachment_2d ? 6 : 12}>
                                                                        <Paper sx={{ 
                                                                            p: 0.5, borderRadius: '16px', overflow: 'hidden', 
                                                                            bgcolor: 'rgba(0,0,0,0.05)', cursor: 'pointer',
                                                                            transition: 'transform 0.3s',
                                                                            '&:hover': { transform: 'scale(1.02)' }
                                                                        }}>
                                                                            <img 
                                                                                src={msg.attachment_3d.startsWith('http') ? msg.attachment_3d : `${window.location.origin}${msg.attachment_3d}`} 
                                                                                alt="3D Preview" 
                                                                                style={{ width: '100%', borderRadius: 12, display: 'block' }} 
                                                                            />
                                                                            <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                                                <ViewInArIcon fontSize="small" color="primary" />
                                                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>INTERACTIVE 3D MODEL</Typography>
                                                                            </Box>
                                                                        </Paper>
                                                                    </Grid>
                                                                )}
                                                            </Grid>
                                                        )}
                                                    </Paper>
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ 
                                                            display: 'block', 
                                                            mt: 0.8, 
                                                            px: 1,
                                                            opacity: 0.6,
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        {new Date(msg.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Chat Input */}
                            <Box sx={{ 
                                p: 3, 
                                bgcolor: mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'white',
                                backdropFilter: 'blur(10px)',
                                borderTop: '1px solid rgba(0,0,0,0.05)',
                                display: 'flex', 
                                gap: 2,
                                alignItems: 'center'
                            }}>
                                <TextField
                                    fullWidth
                                    placeholder="Click here to reply..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    multiline
                                    maxRows={4}
                                    InputProps={{ 
                                        disableUnderline: true,
                                        sx: { 
                                            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                            px: 3, 
                                            py: 1.5, 
                                            borderRadius: '24px',
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            '&:focus-within': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
                                        }
                                    }}
                                />
                                <IconButton 
                                    onClick={handleSend} 
                                    disabled={!message.trim()}
                                    sx={{ 
                                        width: 55, 
                                        height: 55, 
                                        bgcolor: 'primary.main', 
                                        color: 'white',
                                        boxShadow: '0 8px 16px rgba(124, 58, 237, 0.3)',
                                        '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.05)' },
                                        '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.2)' }
                                    }}
                                >
                                    <SendIcon />
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
                            <Box sx={{ 
                                width: 120, height: 120, borderRadius: '50%', 
                                bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                mb: 3, boxShadow: '0 20px 40px rgba(124, 58, 237, 0.2)',
                                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
                            }}>
                                <ChatIcon sx={{ fontSize: 60, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" fontWeight="900" gutterBottom>Support Dashboard</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, opacity: 0.8 }}>
                                Select a client from the left to view their 3D customizations and start helping them build their frames.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default AdminChat;
