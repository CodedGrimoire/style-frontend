import { useEffect, useState } from 'react';
import '../styles/pages.css';
import ServiceCoverageMap from '../components/ServiceCoverageMap';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import 'animate.css';
import { getServices, getTopDecorators } from '../services/api';

const HomePage = () => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topDecorators, setTopDecorators] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesResponse = await getServices();
        setFeaturedServices(servicesResponse.data?.slice(0, 6) || []);

        try {
          const decoratorsResponse = await getTopDecorators();
          let decorators = [];

          if (Array.isArray(decoratorsResponse)) {
            decorators = decoratorsResponse;
          } else if (decoratorsResponse?.data) {
            decorators = Array.isArray(decoratorsResponse.data) ? decoratorsResponse.data : [];
          }
          
          decorators = decorators
            .filter(d => d.status === 'approved') 
            .sort((a, b) => (b.rating || 0) - (a.rating || 0)) 
            .slice(0, 3);
          
          setTopDecorators(decorators);
        } catch (error) {
          console.error('Error fetching top decorators:', error);
          setTopDecorators([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setTimeout(() => setAnimate(true), 100);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      {/* Section 1: Hero Section */}
      <section className="hero-section" style={{ maxHeight: '70vh', overflow: 'hidden' }}>
        <div className="container">
          <div className={`hero-content ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            <h1 className="hero-title">Welcome to StyleDecor</h1>
            <p className="hero-subtitle">
              Transform your space with our professional decoration services. 
              We bring your vision to life with expert design and quality craftsmanship.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/services" className="btn-primary hero-cta">
                Book Decoration Service
              </Link>
              <Link to="/about" className="btn-outline hero-cta">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Features */}
      <section className="section">
        <div className="container">
          <h2 className={`section-title ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            Why Choose StyleDecor?
          </h2>
          <p className={`section-subtitle ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            Experience excellence in every detail
          </p>
          <div className="features-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem', 
            marginTop: '3rem' 
          }}>
            {[
              { icon: '🎨', title: 'Expert Designers', desc: 'Professional decorators with years of experience' },
              { icon: '✨', title: 'Quality Materials', desc: 'Premium materials and finishes for lasting beauty' },
              { icon: '⏱️', title: 'On-Time Delivery', desc: 'We respect your time and deliver as promised' },
              { icon: '💰', title: 'Competitive Pricing', desc: 'Affordable packages without compromising quality' },
              { icon: '🛡️', title: 'Satisfaction Guarantee', desc: '100% satisfaction or we make it right' },
              { icon: '📞', title: '24/7 Support', desc: 'Round-the-clock customer service and support' }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`card ${animate ? 'animate__animated animate__fadeInUp' : ''}`}
                style={animate ? { animationDelay: `${index * 0.1}s` } : {}}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Services */}
      <section className="section section-alt">
        <div className="container">
          <h2 className={`section-title ${animate ? 'animate__animated animate__fadeInUp animate__delay-1s' : ''}`}>
            Our Decoration Services
          </h2>
          <p className={`section-subtitle ${animate ? 'animate__animated animate__fadeInUp animate__delay-1s' : ''}`}>
            Discover our wide range of professional decoration packages
          </p>
          <div className="services-grid">
            {featuredServices.map((service, index) => (
              <div 
                key={service._id} 
                className={`service-card ${animate ? 'animate__animated animate__fadeInUp' : ''}`}
                style={animate ? { animationDelay: `${(index + 1) * 0.15}s` } : {}}
              >
                {service.image && (
                  <div className="service-card-image">
                    <img src={service.image} alt={service.service_name} />
                  </div>
                )}
                <div className="service-card-content">
                  <h3 className="service-card-title">{service.service_name}</h3>
                  <p className="service-card-description">
                    {service.description?.substring(0, 120)}
                    {service.description?.length > 120 ? '...' : ''}
                  </p>
                  <div className="service-card-meta">
                    <span className="service-card-category">{service.category}</span>
                    <div className="service-card-price">
                      ${service.cost} <span>{service.unit}</span>
                    </div>
                  </div>
                  <Link to={`/service/${service._id}`} className="btn-outline service-card-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {featuredServices.length > 0 && (
            <div className={`text-center ${animate ? 'animate__animated animate__fadeInUp animate__delay-2s' : ''}`} style={{ marginTop: '3rem' }}>
              <Link to="/services" className="btn-primary">
                View All Services
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Statistics */}
      <section className="section">
        <div className="container">
          <div className="statistics-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {[
              { number: '500+', label: 'Projects Completed' },
              { number: '200+', label: 'Happy Clients' },
              { number: '50+', label: 'Expert Decorators' },
              { number: '15+', label: 'Years Experience' }
            ].map((stat, index) => (
              <div 
                key={index}
                className={`card text-center ${animate ? 'animate__animated animate__fadeInUp' : ''}`}
                style={animate ? { animationDelay: `${index * 0.15}s` } : {}}
              >
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  {stat.number}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Top Decorators */}
      <section className="section section-alt">
        <div className="container">
          <h2 className={`section-title ${animate ? 'animate__animated animate__fadeInUp animate__delay-3s' : ''}`}>
            Top Decorators
          </h2>
          {topDecorators.length > 0 ? (
            <div className="decorators-grid">
              {topDecorators.map((decorator, index) => (
                <div 
                  key={decorator._id || index}
                  className={`decorator-card ${animate ? 'animate__animated animate__fadeInUp' : ''}`}
                  style={animate ? { animationDelay: `${(index + 1) * 0.2}s` } : {}}
                >
                  {decorator.userId?.image && (
                    <div className="decorator-avatar">
                      <img src={decorator.userId.image} alt={decorator.userId?.name || 'Decorator'} />
                    </div>
                  )}
                  <div className="decorator-info">
                    <h3 className="decorator-name">
                      {decorator.userId?.name || decorator.userId?.email?.split('@')[0] || 'Decorator'}
                    </h3>
                    <div className="decorator-rating">
                      {'★'.repeat(Math.floor(decorator.rating || 0))}
                      <span className="rating-value">{(decorator.rating || 0).toFixed(1)}</span>
                    </div>
                    {decorator.specialties && decorator.specialties.length > 0 && (
                      <div className="decorator-specialties">
                        {decorator.specialties.map((specialty, idx) => (
                          <span key={idx} className="specialty-tag">{specialty}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`decorators-placeholder ${animate ? 'animate__animated animate__fadeInUp animate__delay-3s' : ''}`}>
              <p className="section-subtitle">
                Our top-rated decorators will be displayed here. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 6: Categories */}
      <section className="section">
        <div className="container">
          <h2 className={`section-title ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            Service Categories
          </h2>
          <p className={`section-subtitle ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            Explore our diverse range of decoration services
          </p>
          <div className="categories-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {['Interior Design', 'Exterior Design', 'Event Decoration', 'Commercial', 'Residential', 'Office Spaces'].map((category, index) => (
              <Link 
                key={index}
                to={`/services?category=${category.toLowerCase().replace(' ', '-')}`}
                className={`card ${animate ? 'animate__animated animate__fadeInUp' : ''}`}
                style={{ 
                  textAlign: 'center', 
                  padding: '2rem',
                  textDecoration: 'none',
                  transition: 'transform 0.3s',
                  animationDelay: animate ? `${index * 0.1}s` : '0s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{category}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Professional {category.toLowerCase()} services
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Testimonials */}
      <section className="section section-alt">
        <div className="container">
          <h2 className={`section-title ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            What Our Clients Say
          </h2>
          <p className={`section-subtitle ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            Real feedback from satisfied customers
          </p>
          <div className="testimonials-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {[
              { name: 'Sarah Johnson', role: 'Homeowner', text: 'StyleDecor transformed our living room into a beautiful, modern space. The team was professional and delivered exactly what we envisioned.', rating: 5 },
              { name: 'Michael Chen', role: 'Business Owner', text: 'Outstanding commercial decoration service. Our office space looks amazing and our employees love the new environment.', rating: 5 },
              { name: 'Emily Davis', role: 'Event Planner', text: 'Perfect event decoration! They made our wedding celebration absolutely stunning. Highly recommended!', rating: 5 }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className={`card ${animate ? 'animate__animated animate__fadeInUp' : ''}`}
                style={animate ? { animationDelay: `${index * 0.15}s` } : {}}
              >
                <div style={{ marginBottom: '1rem' }}>
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1rem', lineHeight: '1.8' }}>
                  "{testimonial.text}"
                </p>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{testimonial.name}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Process/How It Works */}
      <section className="section">
        <div className="container">
          <h2 className={`section-title ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            How It Works
          </h2>
          <p className={`section-subtitle ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            Simple steps to transform your space
          </p>
          <div className="process-steps" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem',
            marginTop: '3rem',
            position: 'relative'
          }}>
            {[
              { step: '1', title: 'Browse Services', desc: 'Explore our wide range of decoration services and packages' },
              { step: '2', title: 'Book a Service', desc: 'Select your preferred service and schedule a booking' },
              { step: '3', title: 'Consultation', desc: 'Our expert decorators will discuss your vision and requirements' },
              { step: '4', title: 'Transformation', desc: 'Watch as we bring your space to life with professional decoration' }
            ].map((process, index) => (
              <div 
                key={index}
                className={`card text-center ${animate ? 'animate__animated animate__fadeInUp' : ''}`}
                style={animate ? { animationDelay: `${index * 0.15}s` } : {}}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'var(--primary)', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  margin: '0 auto 1rem'
                }}>
                  {process.step}
                </div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{process.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{process.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: Service Coverage Map */}
      <section className="section section-alt">
        <div className="container">
          <h2 className={`section-title ${animate ? 'animate__animated animate__fadeInUp animate__delay-4s' : ''}`}>
            Service Coverage Areas
          </h2>
          <p className={`section-subtitle ${animate ? 'animate__animated animate__fadeInUp animate__delay-4s' : ''}`}>
            We provide our decoration services in the following areas
          </p>
          <div className={`map-wrapper ${animate ? 'animate__animated animate__fadeInUp animate__delay-5s' : ''}`}>
            <ServiceCoverageMap />
          </div>
        </div>
      </section>

      {/* Section 10: FAQ */}
      <section className="section">
        <div className="container">
          <h2 className={`section-title ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
            Frequently Asked Questions
          </h2>
          <div className="faq-container" style={{ maxWidth: '800px', margin: '2rem auto 0' }}>
            {[
              { q: 'How long does a typical decoration project take?', a: 'Project duration varies based on scope. Small projects may take 1-2 weeks, while larger projects can take 4-8 weeks. We provide detailed timelines during consultation.' },
              { q: 'Do you provide materials or should I purchase them?', a: 'We can provide all materials as part of our service package, or you can choose to purchase materials separately. We\'ll discuss options during consultation.' },
              { q: 'What is your cancellation policy?', a: 'You can cancel or reschedule bookings up to 48 hours before the scheduled date without any charges. Late cancellations may incur a fee.' },
              { q: 'Do you offer warranty on your work?', a: 'Yes, we provide a 1-year warranty on all our decoration work. We stand behind the quality of our craftsmanship and materials.' }
            ].map((faq, index) => (
              <div 
                key={index}
                className="card"
                style={{ marginBottom: '1rem' }}
              >
                <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{faq.q}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 11: Newsletter/CTA */}
      <section className="section section-alt">
        <div className="container">
          <div className="cta-section" style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Ready to Transform Your Space?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Get started today and let our expert decorators bring your vision to life
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/services" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Browse Services
              </Link>
              <Link to="/contact" className="btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
