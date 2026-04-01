import { Link } from 'react-router-dom';
import './PolicyPage.css';

const Privacy = () => {
  return (
    <div className="policy-page">
      <header className="policy-page-header">
        <span className="page-kicker">Privacy Policy</span>
        <h1>How we handle your information.</h1>
        <p>A short summary of the information we collect, how we use it, and how to contact us with questions.</p>
      </header>

      <section className="policy-page-content">
        <article className="policy-card">
          <h3>Information we collect</h3>
          <ul>
            <li>Contact details you submit through forms</li>
            <li>Order and checkout information</li>
            <li>Basic site usage data for improving the experience</li>
          </ul>
        </article>

        <article className="policy-card">
          <h3>How we use it</h3>
          <ul>
            <li>To process orders and support requests</li>
            <li>To provide shipping and warranty assistance</li>
            <li>To improve product discovery and site performance</li>
          </ul>
        </article>

        <article className="policy-card">
          <h3>Questions</h3>
          <p>
            If you want to ask about data handling, please use our{' '}
            <Link className="policy-link" to="/contact">Contact page</Link>.
          </p>
        </article>
      </section>
    </div>
  );
};

export default Privacy;
