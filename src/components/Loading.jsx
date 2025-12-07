import '../styles/components.css';
import 'animate.css';

const Loading = ({ message = 'Loading...', fullPage = true }) => {
  if (fullPage) {
    return (
      <div className="loading-container loading-fullpage">
        <div className="loading-spinner animate__animated animate__pulse"></div>
        <p className="loading-text">{message}</p>
      </div>
    );
  }

  return (
    <div className="loading-container loading-inline">
      <div className="loading-spinner-small"></div>
      <p className="loading-text-small">{message}</p>
    </div>
  );
};

export default Loading;
