import React from 'react';
import { Fab, Tooltip, Zoom } from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { motion } from 'framer-motion';

const FloatingSupport = () => {
    return (
        <Zoom in={true} style={{ transitionDelay: '1000ms' }}>
            <Tooltip title="Need help?" placement="left">
                <Fab 
                    color="primary" 
                    aria-label="chat" 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 24, 
                        right: 24, 
                        width: 56, 
                        height: 56,
                        zIndex: 1000,
                        background: 'linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%)',
                        boxShadow: '0 8px 32px rgba(108, 99, 255, 0.4)',
                        color: 'white',
                        '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                            boxShadow: '0 12px 40px rgba(108, 99, 255, 0.6)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <ChatBubbleIcon />
                    </motion.div>
                </Fab>
            </Tooltip>
        </Zoom>
    );
};

export default FloatingSupport;
