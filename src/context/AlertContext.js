// src/context/AlertContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { Alert, Box, keyframes } from '@mui/material';

const slideIn = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-5px);
  }
`;

const AlertContext = createContext({
  showAlert: () => {},
});

const AlertMessage = ({ message, severity, onClose, isExiting }) => (
  <Box
    sx={{
      animation: isExiting
        ? `${slideOut} 400ms ease-in-out forwards`
        : `${slideIn} 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
      position: 'relative',
      '&:hover': {
        animation: `${bounce} 400ms ease-in-out`,
      },
    }}
  >
    <Alert
      severity={severity}
      onClose={onClose}
      variant="filled"
      sx={{
        borderRadius: '12px',
        boxShadow: (theme) =>
          `0 8px 32px ${
            theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.3)'
              : 'rgba(0, 0, 0, 0.1)'
          }`,
        minWidth: '300px',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.05)',
        '& .MuiAlert-icon': {
          opacity: 0,
          animation: 'fadeIn 300ms ease-in-out forwards 200ms',
        },
        '& .MuiAlert-message': {
          opacity: 0,
          animation: 'fadeIn 300ms ease-in-out forwards 300ms',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        '& .MuiAlert-action': {
          opacity: 0,
          animation: 'fadeIn 300ms ease-in-out forwards 400ms',
        },
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      {message}
    </Alert>
  </Box>
);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [alertKey, setAlertKey] = useState(0);

  const showAlert = (message, severity = 'success') => {
    const id = alertKey;
    setAlertKey((prev) => prev + 1);
    
    setAlerts((prev) => [...prev, { 
      id, 
      message, 
      severity,
      isExiting: false 
    }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      handleClose(id);
    }, 5000);
  };

  const handleClose = (id) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, isExiting: true } : alert
      )
    );

    // Remove alert after animation completes
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 400);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Box
        sx={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pointerEvents: 'none',
          '& > *': {
            pointerEvents: 'auto',
          },
        }}
      >
        {alerts.map((alert) => (
          <AlertMessage
            key={alert.id}
            message={alert.message}
            severity={alert.severity}
            onClose={() => handleClose(alert.id)}
            isExiting={alert.isExiting}
          />
        ))}
      </Box>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};