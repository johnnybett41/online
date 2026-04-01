import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <div className="hero-content">
          <h1>About ElectroHub</h1>
          <p>Your trusted partner for electrical solutions in Kenya</p>
        </div>
      </div>

      <div className="about-content">
        <section className="about-section">
          <div className="section-content">
            <h2>Our Story</h2>
            <p>
              Founded in 2024, ElectroHub has been at the forefront of providing high-quality electrical
              products and solutions to customers across Kenya. Based in Kericho, we understand the
              unique electrical needs of our community and are committed to delivering reliable,
              affordable, and innovative products.
            </p>
          </div>
          <div className="section-image">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop" alt="Electrical products" />
          </div>
        </section>

        <section className="about-section reverse">
          <div className="section-content">
            <h2>Our Mission</h2>
            <p>
              To empower Kenyan homes and businesses with safe, efficient, and sustainable electrical
              solutions. We strive to make quality electrical products accessible to everyone while
              promoting energy efficiency and electrical safety.
            </p>
          </div>
          <div className="section-image">
            <img src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&h=300&fit=crop" alt="Solar energy" />
          </div>
        </section>

        <section className="about-section">
          <div className="section-content">
            <h2>Why Choose ElectroHub?</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>Quality Products</h3>
                <p>We source products from reputable manufacturers ensuring durability and performance.</p>
              </div>
              <div className="feature-item">
                <h3>Expert Knowledge</h3>
                <p>Our team of electrical experts provides guidance and technical support.</p>
              </div>
              <div className="feature-item">
                <h3>Local Support</h3>
                <p>Based in Kericho with fast delivery and responsive customer service.</p>
              </div>
              <div className="feature-item">
                <h3>Competitive Pricing</h3>
                <p>Fair pricing with transparent costs and regular promotions.</p>
              </div>
            </div>
          </div>
          <div className="section-image">
            <img src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=500&h=300&fit=crop" alt="Tools and equipment" />
          </div>
        </section>

        <section className="about-section reverse">
          <div className="section-content">
            <h2>Our Services</h2>
            <ul className="services-list">
              <li>Electrical product sales and distribution</li>
              <li>Technical consultation and advice</li>
              <li>Installation guidance and support</li>
              <li>Warranty services and repairs</li>
              <li>Educational resources and training</li>
              <li>Custom electrical solutions</li>
            </ul>
          </div>
          <div className="section-image">
            <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=300&fit=crop" alt="Electrical components" />
          </div>
        </section>

        <section className="contact-section">
          <h2>Get In Touch</h2>
          <div className="contact-info">
            <div className="contact-item">
              <h3>Visit Us</h3>
              <p>Kericho, Kenya</p>
            </div>
            <div className="contact-item">
              <h3>Call Us</h3>
              <p><a href="tel:0111487078">0111487078</a></p>
            </div>
            <div className="contact-item">
              <h3>Email Us</h3>
              <p><a href="mailto:info@electrohub.co.ke">info@electrohub.co.ke</a></p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;