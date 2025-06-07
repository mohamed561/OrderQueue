
import React from 'react';
import { Reminder } from '../App';

interface DashboardProps {
  reminders: Reminder[];
  onCompleteOrder: (id: string) => void;
  onRemoveReminder: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  reminders, 
  onCompleteOrder, 
  onRemoveReminder 
}) => {
  const getSectionClass = (section: string): string => {
    switch (section.toLowerCase()) {
      case 'boucherie':
        return 'boucherie';
      case 'volaille':
        return 'volaille';
      case 'fromage':
        return 'fromage';
      case 'boulangerie':
        return 'boulangerie';
      default:
        return '';
    }
  };

  return (
    <section className="dashboard">
      <h2 className="section-title">Active Reminders</h2>
      {reminders.length === 0 ? (
        <div className="empty-state">
          <p>No active reminders</p>
          <span className="empty-subtitle">Create a new reminder below</span>
        </div>
      ) : (
        <div className="reminders-grid">
          {reminders.map(reminder => (
            <div 
              key={reminder.id} 
              className={`reminder-card ${getSectionClass(reminder.section)}`}
            >
              <div className="reminder-header">
                <h3 className="order-number">Order #{reminder.orderNumber}</h3>
                <span className="section-badge">
                  {reminder.section}
                </span>
              </div>

              <div className="reminder-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => onCompleteOrder(reminder.id)}
                >
                  Mark as Picked Up
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => onRemoveReminder(reminder.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Dashboard;
