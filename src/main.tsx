// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker for background reminders
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('PWA installed successfully');
    
    // Try to register periodic sync for better background support
    if ('periodicSync' in registration) {
      (registration as any).periodicSync.register('check-reminders-periodic', {
        minInterval: 60000 // 1 minute minimum
      }).then(() => {
        console.log('Periodic sync registered');
      }).catch((error) => {
        console.log('Periodic sync not supported:', error);
      });
    }
  },
  onUpdate: (registration) => {
    console.log('New version available');
    // Optionally show update notification to user
  }
});