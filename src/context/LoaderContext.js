import React, { createContext, useContext, useState } from 'react';
import { Backdrop, Box, keyframes } from '@mui/material';

// Previous animations remain the same
const rotateOne = keyframes`
  0% { transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg); }
  100% { transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg); }
`;

const rotateTwo = keyframes`
  0% { transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg); }
  100% { transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg); }
`;

const rotateThree = keyframes`
  0% { transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg); }
  100% { transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const glowAnimation = keyframes`
  0%, 100% { 
    filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0));
  }
  50% { 
    filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.3));
  }
`;

const fadeSlideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const waveText = keyframes`
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-3px); }
  75% { transform: translateY(3px); }
`;

const LoaderContext = createContext({
  showLoader: () => {},
  hideLoader: () => {},
});

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loaderCount, setLoaderCount] = useState(0);

  const showLoader = (msg = '') => {
    setLoaderCount((prev) => prev + 1);
    setLoading(true);
    setMessage(msg);
  };

  const hideLoader = () => {
    setLoaderCount((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setLoading(false);
        setMessage('');
        return 0;
      }
      return newCount;
    });
  };

  const getCharAnimation = (index) => ({
    animation: `${waveText} 2s ease-in-out infinite`,
    animationDelay: `${index * 0.05}s`,
    display: 'inline-block',
    whiteSpace: 'pre',
  });


  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      <Backdrop
        open={loading}
        sx={{
          zIndex: 9999,
          backgroundColor: 'transparent',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {/* 3D Loader */}
          <Box
            sx={{
              position: 'relative',
              width: '100px',
              height: '100px',
              perspective: '780px',
              perspectiveOrigin: '50% 50%',
              transform: 'rotateZ(45deg)',
              '& > div': {
                position: 'absolute',
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
              },
            }}
          >
            <Box
              sx={{
                left: '0',
                top: '0',
                animation: `${rotateOne} 1.15s linear infinite`,
                borderBottom: (theme) =>
                  `3px solid ${theme.palette.mode === 'dark' ? '#60a5fa' : '#3b82f6'}`,
              }}
            />
            <Box
              sx={{
                right: '0',
                top: '0',
                animation: `${rotateTwo} 1.15s linear infinite`,
                borderRight: (theme) =>
                  `3px solid ${theme.palette.mode === 'dark' ? '#818cf8' : '#6366f1'}`,
              }}
            />
            <Box
              sx={{
                right: '0',
                bottom: '0',
                animation: `${rotateThree} 1.15s linear infinite`,
                borderTop: (theme) =>
                  `3px solid ${theme.palette.mode === 'dark' ? '#93c5fd' : '#7c3aed'}`,
              }}
            />
          </Box>

          {/* Theme-Aware Animated Message */}
          {message && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                animation: `${fadeSlideIn} 0.5s ease-out, ${floatAnimation} 3s ease-in-out infinite`,
                color: (theme) =>
                    theme.palette.mode === 'dark' 
                ? '#93c5fd'
                : '#3b82f6', 
                fontSize: '0.95rem',
                fontWeight: 500,
                letterSpacing: '0.3px',
                textAlign: 'center',
                maxWidth: '300px',
                textShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 0 10px rgba(148, 163, 184, 0.3)'
                    : '0 0 10px rgba(51, 65, 85, 0.1)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  transform: 'translate(-50%, -50%)',
                  animation: `${glowAnimation} 3s ease-in-out infinite`,
                  zIndex: -1,
                },
              }}
            >
              {message.split('').map((char, index) => (
                <span
                  key={index}
                  style={{
                    ...getCharAnimation(index),
                    marginRight: char === ' ' ? '0.25em' : '0',
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </Box>
          )}
        </Box>
      </Backdrop>
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};