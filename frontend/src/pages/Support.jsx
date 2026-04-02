import { ArrowRight, BadgeCheck, Headphones, PhoneCall, Mail, MapPin, ShieldCheck, Truck } from 'lucide-react';
import './PolicyPage.css';

const Support = () => {
  return (
    <div className="policy-page policy-page--support">
      <header className="policy-page-header policy-page-header--support">
        <span className="page-kicker">Technical Support</span>
        <h1>Help with products, orders, and checkout.</h1>
        <p>Use this page when you need installation guidance, order help, or payment troubleshooting.</p>
        <div className="policy-hero-badges">
          <span><ShieldCheck size={16} /> Safe support</span>
          <span><Truck size={16} /> Fast responses</span>
          <span><BadgeCheck size={16} /> Friendly guidance</span>
        </div>
      </header>

      <section className="policy-page-content policy-page-content--support">
        <article className="policy-card policy-card--highlight">
          <div className="support-card__icon">
            <Headphones size={26} />
          </div>
          <div>
            <h3>What we can help with</h3>
            <ul>
              <li>Product usage and installation guidance</li>
              <li>Order confirmation and payment issues</li>
              <li>Login, checkout, and account support</li>
              <li>Product troubleshooting and after-sale help</li>
            </ul>
          </div>
        </article>

        <div className="support-contact-grid">
          <article className="policy-card support-contact-card">
            <PhoneCall size={20} />
            <h3>Phone</h3>
            <p><a className="policy-link" href="tel:0111487078">0111487078</a></p>
          </article>

          <article className="policy-card support-contact-card">
            <Mail size={20} />
            <h3>Email</h3>
            <p><a className="policy-link" href="mailto:info@electrohub.co.ke">info@electrohub.co.ke</a></p>
          </article>

          <article className="policy-card support-contact-card">
            <MapPin size={20} />
            <h3>Location</h3>
            <p>Kericho, Kenya</p>
          </article>
        </div>

        <article className="policy-card">
          <h3>Best next step</h3>
          <p>
            If you already have an order, include your order number so we can help faster.
          </p>
          <a href="/contact" className="policy-cta">
            Go to Contact <ArrowRight size={16} />
          </a>
        </article>
      </section>
    </div>
  );
};

export default Support;
