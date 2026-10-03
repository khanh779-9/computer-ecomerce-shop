import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import { CartProvider } from './stores/cartStore';
import { ToastProvider } from './stores/toastStore';
import { AuthProvider } from './stores/authStore';
import { NotificationProvider } from './stores/notificationStore';
import { CompareProvider } from './stores/compareStore';
import { WishlistProvider } from './stores/wishlistStore';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <CompareProvider>
              <WishlistProvider>
                <App />
              </WishlistProvider>
            </CompareProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
