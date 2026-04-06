import { useState } from 'react';
import { Truck, CreditCard, AlertCircle } from 'lucide-react';
import './DeliveryCheckout.css';

const DeliveryCheckout = ({ cartTotal, onSubmit, loading }) => {
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  const deliveryOptions = {
    standard: { name: 'Standard Delivery', cost: 200, days: '3-5' },
    express: { name: 'Express Delivery', cost: 500, days: '1-2' },
    pickup: { name: 'Pick Up', cost: 0, days: 'Same day' },
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (deliveryMethod !== 'pickup' && !postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required for delivery';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fullAddress = `${address}, ${city}${postalCode ? `, ${postalCode}` : ''}`;
    
    onSubmit({
      delivery_method: deliveryMethod,
      delivery_address: fullAddress,
      delivery_cost: deliveryOptions[deliveryMethod].cost,
      payment_method: paymentMethod,
      phone_number: phone,
    });
  };

  const selectedDelivery = deliveryOptions[deliveryMethod];
  const deliveryFee = selectedDelivery.cost;
  const total = cartTotal + deliveryFee;

  return (
    <form onSubmit={handleSubmit} className="delivery-checkout">
      <div className="checkout-section">
        <h3>Delivery Method</h3>
        <div className="delivery-options">
          {Object.entries(deliveryOptions).map(([key, option]) => (
            <label key={key} className={`delivery-option ${deliveryMethod === key ? 'selected' : ''}`}>
              <input
                type="radio"
                value={key}
                checked={deliveryMethod === key}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                disabled={loading}
              />
              <div className="option-content">
                <Truck size={20} />
                <div>
                  <p className="option-name">{option.name}</p>
                  <p className="option-details">{option.days} days • KES {option.cost}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="checkout-section">
        <h3>Delivery Address</h3>
        <div className="form-group">
          <label>Street Address *</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main Street"
            disabled={loading}
            className={errors.address ? 'error' : ''}
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>City *</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Nairobi"
              disabled={loading}
              className={errors.city ? 'error' : ''}
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group flex-1">
            <label>Postal Code {deliveryMethod !== 'pickup' && '*'}</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="00100"
              disabled={loading || deliveryMethod === 'pickup'}
              className={errors.postalCode ? 'error' : ''}
            />
            {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
          </div>
        </div>
      </div>

      <div className="checkout-section">
        <h3>Payment Method</h3>
        <div className="payment-options">
          <label className={`payment-option ${paymentMethod === 'mpesa' ? 'selected' : ''}`}>
            <input
              type="radio"
              value="mpesa"
              checked={paymentMethod === 'mpesa'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={loading}
            />
            <div className="option-content">
              <CreditCard size={20} />
              <div>
                <p className="option-name">M-Pesa (Online)</p>
                <p className="option-details">Pay via M-Pesa online</p>
              </div>
            </div>
          </label>

          <label className={`payment-option ${paymentMethod === 'cash_on_delivery' ? 'selected' : ''}`}>
            <input
              type="radio"
              value="cash_on_delivery"
              checked={paymentMethod === 'cash_on_delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={loading}
            />
            <div className="option-content">
              <AlertCircle size={20} />
              <div>
                <p className="option-name">Cash on Delivery</p>
                <p className="option-details">Pay when you receive</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="checkout-section">
        <h3>Contact Information</h3>
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 7XX XXX XXX"
            disabled={loading}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
      </div>

      <div className="checkout-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>KES {cartTotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery ({deliveryMethod})</span>
          <span>KES {deliveryFee.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>KES {total.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="checkout-button"
      >
        {loading ? 'Processing...' : `Pay KES ${total.toFixed(2)} with ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'}`}
      </button>
    </form>
  );
};

export default DeliveryCheckout;
