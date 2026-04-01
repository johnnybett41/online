import './Returns.css';

const Returns = () => {
  return (
    <div className="returns-container">
      <div className="returns-header">
        <h1>Returns & Exchanges</h1>
        <p>Our policy for returning or exchanging products.</p>
      </div>

      <div className="returns-content">
        <div className="policy-section">
          <h3>Return Policy</h3>
          <p>We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 30 days of delivery for a full refund or exchange.</p>
        </div>

        <div className="policy-section">
          <h3>Eligibility for Returns</h3>
          <ul>
            <li>Items must be in their original condition and packaging</li>
            <li>Return request must be made within 30 days of delivery</li>
            <li>Items must not have been used or installed</li>
            <li>Original receipt or proof of purchase required</li>
          </ul>
        </div>

        <div className="policy-section">
          <h3>How to Return an Item</h3>
          <ol>
            <li>Contact our customer service team</li>
            <li>Provide your order number and reason for return</li>
            <li>Package the item securely in its original packaging</li>
            <li>Ship the item back to our warehouse in Kericho</li>
            <li>Once received, we'll process your refund or exchange within 5-7 business days</li>
          </ol>
        </div>

        <div className="policy-section">
          <h3>Exchanges</h3>
          <p>If you need to exchange an item for a different size, color, or model, please contact us within 30 days of delivery. We'll arrange for the exchange at no additional cost.</p>
        </div>

        <div className="policy-section">
          <h3>Refunds</h3>
          <p>Refunds will be processed to the original payment method within 5-7 business days after we receive and inspect the returned item.</p>
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