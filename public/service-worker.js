// public/service-worker.js
import { openDB } from 'idb';

const CACHE_NAME = 'order-queue-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Cache static assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Check reminders and show notifications
async function checkReminders() {
  try {
    const db = await openDB('reminders-db', 1);
    const reminders = await db.get('reminders', 'current') || [];

    if (reminders.length > 0) {
      // Vibrate pattern: 200ms vibration, 100ms pause, 200ms vibration
      const vibratePattern = [200, 100, 200];

      reminders.forEach(reminder => {
        self.registration.showNotification('Order Pickup Reminder', {
          body: `Order #${reminder.orderNumber} in ${reminder.section} needs pickup!`,
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          vibrate: vibratePattern,
          tag: `reminder-${reminder.id}`,
          renotify: true
        });
      });
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkReminders());
  }
});

// Set up periodic sync (every 10 minutes)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'reminder-check') {
    event.waitUntil(checkReminders());
  }
});

// Activate the service worker
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then(keys => Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )),
      // Register periodic sync
      (async () => {
        try {
          await self.registration.periodicSync.register('reminder-check', {
            minInterval: 10 * 60 * 1000 // 10 minutes
          });
        } catch (error) {
          console.log('Periodic sync registration failed:', error);
        }
      })()
    ])
  );
});
