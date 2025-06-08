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
  timeLeft: number;
  originalTime: number;
  endedAt?: number;
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

  // Request notification permission
  useEffect(() => {
    Notification.requestPermission();
  }, []);

  // Load from localStorage on startup
  useEffect(() => {
    const savedReminders = localStorage.getItem('reminders');
    const savedCompletedOrders = localStorage.getItem('completedOrders');
    const savedTheme = localStorage.getItem('theme');

    if (savedReminders) setReminders(JSON.parse(savedReminders));
    if (savedCompletedOrders) setCompletedOrders(JSON.parse(savedCompletedOrders));
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  // Save to localStorage on reminders or completed orders change
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
  }, [completedOrders]);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : '';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const addReminder = (orderNumber: string, section: string, timer: number) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      orderNumber,
      section,
      timeLeft: timer * 60,
      originalTime: timer * 60
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

  // Timer tick + notification every 10s when expired
  useEffect(() => {
    const interval = setInterval(() => {
      setReminders(prev =>
        prev.map(reminder => {
          if (reminder.timeLeft > 0) {
            return { ...reminder, timeLeft: reminder.timeLeft - 1 };
          } else {
            if (!reminder.endedAt) {
              // First time timer ends
              if (Notification.permission === 'granted') {
                new Notification(`⏰ You still didn't pickup order #${reminder.orderNumber}`, {
                  body: `Section: ${reminder.section}\nTimer has ended!`,
                  silent: false
                });
              }
              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }
              return { ...reminder, endedAt: Date.now() };
            } else {
              const elapsed = Math.floor((Date.now() - reminder.endedAt) / 1000);
              if (elapsed % 10 === 0) {
                if (Notification.permission === 'granted') {
                  new Notification(`⏰ You still didn't pickup order #${reminder.orderNumber}`, {
                    body: `Section: ${reminder.section}`,
                    silent: false
                  });
                }
                if (navigator.vibrate) {
                  navigator.vibrate([200, 100, 200]);
                }
              }
              return reminder;
            }
          }
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
