import { useState } from 'react';
import { PhoneCall, Mail, MapPin, Headphones, ChevronDown } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const whatsappUrl = 'https://wa.me/254111487078';
  const tiktokUrl = 'https://www.tiktok.com/@technocrat41';

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse products, add items to cart, then go to checkout and complete payment with the available M-Pesa flow.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery depends on your location and stock availability, but most confirmed orders are dispatched quickly once payment is complete.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We currently support M-Pesa payment at checkout, and the payment prompt is triggered directly after your order is created.',
    },
    {
      question: 'What is your warranty period?',
      answer: 'All products have a 3-day warranty from the date of purchase for manufacturing defects and workmanship issues.',
    },
    {
      question: 'Can I return or exchange an item?',
      answer: 'Yes. Contact us within 3 days of delivery if you want a return or exchange, and we will guide you through the process.',
    },
    {
      question: 'How do I know if a product is still available?',
      answer: 'Each product page shows the remaining stock, and low-stock or sold-out items are clearly marked on the storefront.',
    },
    {
      question: 'How do I get technical support?',
      answer: 'Use the technical support details below for help with installation, checkout, payment confirmation, or product usage.',
    },
  ];

  return (
    <div className="contact-container">
      <section className="contact-hero">
        <div className="contact-hero-copy">
          <span className="contact-kicker">Customer care</span>
          <h1>Talk to us anytime you need help.</h1>
          <p>
            Reach us for orders, product advice, shipping questions, technical support, and after-sale help.
          </p>
        </div>

        <div className="contact-hero-cards">
          <div className="contact-mini-card">
            <PhoneCall size={18} />
            <div>
              <span>Call us</span>
              <a href="tel:0111487078">0111487078</a>
            </div>
          </div>

          <div className="contact-mini-card">
            <Mail size={18} />
            <div>
              <span>Email support</span>
              <a href="mailto:info@electrohub.co.ke">info@electrohub.co.ke</a>
            </div>
          </div>

          <div className="contact-mini-card">
            <MapPin size={18} />
            <div>
              <span>Location</span>
              <strong>Kericho, Kenya</strong>
            </div>
          </div>

          <div className="social-mini-card">
            <span className="social-mini-kicker">Social communication</span>
            <p>Tap a logo to reach us on WhatsApp or TikTok.</p>
            <div className="social-mini-links">
              <a
                href={whatsappUrl}
                className="social-mini-link whatsapp"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Chat with us on WhatsApp"
              >
                <img
                  src="https://cdn.simpleicons.org/whatsapp/25D366"
                  alt=""
                  aria-hidden="true"
                />
                <span>WhatsApp</span>
              </a>
              <a
                href={tiktokUrl}
                className="social-mini-link tiktok"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Visit our TikTok profile"
              >
                <img
                  src="https://cdn.simpleicons.org/tiktok/FFFFFF"
                  alt=""
                  aria-hidden="true"
                />
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="contact-content">
        <div className="contact-info-panel">
          <div className="support-card">
            <Headphones size={26} />
            <div>
              <h3>Technical Support</h3>
              <p>Get help with installation, electrical product usage, payment issues, and site support.</p>
              <ul>
                <li>Installation guidance</li>
                <li>Order and payment confirmation</li>
                <li>Product troubleshooting</li>
                <li>Checkout and login support</li>
              </ul>
            </div>
          </div>

          <div className="contact-item-grid">
            <div className="contact-item">
              <PhoneCall size={20} />
              <h3>Phone</h3>
              <p><a href="tel:0111487078">0111487078</a></p>
            </div>

            <div className="contact-item">
              <Mail size={20} />
              <h3>Email</h3>
              <p><a href="mailto:info@electrohub.co.ke">info@electrohub.co.ke</a></p>
            </div>

            <div className="contact-item">
              <MapPin size={20} />
              <h3>Location</h3>
              <p>Kericho, Kenya</p>
            </div>
          </div>

        </div>

        <div className="contact-form-panel">
          <h3>Send us a message</h3>
          <form>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>

            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </div>

      <section className="faq-section">
        <div className="section-heading">
          <span className="contact-kicker">FAQ</span>
          <h2>Frequently asked questions</h2>
          <p>Tap a question to open the answer.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div key={faq.question} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-trigger"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={18} />
                </button>
                {isOpen && <p className="faq-answer">{faq.answer}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Contact;
