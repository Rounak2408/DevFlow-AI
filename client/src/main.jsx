import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!bg-slate-900/90 !text-white dark:!bg-white/10 dark:!text-slate-100 !backdrop-blur-xl !border !border-slate-700/50',
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
