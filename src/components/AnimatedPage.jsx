import { useEffect, useState } from 'react';
import 'animate.css';

const AnimatedPage = ({ children, className = '' }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <div className={`${className} ${animate ? 'animate__animated animate__fadeInUp' : ''}`}>
      {children}
    </div>
  );
};

export default AnimatedPage;

