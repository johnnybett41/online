import './Returns.css';

const Returns = () => {
  return (
    <div className="returns-container">
      <div className="returns-header">
        <span className="page-kicker">Returns & exchange</span>
        <h1>Simple return and exchange support.</h1>
        <p>We keep the process short and clear so you know what to do when something is not right.</p>
      </div>

      <div className="returns-content">
        <div className="policy-grid">
          <div className="policy-section featured">
            <h3>Return Window</h3>
            <p>Contact us within 3 days of delivery if you need a return or exchange request.</p>
          </div>

          <div className="policy-section">
            <h3>Eligible Items</h3>
            <ul>
              <li>Unused items in original packaging</li>
              <li>Items with proof of purchase</li>
              <li>Products that were delivered incorrectly</li>
            </ul>
          </div>

          <div className="policy-section">
            <h3>How to Return</h3>
            <ol>
              <li>Contact our team with your order number</li>
              <li>Explain the issue and attach photos if needed</li>
              <li>Wait for confirmation before sending the item back</li>
              <li>Drop off or ship the item to our Kericho address</li>
            </ol>
          </div>

          <div className="policy-section">
            <h3>Exchanges</h3>
            <p>
              If you want a different item or model, we will help arrange an exchange once the original item is received
              and inspected.
            </p>
          </div>

          <div className="policy-section wide">
            <h3>Refunds</h3>
            <p>
              Approved refunds are processed back to the original payment method after inspection and confirmation.
            </p>
          </div>
        </div>

        <div className="contact-info">
          <h3>Contact Us for Returns</h3>
          <p>Phone: <a href="tel:0111487078">0111487078</a></p>
          <p>Email: <a href="mailto:info@electrohub.co.ke">info@electrohub.co.ke</a></p>
        </div>
      </div>
    </div>
  );
};

export default Returns;
