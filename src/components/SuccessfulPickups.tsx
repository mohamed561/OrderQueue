
import React from 'react';
import { CompletedOrder } from '../App';

interface SuccessfulPickupsProps {
  completedOrders: CompletedOrder[];
}

const SuccessfulPickups: React.FC<SuccessfulPickupsProps> = ({ completedOrders }) => {
  return (
    <section className="successful-pickups">
      <h2 className="section-title">Recent Pickups</h2>
      {completedOrders.length === 0 ? (
        <div className="empty-state">
          <p>No completed pickups yet</p>
        </div>
      ) : (
        <div className="completed-orders">
          {completedOrders.map(order => (
            <div key={order.id} className="completed-order">
              <div className="completed-info">
                <span className="completed-order-number">Order #{order.orderNumber}</span>
                <span className="completed-section">{order.section}</span>
              </div>
              <span className="completed-time">Picked up at {order.completedAt}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SuccessfulPickups;
