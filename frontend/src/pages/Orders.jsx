import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      axios.get('http://localhost:5000/orders').then(res => setOrders(res.data));
    }
  }, [user]);

  if (!user) {
    return <div>Please login to view your orders.</div>;
  }

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order.id}>
            <h3>Order #{order.id}</h3>
            <p>Total: KES {order.total}</p>
            <p>Status: {order.status === 'pending_payment' ? 'Payment Pending' : order.status === 'paid' ? 'Paid' : order.status}</p>
            <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;