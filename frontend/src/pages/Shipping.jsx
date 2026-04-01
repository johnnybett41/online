import './Shipping.css';

const Shipping = () => {
  return (
    <div className="shipping-container">
      <div className="shipping-header">
        <span className="page-kicker">Shipping & delivery</span>
        <h1>Fast, simple delivery information.</h1>
        <p>Clear shipping windows, fair fees, and real support for customers across Kenya.</p>
      </div>

      <div className="shipping-content">
        <div className="shipping-grid">
          <div className="info-section">
            <h3>Delivery Location</h3>
            <p>We deliver across Kenya with dispatch arranged from our Kericho base.</p>
            <p><strong>Main Location:</strong> Kericho, Kenya</p>
          </div>

          <div className="info-section">
            <h3>Processing Time</h3>
            <p>Orders are prepared after payment confirmation and stock verification.</p>
            <p>Most in-stock items leave our store within 24 hours on working days.</p>
          </div>

          <div className="info-section">
            <h3>Delivery Options</h3>
            <ul>
              <li><strong>Standard Delivery:</strong> 3-5 business days</li>
              <li><strong>Express Delivery:</strong> 1-2 business days</li>
              <li><strong>Kericho Local Delivery:</strong> Same or next day where available</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Shipping Costs</h3>
            <ul>
              <li>Small orders: from KES 300</li>
              <li>Mid-size orders: from KES 150</li>
              <li>Large orders: discounted or free shipping when available</li>
            </ul>
          </div>

          <div className="info-section wide">
            <h3>Delivery Notes</h3>
            <p>
              Please make sure your phone number and location details are correct so our team can confirm
              dispatch and delivery faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
