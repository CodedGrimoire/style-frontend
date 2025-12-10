import { useNavigate } from 'react-router-dom';
import '../styles/components.css';
import 'animate.css';

const Error = ({ message = 'Something went wrong!', statusCode = null }) => 
  
  {
  const navigate = useNavigate();

  return (
    <div className="error-container error-fullpage animate__animated animate__fadeIn">
      <div className="error-content">
        {statusCode && (
          <h1 className="error-status-code">{statusCode}</h1>
        )}
        <h1 className="error-title">
          
          
          Oops!</h1>
        <p className="error-message">
          
          {message}


        </p>
        <div className="error-actions">
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go to Home
          </button>
          <button className="btn-outline" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error;
