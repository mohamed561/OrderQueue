import React, { useState, useEffect } from 'react';
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

  // Load from localStorage on mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('reminders');
    const savedCompleted = localStorage.getItem('completedOrders');
    const savedTheme = localStorage.getItem('theme');

    if (savedReminders) setReminders(JSON.parse(savedReminders));
    if (savedCompleted) setCompletedOrders(JSON.parse(savedCompleted));
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Save completed orders to localStorage
  useEffect(() => {
    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
  }, [completedOrders]);

  // Save theme to localStorage
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : '';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Ask notification permission
  useEffect(() => {
    Notification.requestPermission();
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const addReminder = (orderNumber: string, section: string) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      orderNumber,
      section,
      createdAt: Date.now()
    };
    setReminders(prev => [...prev, newReminder]);
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
    }
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Notification every 10 minutes (600,000 ms)
useEffect(() => {
  const checkInterval = setInterval(() => {
    if (reminders.length > 0) {
      reminders.forEach(reminder => {
        if (Notification.permission === 'granted') {
          new Notification(`🛎 Reminder: Order #${reminder.orderNumber}`, {
            body: `Section: ${reminder.section}\nYou still haven't picked it up!`,
            silent: false
          });
        }

        if (navigator.vibrate) {
          navigator.vibrate([300, 100, 300]);
        }
      });
    }
  }, 10 * 60 * 1000); // ⏱️ 10 minutes in milliseconds

  return () => clearInterval(checkInterval);
}, [reminders]);

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
