import '../styles/pages.css';
import 'animate.css';

const AboutPage = () => {
  return (
    <div className="page-container">
      <div className="container">
        <div className="section animate__animated animate__fadeInUp">
          <h1 style={{ 
            textAlign: 'center',  color: 'var(--burgundy-dark)',


            marginBottom: '2rem',
           
          }}>
            About Us


          </h1>
          
          <div className="card" style={
            
            
            { maxWidth: '800px', 
            
            
            margin: '0 auto' }
            
            
            }>


            <h2 style={
              
              
              { color: 'var(--burgundy)',
              
              
              marginBottom: '1.5rem' 
              
              
              }}>
              Welcome to Style Decor



            </h2>
            <p style={
              
              
              { 
                
                
                marginBottom: '1.5rem', 
                
                
                lineHeight: '1.8', 
                
                
                
                color: 'var(--gray-dark)' 
                
                }}>
              We are a premier decoration service provider dedicated to transforming spaces 
              into beautiful, functional environments. With years of experience in interior 
              and exterior design, we bring your vision to life.
            </p>
            
            <h3 style={
              
              
              { color: 'var(--burgundy)',
              
              
              marginTop: '2rem', 
              
              
              marginBottom: '1rem' 
              
              
              }}>
              Our Mission



            </h3>
            <p style={
              
              { 
                
                
                marginBottom: '1.5rem',
                
                
                lineHeight: '1.8', color: 
                
                
                'var(--gray-dark)'
                
                
                }}>
             
             
             
              To provide exceptional decoration services that exceed our clients' expectations 
              while maintaining the highest standards of quality and professionalism.


            </p>
            
            <h3 style={{ color: 'var(--burgundy)', marginTop: '2rem', marginBottom: '1rem' }}>
              What We Offer
            </h3>
            <ul style={{ 
              listStyle: 'none', 
             
              marginBottom: '1.5rem',

               padding: 0,
            }}>
              <li style={
                
                
                { 
                padding: '0.75rem 0',



                borderBottom: '1px var(--beige) solid ',
                color: 'var(--gray-dark)'
              }
              
              
              }>
                <i className="fa-solid fa-check" style={
                  
                  
                  
                  { color: 'var(--magenta)', 
                  
                  
                  
                  
                  marginRight: '0.5rem' 
                  
                  
                  }}>





                  </i>
                Interior Design & Decoration
              </li>
              <li style={
                
                
                { 
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--beige)',




                color: 'var(--gray-dark)'
              }}>
                <i className="fa-solid fa-check" style={{ color: 'var(--magenta)', marginRight: '0.5rem' }}></i>
                Exterior Design Services
              </li>
              <li style={{ 
              
                borderBottom: 'solid var(--beige) 1px ',


                  padding: '0.75rem 0',
                color: 'var(--gray-dark)'
              }}>
                <i className="fa-solid fa-check" style={{ color: 'var(--magenta)', 
                  
                  
                 }}></i>
                Event Decoration
              </li>
              <li style={{ 
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--beige)',
                color: 'var(--gray-dark)'
              }}>
                <i className="fa-solid fa-check" 
                
                
                style={
                  
                  
                  
                  { color: 'var(--magenta)',
                  
                  
                  marginRight: '0.5rem' 
                  
                  
                  }}>



                  </i>
                Commercial & Residential Projects
              </li>
            </ul>
            
            <div style={{ 
              marginTop: '2rem',
             
              background: 'var(--gray-light)',


               padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
            
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

