import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CreateReminderForm from './components/CreateReminderForm';
import SuccessfulPickups from './components/SuccessfulPickups';
import Footer from './components/Footer';
import './styles.css';

export interface Reminder {
  id: string;
  orderNumber: string;
  section: string;
  createdAt: number;
}

export interface CompletedOrder {
  id: string;
  orderNumber: string;
  section: string;
  completedAt: string;
}

const App: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load from localStorage and IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') setIsDarkMode(true);

      const db = await openDB('reminders-db', 1, {
        upgrade(db) {
          db.createObjectStore('reminders');
          db.createObjectStore('completed');
        },
      });

      const savedReminders = await db.get('reminders', 'current');
      const savedCompleted = await db.get('completed', 'current');

      if (savedReminders) setReminders(savedReminders);
      if (savedCompleted) setCompletedOrders(savedCompleted);
    };

    loadData();
  }, []);

  // Save data to IndexedDB and trigger background sync
  useEffect(() => {
    const saveData = async () => {
      const db = await openDB('reminders-db', 1);
      await db.put('reminders', reminders, 'current');
      await db.put('completed', completedOrders, 'current');

      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        try {
          await registration.sync.register('check-reminders');
          
          // Also send immediate message to service worker
          registration.active?.postMessage({
            type: 'SCHEDULE_REMINDER_CHECK'
          });
        } catch (err) {
          console.error('Background sync failed:', err);
        }
      }
    };
    

    saveData();
  }, [reminders, completedOrders]);

  // Save theme to localStorage
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : '';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Request notification permission and register periodic sync on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }

      // Register for periodic background sync if supported
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          // Check if periodicSync is available
          if ('periodicSync' in registration) {
            await (registration as any).periodicSync.register('check-reminders-periodic', {
              minInterval: 60000 // Check every minute (minimum supported interval)
            });
            console.log('Periodic background sync registered');
          }
        } catch (error) {
          console.log('Periodic background sync not supported or failed:', error);
        }
      }
    };
    
    initializeNotifications();
  }, []);

  // Listen for messages from service worker
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'COMPLETE_ORDER') {
        completeOrder(event.data.reminderId);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, []);

  // Fallback: Check for due reminders every 30 seconds when app is active
  useEffect(() => {
    const checkDueReminders = async () => {
      // Only run fallback checks if service worker is not available
      if (!('serviceWorker' in navigator)) {
        reminders.forEach(reminder => {
          const timeSinceCreation = Date.now() - reminder.createdAt;
          const tenSeconds = 10 * 1000; //timer - change to 10 * 60 * 1000 for 10 minutes
          const notificationKey = `notified-${reminder.id}`;
          
          // Check if reminder is older than 10 seconds and notification hasn't been shown
          if (timeSinceCreation >= tenSeconds && !localStorage.getItem(notificationKey)) {
            // Show notification if permission granted
            if (Notification.permission === 'granted') {
              const notification = new Notification('Order Pickup Reminder', {
                body: `Order #${reminder.orderNumber} in ${reminder.section} has been waiting for ${Math.floor(timeSinceCreation / 60000)} minutes`,
                icon: '/icon-192x192.png',
                tag: reminder.id,
              });

              // Store that we've shown the notification
              localStorage.setItem(notificationKey, 'true');

              // Clear notification flag when clicked
              notification.onclick = () => {
                notification.close();
                window.focus();
              };
            }
          }
        });
      }
    };

    // Run check immediately and set up interval (fallback only)
    checkDueReminders();
    const intervalId = setInterval(checkDueReminders, 30000); // Check every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [reminders]);

  // Clean up notification flags when order is completed or removed
  useEffect(() => {
    const cleanupNotifications = (id: string) => {
      localStorage.removeItem(`notified-${id}`);
    };

    const handleBeforeUnload = () => {
      reminders.forEach(reminder => cleanupNotifications(reminder.id));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [reminders]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const addReminder = (orderNumber: string, section: string) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      orderNumber,
      section,
      createdAt: Date.now()
    };
    setReminders(prev => [...prev, newReminder]);
    
    // Test notification immediately
    console.log('🧪 Testing notification for new reminder');
    if (Notification.permission === 'granted') {
      new Notification(` Order Pickup Reminder`, {
        body: `Don't forget order N : ${orderNumber}, ${section}`,
        icon: '/icon-192x192.png'
      });
    }
  };


  const completeOrder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      const completedOrder: CompletedOrder = {
        id: reminder.id,
        orderNumber: reminder.orderNumber,
        section: reminder.section,
        completedAt: new Date().toLocaleTimeString()
      };
      setCompletedOrders(prev => [completedOrder, ...prev.slice(0, 9)]);
      setReminders(prev => prev.filter(r => r.id !== id));
      localStorage.removeItem(`notified-${id}`);
      
      // Notify service worker to cleanup alarm
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.active?.postMessage({
            type: 'CLEANUP_ALARM',
            reminderId: id
          });
        });
      }
    }
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    localStorage.removeItem(`notified-${id}`);
    
    // Notify service worker to cleanup alarm
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'CLEANUP_ALARM',
          reminderId: id
        });
      });
    }
  };

  return (
    <div className="app">
      <Header isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
      
      
      
      <main className="main-content">
        <Dashboard
          reminders={reminders}
          onCompleteOrder={completeOrder}
          onRemoveReminder={removeReminder}
        />
        <CreateReminderForm onAddReminder={addReminder} />
        <SuccessfulPickups completedOrders={completedOrders} />
      </main>
      <Footer />
    </div>
  );
};

export default App;