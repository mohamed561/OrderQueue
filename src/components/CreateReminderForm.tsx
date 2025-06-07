
import React, { useState } from 'react';

interface CreateReminderFormProps {
  onAddReminder: (orderNumber: string, section: string, timer: number) => void;
}

const CreateReminderForm: React.FC<CreateReminderFormProps> = ({ onAddReminder }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [section, setSection] = useState('');

  const sectionOptions = ['Boucherie', 'Volaille', 'Fromage', 'Boulangerie'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim() || !section) {
      return;
    }

    // Default timer of 15 minutes since it's no longer user input
    onAddReminder(orderNumber.trim(), section, 15);
    setOrderNumber('');
    setSection('');
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
          <select
            id="section"
            className="form-input"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
          >
            <option value="">Select a section</option>
            {sectionOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-full"
          disabled={!orderNumber.trim() || !section}
        >
          Create Reminder
        </button>
      </form>
    </section>
  );
};

export default CreateReminderForm;
