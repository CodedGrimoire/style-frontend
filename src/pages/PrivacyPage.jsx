import { Link } from 'react-router-dom';
import '../styles/pages.css';

const PrivacyPage = () => {
  return (
    <div className="page-container">
      <div className="container">
        <div className="section">
          <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Privacy Policy
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>1. Introduction</h2>
                <p>
                  StyleDecor ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
                  how we collect, use, disclose, and safeguard your information when you use our website and services.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>2. Information We Collect</h2>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Personal Information</h3>
                <p style={{ marginBottom: '1rem' }}>
                  We collect information that you provide directly to us, including:
                </p>
                <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials and profile information</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Booking and service preferences</li>
                  <li>Communication history with our team</li>
                </ul>

                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Automatically Collected Information</h3>
                <p>
                  We automatically collect certain information when you visit our website, including:
                </p>
                <ul style={{ marginLeft: '2rem' }}>
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website addresses</li>
                </ul>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>3. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul style={{ marginLeft: '2rem' }}>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process bookings and manage your account</li>
                  <li>Communicate with you about services, bookings, and updates</li>
                  <li>Send marketing communications (with your consent)</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>4. Information Sharing</h2>
                <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                <ul style={{ marginLeft: '2rem' }}>
                  <li><strong>Service Providers:</strong> With third-party service providers who perform services on our behalf</li>
                  <li><strong>Decorators:</strong> With assigned decorators to facilitate service delivery</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information. 
                  However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul style={{ marginLeft: '2rem' }}>
                  <li>Access and receive a copy of your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to processing of your personal information</li>
                  <li>Withdraw consent for marketing communications</li>
                </ul>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>7. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist 
                  with marketing efforts. You can control cookie preferences through your browser settings.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>8. Children's Privacy</h2>
                <p>
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect 
                  personal information from children.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>9. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>10. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p style={{ marginTop: '1rem' }}>
                  <strong>Email:</strong> privacy@styledecor.com<br />
                  <strong>Address:</strong> StyleDecor, 123 Dhaka City, SC 12345<br />
                  <Link to="/contact" style={{ color: 'var(--primary)' }}>Contact Form</Link>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
