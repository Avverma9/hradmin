/* eslint-disable perfectionist/sort-imports */
import React from 'react';
import '../global.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import Router from 'src/components/routes/sections';
import ThemeProvider from '../theme';

export default function App() {
  useScrollToTop(); // Assuming useScrollToTop is a custom hook for scrolling behavior

  return (
    <ThemeProvider>
      <Router />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ThemeProvider>
  );
}
