import './Warranty.css';

const Warranty = () => {
  return (
    <div className="warranty-container">
      <div className="warranty-header">
        <span className="page-kicker">Warranty</span>
        <h1>Simple 3-day warranty support.</h1>
        <p>We back products with a short, clear warranty window so you can report issues fast.</p>
      </div>

      <div className="warranty-content">
        <div className="warranty-info">
          <div className="warranty-period">
            <h3>Warranty Period</h3>
            <p>All our products come with a <strong>3-day warranty</strong> from the date of purchase for manufacturing defects and workmanship issues.</p>
          </div>

          <div className="warranty-coverage">
            <h3>What's Covered</h3>
            <ul>
              <li>Manufacturing defects</li>
              <li>Workmanship issues</li>
              <li>Component failures under normal use</li>
              <li>Electrical faults in wiring and connections</li>
            </ul>
          </div>

          <div className="warranty-exclusions">
            <h3>What's Not Covered</h3>
            <ul>
              <li>Normal wear and tear</li>
              <li>Damage from misuse or abuse</li>
              <li>Damage from accidents or natural disasters</li>
              <li>Modifications or unauthorized repairs</li>
              <li>Damage from power surges or voltage fluctuations</li>
            </ul>
          </div>

          <div className="warranty-process">
            <h3>How to Claim Warranty</h3>
            <ol>
              <li>Contact our customer service within 3 days of purchase</li>
              <li>Provide proof of purchase and describe the issue</li>
              <li>We'll arrange for inspection or repair</li>
              <li>If repair is not possible, we'll provide a replacement or refund</li>
            </ol>
          </div>

          <div className="warranty-contact">
            <h3>Contact for Warranty Claims</h3>
            <p>Phone: <a href="tel:0111487078">0111487078</a></p>
            <p>Email: <a href="mailto:info@electrohub.co.ke">info@electrohub.co.ke</a></p>
            <p>Location: Kericho, Kenya</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Warranty;
