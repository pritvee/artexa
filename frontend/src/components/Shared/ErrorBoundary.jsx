import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import api from '../../api/axios';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
        hasError: false, 
        error: null, 
        crashCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Log the error to the backend API (non-blocking)
    try {
      api.post('/logs', {
        error: error.toString(),
        errorInfo: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent
      }).catch(() => {}); // silently ignore if logging fails
    } catch (e) {
      // Swallow silently
    }

    // Track crashes to potentially execute a hard reset
    this.setState(prev => ({ crashCount: prev.crashCount + 1 }));
  }

  handleRecovery = () => {
    if (this.state.crashCount > 2) {
      // If crashing repeatedly, clear storage and go home
      localStorage.clear();
      window.location.href = '/';
    } else {
      this.setState({ hasError: false, error: null, aiSuggestion: null });
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box 
            sx={{ 
              mt: 10, 
              p: 4, 
              borderRadius: 4, 
              textAlign: 'center', 
              bgcolor: 'background.paper',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={900} gutterBottom>
              Oops! Something went wrong.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              The page experienced an unexpected error. Don't worry, your data is safe.
            </Typography>
            
            <Button 
                variant="contained" 
                onClick={this.handleRecovery}
                sx={{ borderRadius: '100px', px: 4, py: 1.5, fontWeight: 800 }}
            >
              Back to Safety
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
