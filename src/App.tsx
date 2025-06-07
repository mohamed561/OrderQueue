
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CreateReminderForm from './components/CreateReminderForm';
import SuccessfulPickups from './components/SuccessfulPickups';
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

  useEffect(() => {
    const interval = setInterval(() => {
      setReminders(prev => 
        prev.map(reminder => ({
          ...reminder,
          timeLeft: Math.max(0, reminder.timeLeft - 1)
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      <Header />
      <main className="main-content">
        <Dashboard 
          reminders={reminders}
          onCompleteOrder={completeOrder}
          onRemoveReminder={removeReminder}
        />
        <CreateReminderForm onAddReminder={addReminder} />
        <SuccessfulPickups completedOrders={completedOrders} />
      </main>
    </div>
  );
};

export default App;
