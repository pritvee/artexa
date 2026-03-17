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
        crashCount: 0,
        aiSuggestion: null,
        isAiLoading: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Log the error to the backend API
    try {
      api.post('/logs', {
        error: error.toString(),
        errorInfo: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent
      }).catch(err => console.error("Failed to log error to backend:", err));
    } catch (e) {
      console.error("Error while trying to log to backend:", e);
    }

    // Connect to AI Debug API to get a suggestion without blocking UI
    this.fetchAiSuggestion(error, errorInfo);

    // Track crashes to potentially execute a hard reset
    this.setState(prev => ({ crashCount: prev.crashCount + 1 }));
  }

  fetchAiSuggestion = async (error, errorInfo) => {
    this.setState({ isAiLoading: true });
    try {
        // Extract a component name or rough code location from the very first line of the stack trace
        const componentMatch = errorInfo.componentStack.match(/at (\w+)/);
        const componentName = componentMatch ? componentMatch[1] : "UnknownComponent";

        // Non-blocking call to AI debug endpoint
        const response = await api.post('/ai-debug', {
            error: error.toString(),
            stackTrace: errorInfo.componentStack,
            code: `React Component: ${componentName}` 
        });

        if (response.data?.status === 'success' && response.data?.data) {
            this.setState({ aiSuggestion: response.data.data });
        }
    } catch (apiErr) {
        console.error("AI Debug API failed:", apiErr);
    } finally {
        this.setState({ isAiLoading: false });
    }
  };

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
      const { aiSuggestion, isAiLoading } = this.state;
      
      return (
        <Container maxWidth="md">
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
                sx={{ borderRadius: '100px', px: 4, py: 1.5, fontWeight: 800, mb: 4 }}
            >
              Back to Safety
            </Button>

            {/* AI Debugger Output UI (Only visible in development/debugging contexts ideally) */}
            <Box sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                    🤖 AI Debugger Assistant
                </Typography>
                
                {isAiLoading && (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Analyzing error stack trace and component details...
                    </Typography>
                )}

                {aiSuggestion && !isAiLoading && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" color="error.dark">Root Cause:</Typography>
                            <Typography variant="body2">{aiSuggestion.rootCause}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" color="success.dark">Suggested Fix:</Typography>
                            <Typography variant="body2">{aiSuggestion.fix}</Typography>
                        </Box>
                        {aiSuggestion.correctedCode && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">Code Snippet:</Typography>
                                <Box component="pre" sx={{ p: 2, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, overflowX: 'auto', fontSize: '13px' }}>
                                    <code>{aiSuggestion.correctedCode}</code>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
