import React, { createContext, useContext, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
const LoaderContext = createContext();
export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);
  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={64} thickness={4} />
        </Box>
      )}
    </LoaderContext.Provider>
  );
};
export const useLoader = () => {
  return useContext(LoaderContext);
};
