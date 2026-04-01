import { useState } from 'react';
import { PhoneCall, Mail, MapPin, Headphones, ChevronDown } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse products, add the items you want to cart, then complete checkout and payment using the available flow.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery depends on your location, stock availability, and dispatch timing. Most orders leave the store quickly once payment is confirmed.',
    },
    {
      question: 'What if my item arrives damaged?',
      answer: 'Contact us right away with your order number and photos so we can help with a return, replacement, or exchange where applicable.',
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
