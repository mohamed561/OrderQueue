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
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (timeLeft: number, originalTime: number): number => {
    return ((originalTime - timeLeft) / originalTime) * 100;
  };

  const getUrgencyClass = (timeLeft: number): string => {
    if (timeLeft <= 60) return 'urgent';
    if (timeLeft <= 300) return 'warning';
    return '';
  };

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
              className={`reminder-card ${getUrgencyClass(reminder.timeLeft)}`}
            >
              <div className="reminder-header">
                <h3 className="order-number">Order #{reminder.orderNumber}</h3>
                <span className={`section-badge ${getSectionClass(reminder.section)}`}>
                  {reminder.section}
                </span>
              </div>
              
              <div className="time-display">
                <span className="time-left">{formatTime(reminder.timeLeft)}</span>
                <span className="time-label">remaining</span>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${getProgressPercentage(reminder.timeLeft, reminder.originalTime)}%` }}
                ></div>
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
