import { useEffect, useState } from 'react';
import { Truck, CreditCard, AlertCircle } from 'lucide-react';
import { KENYA_COUNTIES, getCountyLocationProfile } from '../utils/kenyaLocations';
import { loadSavedAddresses, saveAddressBookEntry } from '../utils/savedAddresses';
import './DeliveryCheckout.css';

const DeliveryCheckout = ({ cartTotal, onSubmit, loading, userId }) => {
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [address, setAddress] = useState('');
  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState('');

  useEffect(() => {
    if (!userId) {
      setSavedAddresses([]);
      setSelectedSavedAddressId('');
      return;
    }

    const addresses = loadSavedAddresses(userId);
    setSavedAddresses(addresses);
    const firstAddress = addresses[0];
    setSelectedSavedAddressId(firstAddress?.savedAt ? String(firstAddress.savedAt) : '');

    if (firstAddress) {
      setAddress(firstAddress.delivery_address || '');
      setCounty(firstAddress.delivery_county || '');
      setTown(firstAddress.delivery_town || '');
      setPostalCode(firstAddress.delivery_postal_code || '');
      setPhone(firstAddress.phone_number || '');
    }
  }, [userId]);

  const selectedCountyProfile = getCountyLocationProfile(county);
  const townOptions = selectedCountyProfile?.towns || [];
  const postalHint = selectedCountyProfile?.postalCode || '';

  const deliveryOptions = {
    standard: { name: 'Standard Delivery', cost: 200, days: '3-5' },
    express: { name: 'Express Delivery', cost: 500, days: '1-2' },
    pickup: { name: 'Pick Up', cost: 0, days: 'Same day' },
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!county.trim()) newErrors.county = 'County is required';
    if (!town.trim()) newErrors.town = 'Town is required';
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

    const fullAddress = `${address}, ${town}, ${county}${postalCode ? `, ${postalCode}` : ''}`;

    if (userId) {
      saveAddressBookEntry(userId, {
        delivery_address: address.trim(),
        delivery_county: county.trim(),
        delivery_town: town.trim(),
        delivery_postal_code: postalCode.trim(),
        phone_number: phone.trim(),
      });
    }
    
    onSubmit({
      delivery_method: deliveryMethod,
      delivery_address: fullAddress,
      delivery_county: county,
      delivery_town: town,
      delivery_postal_code: postalCode,
      delivery_cost: deliveryOptions[deliveryMethod].cost,
      payment_method: paymentMethod,
      phone_number: phone,
    });
  };

  const handleCountyChange = (event) => {
    const nextCounty = event.target.value;
    const nextProfile = getCountyLocationProfile(nextCounty);
    const nextTown = nextProfile?.defaultTown || '';
    setCounty(nextCounty);
    setTown(nextTown);
    setPostalCode(nextProfile?.postalCode || '');
    setErrors((current) => ({
      ...current,
      county: '',
      town: '',
      postalCode: '',
    }));
  };

  const handleTownChange = (event) => {
    const nextTown = event.target.value;
    setTown(nextTown);

    const matchedTown = townOptions.find((option) => option.name.toLowerCase() === nextTown.trim().toLowerCase());
    if (matchedTown?.postalCode) {
      setPostalCode(matchedTown.postalCode);
    }
  };

  const handleSavedAddressChange = (event) => {
    const savedAt = event.target.value;
    setSelectedSavedAddressId(savedAt);

    if (!savedAt) {
      return;
    }

    const selectedAddress = savedAddresses.find((entry) => String(entry.savedAt) === savedAt);
    if (!selectedAddress) {
      return;
    }

    setAddress(selectedAddress.delivery_address || '');
    setCounty(selectedAddress.delivery_county || '');
    setTown(selectedAddress.delivery_town || '');
    setPostalCode(selectedAddress.delivery_postal_code || '');
    setPhone(selectedAddress.phone_number || '');
  };

  const selectedDelivery = deliveryOptions[deliveryMethod];
  const deliveryFee = selectedDelivery.cost;
  const total = cartTotal + deliveryFee;

  return (
    <form onSubmit={handleSubmit} className="delivery-checkout">
      <div className="checkout-section checkout-section--delivery">
        <div className="checkout-section__header">
          <span className="checkout-section__kicker">Step 1</span>
          <div>
            <h3>Delivery Method</h3>
            <p>Choose how you want the order to reach you.</p>
          </div>
        </div>
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
                  <p className="option-details">{option.days} days | KES {option.cost}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="checkout-section checkout-section--address">
        <div className="checkout-section__header">
          <span className="checkout-section__kicker">Step 2</span>
          <div>
            <h3>Delivery Address</h3>
            <p>We use this address for dispatch and tracking.</p>
          </div>
        </div>
        <div className="form-group">
          {savedAddresses.length > 0 && (
            <>
              <label>Saved Address</label>
              <select
                value={selectedSavedAddressId}
                onChange={handleSavedAddressChange}
                disabled={loading}
              >
                <option value="">Enter a new address</option>
                {savedAddresses.map((savedAddress) => (
                  <option key={savedAddress.savedAt} value={savedAddress.savedAt}>
                    {savedAddress.delivery_town}, {savedAddress.delivery_county}
                  </option>
                ))}
              </select>
              <span className="form-hint">Pick a saved address to fill the form instantly.</span>
            </>
          )}
        </div>

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
            <label>County *</label>
            <select
              value={county}
              onChange={handleCountyChange}
              disabled={loading}
              className={errors.county ? 'error' : ''}
            >
              <option value="">Select a county</option>
              {KENYA_COUNTIES.map((countyName) => (
                <option key={countyName} value={countyName}>
                  {countyName}
                </option>
              ))}
            </select>
            {errors.county && <span className="error-message">{errors.county}</span>}
          </div>

          <div className="form-group flex-1">
            <label>Town / City *</label>
            <input
              type="text"
              value={town}
              onChange={handleTownChange}
              placeholder={selectedCountyProfile?.defaultTown || 'Nairobi'}
              disabled={loading}
              className={errors.town ? 'error' : ''}
              list="town-suggestions"
            />
            <datalist id="town-suggestions">
              {townOptions.map((option) => (
                <option key={option.name} value={option.name} />
              ))}
            </datalist>
            {townOptions.length > 0 && (
              <span className="form-hint">
                Popular towns in {county || 'your county'}
              </span>
            )}
            {errors.town && <span className="error-message">{errors.town}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Postal Code {deliveryMethod !== 'pickup' && '*'}</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder={postalHint || '00100'}
            disabled={loading || deliveryMethod === 'pickup'}
            className={errors.postalCode ? 'error' : ''}
          />
          {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
        </div>
      </div>

      <div className="checkout-section checkout-section--payment">
        <div className="checkout-section__header">
          <span className="checkout-section__kicker">Step 3</span>
          <div>
            <h3>Payment Method</h3>
            <p>Select M-Pesa or cash on delivery.</p>
          </div>
        </div>
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

      <div className="checkout-section checkout-section--contact">
        <div className="checkout-section__header">
          <span className="checkout-section__kicker">Step 4</span>
          <div>
            <h3>Contact Information</h3>
            <p>We'll use this number for updates if needed.</p>
          </div>
        </div>
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
