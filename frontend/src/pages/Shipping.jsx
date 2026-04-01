import './Shipping.css';

const Shipping = () => {
  return (
    <div className="shipping-container">
      <div className="shipping-header">
        <h1>Shipping Information</h1>
        <p>Learn about our shipping policies and delivery options.</p>
      </div>

      <div className="shipping-content">
        <div className="shipping-info">
          <div className="info-section">
            <h3>Delivery Location</h3>
            <p>We deliver to locations across Kenya, with our primary hub in Kericho.</p>
            <p><strong>Main Location:</strong> Kericho, Kenya</p>
          </div>

          <div className="info-section">
            <h3>Shipping Methods</h3>
            <ul>
              <li><strong>Standard Delivery:</strong> 3-5 business days - Free for orders over KES 5,000</li>
              <li><strong>Express Delivery:</strong> 1-2 business days - KES 500 additional fee</li>
              <li><strong>Same Day Delivery:</strong> Available in Kericho area - KES 1,000 fee</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Shipping Costs</h3>
            <ul>
              <li>Orders under KES 2,000: KES 300</li>
              <li>Orders KES 2,000 - KES 5,000: KES 150</li>
              <li>Orders over KES 5,000: Free shipping</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>International Shipping</h3>
            <p>We currently offer shipping within Kenya only. International orders are not available at this time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;