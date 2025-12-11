import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';
import { createPaymentIntent, confirmPayment } from '../services/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';


const getStripeKey = () => 
  
  
  {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key || key.startsWith('sk_')) 
    
    
    
    {
    console.warn('Invalid or missing Stripe publishable key. ');
    return null;
  }
  return key;
};

const stripePromise = getStripeKey() ? loadStripe(getStripeKey()) : null;

const PaymentForm = ({ booking, onSuccess }) => {
  const stripe = useStripe();
 
  const [error, setError] = useState(null);


   const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => 
    
    
    {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try 
    
    {
     
      const { data } = await createPaymentIntent(booking._id);
      const { clientSecret, paymentId } = data;

    
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: 
        
        
        {
          card: cardElement,
        },
      });

      if (stripeError) 
        
        
        {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // Confirm payment on backend
      await confirmPayment(paymentId);
      onSuccess();
    } 
    
    
    catch (err) 
    
    {
      setError(err.message);
    }
    
    finally
    
    {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <CardElement />
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={{ 
        border: '1px  #ccc solid', 
        
        borderRadius: '9px',

         padding: '1rem',
        marginBottom: '1rem'
      }}>
        <h3>
          
          
          Payment Summary
          
          
          </h3>
        <p>
          
          
          Amount: ${booking.serviceId?.cost || 0}
          
          
          </p>
      </div>

      <button 
        type="submit" 
        disabled={!stripe || loading}
        style={{ 
          padding: '0.75rem', 
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processing...' : `Pay $${booking.serviceId?.cost || 0}`}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const [booking, setBooking] = useState(location.state?.booking);

  useEffect(() => 
    
    
    {
    if (!user) 
      
      {
      navigate('/login');
      return;
    }
    if (!booking) 
      
      
      {
      navigate('/services');
      return;
    }
  }, [user, booking, navigate]);

  const handleSuccess = () => 
    
    {
    toast.success('Payment successful!');
    
    const dashboardRoute = userProfile?.role === 'admin' ? '/admin' : 
                           userProfile?.role === 'decorator' ? '/decorator' : '/dashboard';
    navigate(dashboardRoute);
  };

  if (!booking) return <Loading />;

  return (
    <div style={
      
      
      { padding: '2rem', 
      
      
      maxWidth: '600px', 
      
      
      margin: '0 auto' 
      
      
      
      }}>
      <h1>
        
        
        
        
        Payment
        </h1>
      
      <div style={
        
        { 
        border: '1px solid #ccc', 
        
        marginBottom: '2rem',

        padding: '1rem', 
        borderRadius: '9px'
      }}>
        <h3>
          Booking Details
          </h3>
        <p><strong>
          
          Service:
          
          </strong> {booking.serviceId?.service_name}
          
          
          </p>
        <p><strong>
          
          
          Date:</strong> {new Date(booking.date).toLocaleString()}
          
          </p>
        <p><strong>
          
          
          Location:</strong> {booking.location}
          
          
          </p>
      </div>

      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <PaymentForm booking={booking} onSuccess={handleSuccess} />
        </Elements>
      ) : (
        <div style={
          
          
          { padding: '2rem', 
          
          
          border: '1px solid #ff6b6b',
          
          
          borderRadius: '8px', background: 
          
          
          '#ffe6e6' }}>


          <h3>
            
            Stripe Configuration Error
            
            </h3>
       
        
        
        </div>
      )}
    </div>
  );
};

export default PaymentPage;

