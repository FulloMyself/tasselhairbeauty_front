import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import styles in the correct order
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/auth.css';
import './styles/responsive.css';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully');
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available - could show a toast notification here
              console.log('🔄 New version available! Refresh to update.');
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

// Check if app is installed (PWA)
window.addEventListener('appinstalled', () => {
  console.log('✅ Tassel Studio app installed successfully!');
});

// Handle online/offline status
window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  console.log('🌐 Back online');
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  console.log('📡 You are offline - some features may be limited');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);