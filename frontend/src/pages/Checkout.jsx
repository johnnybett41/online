import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      axios.get('http://localhost:5000/cart').then(res => setCartItems(res.data));
    }
  }, [user]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCreateOrder = async () => {
    try {
      const res = await axios.post('http://localhost:5000/orders', { total });
      setOrderId(res.data.orderId);
    } catch (error) {
      alert('Failed to create order');
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber || !orderId) {
      alert('Please enter phone number and create order first');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/mpesa/pay', {
        phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+254${phoneNumber.replace(/^0/, '')}`,
        amount: total,
        orderId
      });

      if (res.data.success) {
        setPaymentStatus('Payment initiated. Please check your phone and complete the payment.');
        // Poll for payment status
        const checkStatus = async () => {
          try {
            const statusRes = await axios.get(`http://localhost:5000/mpesa/status/${res.data.checkoutRequestId}`);
            if (statusRes.data.ResponseCode === '0' && statusRes.data.ResultCode === '0') {
              setPaymentStatus('Payment successful! Order confirmed.');
              setTimeout(() => navigate('/orders'), 2000);
            } else if (statusRes.data.ResponseCode === '0' && statusRes.data.ResultCode !== '0') {
              setPaymentStatus('Payment failed. Please try again.');
            }
          } catch (error) {
            // Continue polling
          }
        };

        // Check status every 5 seconds for 2 minutes
        const interval = setInterval(checkStatus, 5000);
        setTimeout(() => clearInterval(interval), 120000);
      }
    } catch (error) {
      alert('Payment initiation failed');
    }
  };

  if (!user) {
    return <div>Please login to checkout.</div>;
  }

  return (
    <div>
      <h2>Checkout</h2>
      <h3>Order Summary</h3>
      {cartItems.map(item => (
        <div key={item.id}>
          <p>{item.name} x {item.quantity} - KES {item.price * item.quantity}</p>
        </div>
      ))}
      <h3>Total: KES {total.toFixed(2)}</h3>

      {!orderId ? (
        <button onClick={handleCreateOrder}>Create Order</button>
      ) : (
        <>
          <div className="form-group">
            <label>M-Pesa Phone Number (e.g., 07.....678):</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="07.....678"
              required
            />
          </div>
          <button onClick={handlePayment}>Pay with M-Pesa</button>
          {paymentStatus && <p>{paymentStatus}</p>}
        </>
      )}
    </div>
  );
};

export default Checkout;