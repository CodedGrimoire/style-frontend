import '../styles/components.css';

const SkeletonCard = ({ count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className="skeleton-card">
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text-short"></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', marginBottom: '1rem' }}>
        <div className="skeleton skeleton-text-short" style={{ width: '80px' }}></div>
        <div className="skeleton skeleton-text-short" style={{ width: '100px' }}></div>
      </div>
      <div className="skeleton skeleton-button"></div>
    </div>
  ));

  return <div className="skeleton-grid">{skeletons}</div>;
};

export default SkeletonCard;
