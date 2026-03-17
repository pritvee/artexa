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
        mode,
        primary: {
            main: '#6C63FF',
            light: '#8B85FF',
            dark: '#483fd3',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#9C4DFF',
        },
        accent: {
            main: '#FF7A59',
        },
        background: {
            default: '#0B0F1A',
            paper: '#121A2F',
        },
        text: {
            primary: '#E5E7EB',
            secondary: '#9CA3AF',
        },
    },
    typography: {
        fontFamily: '"Inter", "Poppins", sans-serif',
        h1: { fontSize: '28px', fontWeight: 800, lineHeight: 1.2 },
        h2: { fontSize: '22px', fontWeight: 700, lineHeight: 1.3 },
        h3: { fontSize: '18px', fontWeight: 600, lineHeight: 1.4 },
        body1: { fontSize: '14px', lineHeight: 1.5 },
        body2: { fontSize: '14px', lineHeight: 1.5 },
        caption: { fontSize: '12px', lineHeight: 1.5 },
        button: { textTransform: 'none', fontWeight: 600, fontSize: '14px' },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    minHeight: '44px',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                }),
                containedPrimary: ({ theme }) => ({
                    background: 'linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%)',
                    boxShadow: '0 4px 14px 0 rgba(108, 99, 255, 0.39)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #7a72ff 0%, #a862ff 100%)',
                        boxShadow: '0 6px 20px rgba(108, 99, 255, 0.4)',
                    },
                }),
                outlined: ({ theme }) => ({
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    '&:hover': {
                        border: '1px solid rgba(255,255,255,0.4)',
                        background: 'rgba(255,255,255,0.1)',
                    },
                }),
                text: ({ theme }) => ({
                    color: 'white',
                    '&:hover': {
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(10px)',
                    }
                })
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
                root: ({ theme }) => ({
                    backgroundImage: 'none',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(18, 26, 47, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                }),
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: 'rgba(11, 15, 26, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'none',
                }),
            },
        },
                MuiCssBaseline: {
            styleOverrides: (theme) => `
                html {
                    scroll-behavior: smooth;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                body {
                    overflow-x: hidden;
                    margin: 0;
                    padding: 0;
                    background-color: ${theme.palette.background.default};
                    color: ${theme.palette.text.primary};
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
                    background: rgba(18, 26, 47, 0.4);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-card:hover {
                    background: rgba(18, 26, 47, 0.6);
                    border-color: rgba(108, 99, 255, 0.3);
                    transform: translateY(-8px);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
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
                    0%, 100% { box-shadow: 0 0 20px rgba(108, 99, 255, 0.2); }
                    50% { box-shadow: 0 0 40px rgba(108, 99, 255, 0.5); }
                }
                .gradient-text {
                    background: linear-gradient(135deg, #6C63FF 0%, #9C4DFF 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
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
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: #0B0F1A;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(108, 99, 255, 0.3);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #6C63FF;
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

