import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Get in touch with our team for any inquiries or support.</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="contact-item">
            <h3>Phone</h3>
            <p><a href="tel:0111487078">0111487078</a></p>
          </div>

          <div className="contact-item">
            <h3>Email</h3>
            <p><a href="mailto:info@electrohub.co.ke">info@electrohub.co.ke</a></p>
          </div>

          <div className="contact-item">
            <h3>Location</h3>
            <p>Kericho, Kenya</p>
          </div>
        </div>

        <div className="contact-form">
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
    </div>
  );
};

export default Contact;