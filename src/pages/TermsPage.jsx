import { Link } from 'react-router-dom';
import '../styles/pages.css';

const TermsPage = () => {
  return (
    <div className="page-container">
      <div className="container">
        <div className="section">
          <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Terms of Service
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                <p>
                  By accessing and using StyleDecor's website and services, you accept and agree to be bound by the 
                  terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>2. Use of Service</h2>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Eligibility</h3>
                <p style={{ marginBottom: '1rem' }}>
                  You must be at least 18 years old to use our services. By using our services, you represent and 
                  warrant that you meet this age requirement.
                </p>

                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Account Responsibility</h3>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for all 
                  activities that occur under your account. You agree to notify us immediately of any unauthorized use.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>3. Booking and Services</h2>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Service Availability</h3>
                <p style={{ marginBottom: '1rem' }}>
                  Service availability is subject to decorator schedules and location. We reserve the right to refuse 
                  or cancel bookings at our discretion.
                </p>

                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Pricing</h3>
                <p style={{ marginBottom: '1rem' }}>
                  All prices are displayed in the service listings and are subject to change. Final pricing may vary 
                  based on project scope and requirements discussed during consultation.
                </p>

                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Cancellation Policy</h3>
                <p>
                  Bookings can be cancelled or rescheduled up to 48 hours before the scheduled date without charges. 
                  Late cancellations may incur fees as specified in your booking confirmation.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>4. Payments</h2>
                <p>Payment terms include:</p>
                <ul style={{ marginLeft: '2rem' }}>
                  <li>Payment is required upon booking confirmation or as specified in the service agreement</li>
                  <li>We accept major credit cards and digital payment methods</li>
                  <li>All payments are processed through secure third-party payment gateways</li>
                  <li>Refunds are subject to our refund policy and service terms</li>
                </ul>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>5. User Conduct</h2>
                <p>You agree not to:</p>
                <ul style={{ marginLeft: '2rem' }}>
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Transmit any viruses, malware, or harmful code</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Impersonate any person or entity</li>
                  <li>Harass, abuse, or harm other users or decorators</li>
                </ul>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>6. Intellectual Property</h2>
                <p>
                  All content on the StyleDecor website, including text, graphics, logos, and software, is the property 
                  of StyleDecor and is protected by copyright and other intellectual property laws. You may not reproduce, 
                  distribute, or create derivative works without our written permission.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>7. Limitation of Liability</h2>
                <p>
                  StyleDecor shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  including loss of profits, data, or use, incurred by you or any third party, whether in an action in 
                  contract or tort, arising from your use of the service.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>8. Indemnification</h2>
                <p>
                  You agree to indemnify and hold StyleDecor harmless from any claims, damages, losses, liabilities, and 
                  expenses (including legal fees) arising from your use of the service or violation of these terms.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>9. Modifications to Service</h2>
                <p>
                  We reserve the right to modify, suspend, or discontinue any part of the service at any time, with or 
                  without notice. We shall not be liable to you or any third party for any modification, suspension, or 
                  discontinuation of the service.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>10. Governing Law</h2>
                <p>
                  These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction 
                  in which StyleDecor operates, without regard to its conflict of law provisions.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>11. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any material changes 
                  by posting the updated terms on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>12. Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <p style={{ marginTop: '1rem' }}>
                  <strong>Email:</strong> legal@styledecor.com<br />
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

export default TermsPage;
