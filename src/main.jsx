import { Suspense } from 'react';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import store from './redux/store';

import App from './App';
import { LinearProgress } from '@mui/material';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <Suspense>
        <App />
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
  <Provider store={store}>
    <HelmetProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div>
              <LinearProgress />
            </div>
          }
        >
          <App />
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </Provider>
);