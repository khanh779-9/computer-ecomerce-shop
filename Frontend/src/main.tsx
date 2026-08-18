import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import { CartProvider } from './stores/cartStore';
import { ToastProvider } from './stores/toastStore';
import { AuthProvider } from './stores/authStore';
import { NotificationProvider } from './stores/notificationStore';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
