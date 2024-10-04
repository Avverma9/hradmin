import React, { createContext, useContext, useState } from 'react';
import Box from '@mui/material/Box';
const LoaderContext = createContext();
export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);
  const loaderImage =
    'https://www.davidkingsbury.co.uk/wp-content/uploads/2021/08/lg.ring-loading-gif.gif';
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
          <img
            src={loaderImage}
            alt="Loading..."
            style={{ width: '100px', height: '100px' }} // Adjust size as needed
          />
        </Box>
      )}
    </LoaderContext.Provider>
  );
};
export const useLoader = () => {
  return useContext(LoaderContext);
};