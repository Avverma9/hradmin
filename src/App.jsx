import React from 'react';
import '../global.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import Router from 'src/components/routes/sections';
import ThemeProvider from '../theme';
import { LoaderProvider } from '../utils/loader';

export default function App() {


  return (
    <ThemeProvider>
      <LoaderProvider>
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
      </LoaderProvider>
    </ThemeProvider>
  );
}
