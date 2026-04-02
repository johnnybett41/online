import { Link } from 'react-router-dom';
import { BadgeCheck, ShieldCheck, ShoppingBag } from 'lucide-react';
import './PolicyPage.css';

const Terms = () => {
  return (
    <div className="policy-page">
      <header className="policy-page-header">
        <span className="page-kicker">Terms of Service</span>
        <h1>Simple terms for using ElectroHub.</h1>
        <p>These terms cover shopping, account use, and what to expect from our store and support team.</p>
        <div className="policy-hero-badges">
          <span><ShieldCheck size={16} /> Safe shopping</span>
          <span><ShoppingBag size={16} /> Clear order flow</span>
          <span><BadgeCheck size={16} /> Helpful support</span>
        </div>
      </header>

      <section className="policy-page-content">
        <article className="policy-card">
          <h3>Using the store</h3>
          <ul>
            <li>Keep your account details accurate and up to date</li>
            <li>Use the site responsibly and follow applicable laws</li>
            <li>Review product details before placing an order</li>
          </ul>
        </article>

        <article className="policy-card">
          <h3>Orders and support</h3>
          <ul>
            <li>Orders are confirmed after successful checkout</li>
            <li>Shipping, warranty, and return terms are shown on their respective pages</li>
            <li>We may contact you using the details you provide at checkout</li>
          </ul>
        </article>

        <article className="policy-card">
          <h3>Need clarification?</h3>
          <p>
            If anything is unclear, please reach out via our{' '}
            <Link className="policy-link" to="/contact">Contact page</Link>.
          </p>
        </article>
      </section>
    </div>
  );
};

export default Terms;
