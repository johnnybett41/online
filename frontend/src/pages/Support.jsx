import './PolicyPage.css';

const Support = () => {
  return (
    <div className="policy-page">
      <header className="policy-page-header">
        <span className="page-kicker">Technical Support</span>
        <h1>Help with products, orders, and checkout.</h1>
        <p>Use this page when you need installation guidance, order help, or payment troubleshooting.</p>
      </header>

      <section className="policy-page-content">
        <article className="policy-card">
          <h3>What we can help with</h3>
          <ul>
            <li>Product usage and installation guidance</li>
            <li>Order confirmation and payment issues</li>
            <li>Login, checkout, and account support</li>
            <li>Product troubleshooting and after-sale help</li>
          </ul>
        </article>

        <article className="policy-card">
          <h3>Contact options</h3>
          <ul>
            <li>Phone: <a className="policy-link" href="tel:0111487078">0111487078</a></li>
            <li>Email: <a className="policy-link" href="mailto:info@electrohub.co.ke">info@electrohub.co.ke</a></li>
            <li>Location: Kericho, Kenya</li>
          </ul>
        </article>

        <article className="policy-card">
          <h3>Best next step</h3>
          <p>
            If you already have an order, include your order number so we can help faster.
          </p>
        </article>
      </section>
    </div>
  );
};

export default Support;
