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
}

export interface CompletedOrder {
  id: string;
  orderNumber: string;
  section: string;
  completedAt: string;
}

const App: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>(() => {
    const saved = localStorage.getItem('completedOrders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : '';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Persist reminders on change
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Persist completedOrders on change
  useEffect(() => {
    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
  }, [completedOrders]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
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
