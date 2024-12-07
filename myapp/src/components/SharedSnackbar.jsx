import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Create a context for managing the Snackbar globally
export const SnackbarContext = React.createContext({
  openSnackbar: () => {},
  closeSnackbar: () => {}
});

export const SnackbarProvider = ({ children }) => {
  const [snackbarState, setSnackbarState] = React.useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const openSnackbar = (message, severity = 'info') => {
    setSnackbarState({
      open: true,
      message,
      severity
    });
  };

  const closeSnackbar = () => {
    setSnackbarState(prev => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ openSnackbar, closeSnackbar }}>
      {children}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbarState.severity}
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
          }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

// Custom hook to use Snackbar context
export const useSnackbar = () => {
  const context = React.useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
