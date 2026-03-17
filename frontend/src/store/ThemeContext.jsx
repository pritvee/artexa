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
            main: '#7C4DFF', // Vibrant Purple
            light: '#B47CFF',
            dark: '#3F1DCC',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#F50057', // Vibrant Magenta/Pink
        },
        accent: {
            main: '#00E5FF', // Cyan accent
        },
        background: {
            default: '#05070A', // Ultra Deep Navy/Black
            paper: '#0C0E14',   // Slightly lighter for cards
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#A0AEC0',
        },
    },
    typography: {
        fontFamily: '"Outfit", "Inter", "Poppins", sans-serif',
        h1: { fontSize: '48px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' },
        h2: { fontSize: '32px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.01em' },
        h3: { fontSize: '24px', fontWeight: 700, lineHeight: 1.3 },
        body1: { fontSize: '16px', lineHeight: 1.6, color: '#A0AEC0' },
        body2: { fontSize: '14px', lineHeight: 1.6 },
        caption: { fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' },
        button: { textTransform: 'none', fontWeight: 700, fontSize: '15px', letterSpacing: '0.02em' },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    minHeight: '48px',
                    padding: '10px 24px',
                    borderRadius: '50px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #7C4DFF 0%, #F50057 100%)',
                    boxShadow: '0 8px 20px -6px rgba(124, 77, 255, 0.5)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #8C5DFF 0%, #FF1A66 100%)',
                        boxShadow: '0 12px 28px -8px rgba(124, 77, 255, 0.6)',
                        transform: 'translateY(-2px)',
                    },
                },
                outlined: {
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    '&:hover': {
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.08)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(18, 26, 47, 0.6)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                    },
                }),
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(12, 14, 20, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(5, 7, 10, 0.6)',
                    backdropFilter: 'blur(25px) saturate(200%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
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
                    background-color: #05070A;
                    color: #FFFFFF;
                    background-image: 
                        radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 100% 100%, rgba(245, 0, 87, 0.05) 0%, transparent 50%);
                    background-attachment: fixed;
                }
                /* Premium Glassmorphism */
                .glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
                .glass-card {
                    background: rgba(12, 14, 20, 0.4);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-card:hover {
                    background: rgba(12, 14, 20, 0.6);
                    border-color: rgba(124, 77, 255, 0.3);
                    transform: translateY(-8px);
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
                }
                /* 3D Interactive Tilt */
                .tilt-3d {
                    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                    transform-style: preserve-3d;
                    perspective: 1000px;
                }
                .tilt-3d:hover {
                    transform: rotateX(5deg) rotateY(-5deg);
                }
                /* Animations */
                .float {
                    animation: floating 4s ease-in-out infinite;
                }
                @keyframes floating {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
                .pulse-glow {
                    animation: glow 3s ease-in-out infinite;
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(124, 77, 255, 0.2); }
                    50% { box-shadow: 0 0 40px rgba(124, 77, 255, 0.5); }
                }
                .gradient-text {
                    background: linear-gradient(135deg, #7C4DFF 0%, #F50057 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 900;
                }
                /* Mobile Touch System */
                @media (max-width: 768px) {
                    .btn-mobile {
                        height: 48px;
                        min-width: 44px;
                    }
                    .touch-target {
                        min-height: 44px;
                        min-width: 44px;
                    }
                }
                /* Custom Scrollbar */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #05070A;
                }
                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #7C4DFF, #F50057);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #7C4DFF;
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

