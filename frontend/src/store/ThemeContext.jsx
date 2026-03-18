import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeModeContext = createContext({
    mode: 'light',
    toggleTheme: () => { },
});

export const useThemeMode = () => useContext(ThemeModeContext);

const getDesignTokens = (mode) => ({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6C63FF', // Professional Purple
            light: '#8C85FF',
            dark: '#483DFF',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#FF4D9D', // Vibrant Pink
            light: '#FF7DB5',
            dark: '#D11C72',
        },
        accent: {
            main: '#FF7A59', // Sunset Orange
        },
        background: {
            default: '#05070D', // Deepest Navy/Black base
            paper: '#0C0E14',   // Glass base
        },
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.6)',
        },
    },
    typography: {
        fontFamily: '"Outfit", "Inter", "Poppins", sans-serif',
        h1: { fontSize: '48px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' },
        h2: { fontSize: '32px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' },
        h3: { fontSize: '24px', fontWeight: 700, lineHeight: 1.3 },
        body1: { fontSize: '16px', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.7)' },
        body2: { fontSize: '14px', lineHeight: 1.6 },
        caption: { fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' },
        button: { textTransform: 'none', fontWeight: 800, fontSize: '15.5px', letterSpacing: '0.03em' },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    minHeight: '48px',
                    padding: '12px 28px',
                    borderRadius: '16px',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #6C63FF 0%, #FF4D9D 100%)',
                    boxShadow: '0 10px 20px -5px rgba(108, 99, 255, 0.4)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #7C74FF 0%, #FF66AD 100%)',
                        boxShadow: '0 15px 30px -8px rgba(108, 99, 255, 0.5)',
                        transform: 'translateY(-3px)',
                    },
                },
                outlined: {
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    '&:hover': {
                        border: '1px solid rgba(255,255,255,0.25)',
                        background: 'rgba(255,255,255,0.08)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        borderColor: 'rgba(108, 99, 255, 0.4)',
                    },
                }),
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: '24px',
                    backgroundColor: 'rgba(12, 14, 20, 0.85)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'transparent',
                    backdropFilter: 'none',
                    borderBottom: 'none',
                    boxShadow: 'none',
                    backgroundImage: 'none',
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: (theme) => `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                
                html {
                    scroll-behavior: smooth;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                body {
                    overflow-x: hidden;
                    margin: 0;
                    padding: 0;
                    background-color: #05070D;
                    color: #FFFFFF;
                }
                /* Premium Glassmorphism */
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(25px) saturate(200%);
                    -webkit-backdrop-filter: blur(25px) saturate(200%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 28px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    border-radius: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(108, 99, 255, 0.4);
                    transform: translateY(-12px);
                    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6);
                }
                /* 3D Interactive Tilt */
                .tilt-3d {
                    transition: transform 0.6s cubic-bezier(0.2, 0, 0.2, 1);
                    transform-style: preserve-3d;
                    perspective: 1500px;
                }
                /* Animations */
                .float {
                    animation: floating 5s ease-in-out infinite;
                }
                @keyframes floating {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(1deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                .pulse-glow {
                    animation: glow 4s ease-in-out infinite;
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(108, 99, 255, 0.1); border-color: rgba(108, 99, 255, 0.2); }
                    50% { box-shadow: 0 0 50px rgba(108, 99, 255, 0.3); border-color: rgba(108, 99, 255, 0.5); }
                }
                .gradient-text {
                    background: linear-gradient(135deg, #FFFFFF 0%, #6C63FF 50%, #FF4D9D 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 900;
                }
                .luxury-shadow {
                    box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5), 0 18px 36px -18px rgba(0,0,0,0.6);
                }
                /* Custom Scrollbar */
                ::-webkit-scrollbar {
                    width: 10px;
                }
                ::-webkit-scrollbar-track {
                    background: #05070D;
                }
                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #6C63FF, #FF4D9D);
                    border-radius: 20px;
                    border: 3px solid #05070D;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #7C74FF, #FF66AD);
                }
            `,
        },
    },
});

export const AppThemeProvider = ({ children }) => {
    const stored = localStorage.getItem('theme_mode') || 'dark'; // the new design is strictly dark mood based on colors
    const [mode, setMode] = useState('dark'); // force dark mode as per requirements

    const toggleTheme = () => {
        // Keeping toggle structure in case it's used elsewhere, but we force dark based on "Background: #0B0F1A (dark)"
    };

    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    return (
        <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};

