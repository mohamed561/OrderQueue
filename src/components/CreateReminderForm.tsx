
import React, { useState } from 'react';

interface CreateReminderFormProps {
  onAddReminder: (orderNumber: string, section: string, timer: number) => void;
}

const CreateReminderForm: React.FC<CreateReminderFormProps> = ({ onAddReminder }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [section, setSection] = useState('');
  const [timer, setTimer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim() || !section.trim() || !timer.trim()) {
      return;
    }

    const timerMinutes = parseInt(timer);
    if (isNaN(timerMinutes) || timerMinutes <= 0) {
      return;
    }

    onAddReminder(orderNumber.trim(), section.trim(), timerMinutes);
    setOrderNumber('');
    setSection('');
    setTimer('');
  };

  return (
    <section className="create-reminder">
      <h2 className="section-title">Create New Reminder</h2>
      <form className="reminder-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="orderNumber">
            Order Number
          </label>
          <input
            type="text"
            id="orderNumber"
            className="form-input"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter order number"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="section">
            Section
          </label>
          <input
            type="text"
            id="section"
            className="form-input"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g., Electronics, Grocery"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="timer">
            Timer (minutes)
          </label>
          <input
            type="number"
            id="timer"
            className="form-input"
            value={timer}
            onChange={(e) => setTimer(e.target.value)}
            placeholder="Enter minutes"
            min="1"
            max="999"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-full"
          disabled={!orderNumber.trim() || !section.trim() || !timer.trim()}
        >
          Create Reminder
        </button>
      </form>
    </section>
  );
};

export default CreateReminderForm;
