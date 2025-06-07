
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
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

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
