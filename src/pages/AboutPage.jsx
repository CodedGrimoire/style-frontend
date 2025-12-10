import '../styles/pages.css';
import 'animate.css';

const AboutPage = () => {
  return (
    <div className="page-container">
      <div className="container">
        <div className="section animate__animated animate__fadeInUp">
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            color: 'var(--burgundy-dark)'
          }}>
            About Us
          </h1>
          
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--burgundy)', marginBottom: '1.5rem' }}>
              Welcome to Style Decor
            </h2>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: 'var(--gray-dark)' }}>
              We are a premier decoration service provider dedicated to transforming spaces 
              into beautiful, functional environments. With years of experience in interior 
              and exterior design, we bring your vision to life.
            </p>
            
            <h3 style={{ color: 'var(--burgundy)', marginTop: '2rem', marginBottom: '1rem' }}>
              Our Mission
            </h3>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: 'var(--gray-dark)' }}>
              To provide exceptional decoration services that exceed our clients' expectations 
              while maintaining the highest standards of quality and professionalism.
            </p>
            
            <h3 style={{ color: 'var(--burgundy)', marginTop: '2rem', marginBottom: '1rem' }}>
              What We Offer
            </h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              marginBottom: '1.5rem'
            }}>
              <li style={{ 
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--beige)',
                color: 'var(--gray-dark)'
              }}>
                <i className="fa-solid fa-check" style={{ color: 'var(--magenta)', marginRight: '0.5rem' }}></i>
                Interior Design & Decoration
              </li>
              <li style={{ 
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--beige)',
                color: 'var(--gray-dark)'
              }}>
                <i className="fa-solid fa-check" style={{ color: 'var(--magenta)', marginRight: '0.5rem' }}></i>
                Exterior Design Services
              </li>
              <li style={{ 
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--beige)',
                color: 'var(--gray-dark)'
              }}>
                <i className="fa-solid fa-check" style={{ color: 'var(--magenta)', marginRight: '0.5rem' }}></i>
                Event Decoration
              </li>
              <li style={{ 
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--beige)',
                color: 'var(--gray-dark)'
              }}>
                <i className="fa-solid fa-check" style={{ color: 'var(--magenta)', marginRight: '0.5rem' }}></i>
                Commercial & Residential Projects
              </li>
            </ul>
            
            <div style={{ 
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'var(--gray-light)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--burgundy)'
            }}>
              <p style={{ 
                margin: 0, 
                fontStyle: 'italic',
                color: 'var(--gray-dark)'
              }}>
                "Creating beautiful spaces that reflect your unique style and personality."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

