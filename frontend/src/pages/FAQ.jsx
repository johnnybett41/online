import { Link } from 'react-router-dom';
import './PolicyPage.css';

const FAQ = () => {
  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse products, add items to your cart, then complete checkout with the available payment flow.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery timing depends on your location and stock availability, but in-stock items are dispatched quickly after payment confirmation.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We currently support M-Pesa payment at checkout.',
    },
    {
      question: 'Can I return or exchange an item?',
      answer: 'Yes. Please contact us within 3 days of delivery and we will guide you through the process.',
    },
    {
      question: 'What is your warranty period?',
      answer: 'Our products currently come with a 3-day warranty for manufacturing defects and workmanship issues.',
    },
  ];

  return (
    <div className="policy-page">
      <header className="policy-page-header">
        <span className="page-kicker">FAQ</span>
        <h1>Answers to the most common questions.</h1>
        <p>Quick help for ordering, shipping, returns, warranty, and technical support.</p>
      </header>

      <section className="policy-page-content">
        {faqs.map((faq) => (
          <article key={faq.question} className="policy-card">
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </article>
        ))}
        <article className="policy-card">
          <h3>Still need help?</h3>
          <p>
            Reach out through our <Link className="policy-link" to="/contact">Contact page</Link> and we&apos;ll help you directly.
          </p>
        </article>
      </section>
    </div>
  );
};

export default FAQ;
