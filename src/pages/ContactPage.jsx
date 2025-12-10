import { useState } from 'react';

import '../styles/pages.css';


import toast from 'react-hot-toast';


import 'animate.css';

const ContactPage = () => 
  
  {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    
    
    {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => 
    
    
    {
    e.preventDefault();
    setLoading(true);
    
   
    setTimeout(() => 
      
      
      {
      toast.success('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="section animate__animated animate__fadeInUp">
          <h1 style={
            
            
            { 
          
            marginBottom: '2rem',


               textAlign: 'center', 
            color: 'var(--burgundy-dark)'
          }}>

            Contact Us
          </h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
           
            maxWidth: '990px',

             gap: '2rem',
            margin: '0 auto'
          }}>
      



            <div className="card">
              <h2 style={
                
                
                
                { 
                  
                  
                  
                  color: 'var(--burgundy)', 
                  
                  
                  
                  marginBottom: '1.5rem'
                  
                  
                  
                  }
                  
                  
                  
                  }>
                Get in Touch
              </h2>
              
              <div 
              
              
              
              style={
                
                
                { marginBottom: '1.5rem' }
                
                
                }>
                <div style={
                  
                  
                  
                  { 

                     alignItems: 'center',
                  display: 'flex', 
                 
                  marginBottom: '1rem'
                }}>
                  <i className="fa-solid fa-envelope" 
                  
                  
                  style={
                    
                    { 
                    color: 'var(--magenta)', 
                   
                    marginRight: '1rem',


                     fontSize: '1.25rem',
                    width: '24px'
                  }
                  
                  
                  
                  }></i>
                  <div>
                    <strong style={
                      
                      
                      { 
                        
                        
                        
                        color: 'var(--burgundy-dark)' }
                        
                        
                        }>
                          
                          
                          
                          
                          Email
                          
                          
                          </strong>


                    <p 
                    
                    
                    style={
                      
                      
                      { margin: '0.25rem 0',
                      
                      
                      color: 'var(--gray-dark)' 
                      
                      
                      
                      }
                      
                      
                      }>
                      info@styledecor.com
                    </p>
                  </div>
                </div>
                
                <div style={
                  
                  
                  { 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }
                
                }>
                  <i className="fa-solid fa-phone" 
                  
                  
                  
                  style={
                    
                    
                    { 
                    color: 'var(--magenta)', 
                   
                    marginRight: '1rem',


                      fontSize: '1.25rem',
                    width: '24px'
                  }}>





                  </i>
                  <div>


                    <strong
                    
                    
                    style={
                      
                      
                      { color: 'var(--burgundy-dark)'



                       }
                       
                       
                       }>
                        
                        
                        Phone
                        
                        
                        
                        </strong>
                    <p
                    
                    
                    style=
                    
                    
                    {
                      
                      
                      { margin: '0.25rem 0', 
                      
                      
                      color: 'var(--gray-dark)' 
                      
                      
                      }}
                      
                      >
                      +880 1234 567890
                    </p>
                  </div>
                </div>
                
                <div style={
                  
                  
                  { 

                     alignItems: 'flex-start',
                  display: 'flex', 
                 
                  marginBottom: '1rem'
                }
                
                
                }>
                  <i className="fa-solid fa-location-dot"
                  
                  
                  style={
                    
                    { 
                    color: 'var(--magenta)', 
                    fontSize: '1.25rem',
                   
                    width: '24px',

                     marginRight: '1rem',
                    marginTop: '0.35rem'
                  }}>





                  </i>
                  <div>
                    <strong 
                    
                    
                    style={
                      
                      
                      
                      
                      { color: 'var(--burgundy-dark)' 



                      }}>
                        
                        
                        
                        
                        Address
                        
                        
                        </strong>



                    <p
                    
                    
                    style={
                      
                      
                      { margin: '0.25rem 0', 
                      
                      
                      
                      color: 'var(--gray-dark)'
                      
                      
                      }}>
                      Dhaka, Sylhet, Chittagong, Rajshahi<br />
                      Bangladesh
                    </p>
                  </div>
                </div>


              </div>
              
              <div style={
                
                
                { 
                marginTop: '2rem',
               
                background: 'var(--gray-light)',

                  padding: '1rem',
                borderRadius: 'var(--radius-md)'
              }
              
              }>
                <p
                
                
                style={
                  
                  
                  { 
                 
                  fontSize: '0.9rem',


                   margin: 0, 
                  color: 'var(--gray-dark)'
                }}>
                  <strong>Business Hours:</strong><br />
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>

           
            <div className="card">
              <h2 
              
              
              style={
                
                
                { color: 'var(--burgundy)', 
                
                
                marginBottom: '1.5rem' }
                
                
                
                
                }>
                Send us a Message
              </h2>
              
              <form
              
              
              onSubmit={handleSubmit} 
              
              
              style={{ 
                
                
                display: 'flex', 
                
                
                
                flexDirection: 'column', 
                
                
                
                gap: '1rem' 
                
                
                }}>
                <div>
                  <label 
                  
                  
                  style={
                    
                    { 
                    display: 'block',
                   
                    color: 'var(--burgundy-dark)',


                      marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block',
                   
                    color: 'var(--burgundy-dark)',


                      marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'var(--burgundy-dark)',
                    fontWeight: '500'
                  }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'var(--burgundy-dark)',
                    fontWeight: '500'
                  }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    style={{ width: '100%', resize: 'vertical' }}
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                  style={{ 
                    marginTop: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

