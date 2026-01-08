import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import 'animate.css';

const HelpPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        { q: 'How do I book a decoration service?', a: 'Browse our services page, select a service that fits your needs, and click "Book Now". You\'ll need to create an account or log in to complete the booking.' },
        { q: 'Do I need to create an account?', a: 'Yes, creating an account is required to book services. It allows you to track your bookings, make payments, and communicate with decorators.' },
        { q: 'What information do I need to provide?', a: 'You\'ll need to provide your contact information, preferred service date and time, location, and any specific requirements for your decoration project.' }
      ]
    },
    {
      category: 'Services & Pricing',
      questions: [
        { q: 'How are service prices determined?', a: 'Prices vary based on the type of service, scope of work, materials required, and project duration. Each service listing shows the base price and unit (per hour, per room, etc.).' },
        { q: 'Can I customize a service package?', a: 'Yes, during the consultation phase, our decorators will discuss customization options to meet your specific needs and budget.' },
        { q: 'Are there any hidden fees?', a: 'No hidden fees. All costs are transparent and discussed upfront. You\'ll see the total price before confirming your booking.' }
      ]
    },
    {
      category: 'Payments & Cancellations',
      questions: [
        { q: 'What payment methods do you accept?', a: 'We accept major credit cards, debit cards, and digital payment methods through our secure payment gateway.' },
        { q: 'When do I need to pay?', a: 'Payment is typically required after booking confirmation. For larger projects, we may offer payment plans with an initial deposit.' },
        { q: 'Can I cancel or reschedule my booking?', a: 'Yes, you can cancel or reschedule bookings up to 48 hours before the scheduled date through your dashboard without any charges.' }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        { q: 'I\'m having trouble logging in. What should I do?', a: 'Try resetting your password using the "Forgot Password" link. If issues persist, contact our support team at support@styledecor.com.' },
        { q: 'How do I update my profile information?', a: 'Log in to your dashboard and navigate to the "My Profile" section where you can update your information.' },
        { q: 'The website is not loading properly. What can I do?', a: 'Try clearing your browser cache, using a different browser, or checking your internet connection. If the problem continues, contact our technical support.' }
      ]
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="section">
          <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Help & Support
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
            Find answers to common questions or get in touch with our support team
          </p>

          {/* Quick Links */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            <Link to="/contact" className="card" style={{ textAlign: 'center', textDecoration: 'none', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Contact Us</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Get in touch with our support team</p>
            </Link>
            <Link to="/services" className="card" style={{ textAlign: 'center', textDecoration: 'none', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Browse Services</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Explore our decoration services</p>
            </Link>
            <Link to="/about" className="card" style={{ textAlign: 'center', textDecoration: 'none', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>ℹ️</div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>About Us</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Learn more about StyleDecor</p>
            </Link>
          </div>

          {/* FAQ Sections */}
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '1.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid var(--border-color)'
                }}>
                  {category.category}
                </h2>
                {category.questions.map((faq, faqIndex) => {
                  const index = `${categoryIndex}-${faqIndex}`;
                  const isOpen = openFaq === index;
                  return (
                    <div 
                      key={faqIndex}
                      className="card"
                      style={{ 
                        marginBottom: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => toggleFaq(index)}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ 
                          color: 'var(--text-primary)', 
                          margin: 0,
                          fontSize: '1.1rem',
                          flex: 1
                        }}>
                          {faq.q}
                        </h3>
                        <span style={{ 
                          fontSize: '1.5rem', 
                          color: 'var(--primary)',
                          transition: 'transform 0.3s',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </span>
                      </div>
                      {isOpen && (
                        <p style={{ 
                          color: 'var(--text-secondary)', 
                          marginTop: '1rem',
                          lineHeight: '1.8',
                          paddingTop: '1rem',
                          borderTop: '1px solid var(--border-color)'
                        }}>
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '2rem',
            maxWidth: '600px',
            margin: '3rem auto 0',
            background: 'var(--bg-tertiary)'
          }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Still Need Help?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Our support team is here to assist you. Reach out to us through any of these channels:
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a 
                href="mailto:support@styledecor.com" 
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                Email Support
              </a>
              <Link to="/contact" className="btn-outline">
                Contact Form
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
