import { useNavigate } from 'react-router-dom';
import '../styles/components.css';

const Error = ({ message = 'Something went wrong!' }) => {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <h1 className="error-title">Error</h1>
      <p className="error-message">{message}</p>
      <button className="btn-primary" onClick={() => navigate('/')}>
        Go to Home
      </button>
    </div>
  );
};

export default Error;

