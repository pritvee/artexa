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
            main: '#7C3AED',
            light: '#9333EA',
            dark: '#5B21B6',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#EC4899',
        },
        accent: {
            main: '#F59E0B',
        },
        ...(mode === 'light'
            ? {
                background: {
                    default: '#F8FAFC',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#0F172A',
                    secondary: '#475569',
                },
            }
            : {
                background: {
                    default: '#0B1120',
                    paper: '#111827',
                },
                text: {
                    primary: '#E5E7EB',
                    secondary: '#94A3B8',
                },
            }),
    },
    typography: {
        fontFamily: '"Outfit", "Inter", "Plus Jakarta Sans", sans-serif',
        h1: { fontWeight: 900, letterSpacing: '-0.04em' },
        h2: { fontWeight: 900, letterSpacing: '-0.03em' },
        h3: { fontWeight: 800, letterSpacing: '-0.02em' },
        h4: { fontWeight: 800, letterSpacing: '-0.01em' },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.01em' },
    },
    shape: {
        borderRadius: 24,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    padding: '12px 28px',
                    borderRadius: '500px', // True pill shape
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    letterSpacing: '0.02em',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Snappier high-performance easing
                    textTransform: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    willChange: 'transform, opacity',
                    touchAction: 'manipulation', // Prevent zoom delays on mobile
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 24px -8px rgba(0,0,0,0.2)',
                        '&::after': {
                            transform: 'translateX(100%)',
                        }
                    },
                    '&:active': {
                        transform: 'scale(1.01)', // Very subtle to guarantee zero lag
                        filter: 'brightness(1.1)',
                        transition: 'all 0.1s ease-out', 
                    },
                    '@media (hover: none)': {
                        '&:active': {
                            transform: 'scale(1.01)',
                            background: 'rgba(255, 255, 255, 0.1)',
                        }
                    },
                    // Liquid Shine Effect
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'transform 0.6s ease',
                    }
                }),
                containedPrimary: ({ theme }) => ({
                    background: theme.palette.mode === 'dark' 
                        ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)'
                        : 'linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(236, 72, 153, 0.9) 100%)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.4)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(244, 114, 182, 0.9) 100%)',
                        boxShadow: '0 20px 40px -12px rgba(124, 58, 237, 0.6)',
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
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: theme.palette.mode === 'dark' 
                        ? 'rgba(30, 41, 59, 0.5)' 
                        : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'transform, opacity',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        background: theme.palette.mode === 'dark' 
                            ? 'rgba(30, 41, 59, 0.7)' 
                            : 'rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.3)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                }),
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundImage: 'none',
                    borderRadius: '24px',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                }),
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(25px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(25px) saturate(200%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    color: theme.palette.text.primary,
                    boxShadow: 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }),
            },
        },
        MuiCssBaseline: {
            styleOverrides: (theme) => `
                html {
                    scroll-behavior: smooth;
                }
                body {
                    overflow-x: hidden;
                    margin: 0;
                    padding: 0;
                    background-color: ${theme.palette.background.default};
                }
                .glass {
                    background: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)'};
                    backdrop-filter: blur(25px) saturate(200%);
                    -webkit-backdrop-filter: blur(25px) saturate(200%);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: transform, opacity;
                }
                .glass:hover {
                    background: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)'};
                    border-color: rgba(255,255,255,0.2);
                    box-shadow: 0 15px 45px 0 rgba(0, 0, 0, 0.2);
                    transform: translateY(-2px);
                }
                /* Mobile Touch Ripple/Feedback */
                @media (hover: none) {
                    .glass:active {
                        transform: scale(0.98);
                        background: rgba(255, 255, 255, 0.1);
                        transition: transform 0.1s ease;
                    }
                }
                .liquid-glass {
                    position: relative;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    overflow: hidden;
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                }
                .liquid-glass::before {
                    content: "";
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
                    pointer-events: none;
                }
                .card3d {
                    transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                    transform-style: preserve-3d;
                    will-change: transform;
                }
                .card3d:hover {
                    transform: perspective(1000px) rotateX(6deg) rotateY(-8deg) scale(1.03);
                }
                .heroFloat {
                    animation: float 6s ease-in-out infinite;
                    will-change: transform;
                }
                @keyframes float {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                    100% { transform: translateY(0); }
                }
                .preview3d {
                    transition: all .6s cubic-bezier(0.23, 1, 0.32, 1);
                    will-change: transform;
                    overflow: hidden;
                    border-radius: inherit;
                }
                /* Removed tilt effect for better usability */
                img {
                    max-width: 100%;
                    height: auto;
                    border-radius: inherit;
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: ${theme.palette.background.default};
                }
                ::-webkit-scrollbar-thumb {
                    background: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,1,0,0.1)'};
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: ${theme.palette.primary.main};
                }
            `,
        },
    },
});

export const AppThemeProvider = ({ children }) => {
    const stored = localStorage.getItem('theme_mode') || 'dark'; // Default to dark as requested
    const [mode, setMode] = useState(stored);

    const toggleTheme = () => {
        const next = mode === 'light' ? 'dark' : 'light';
        setMode(next);
        localStorage.setItem('theme_mode', next);
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

