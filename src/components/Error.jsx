import { useNavigate } from 'react-router-dom';

const Error = ({ message = 'Something went wrong!' }) => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      gap: '20px'
    }}>
      <h1>Error</h1>
      <p>{message}</p>
      <button onClick={() => navigate('/')}>Go to Home</button>
    </div>
  );
};

export default Error;

