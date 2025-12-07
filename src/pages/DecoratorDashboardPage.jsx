import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDecoratorProjects, updateProjectStatus } from '../services/api';
import Loading from '../components/Loading';

const DecoratorDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await getDecoratorProjects();
        setProjects(response.data || []);
        
        // Calculate earnings from completed projects
        const completed = (response.data || []).filter(
          p => p.status === 'completed' && p.paymentStatus === 'paid'
        );
        const total = completed.reduce((sum, p) => sum + (p.serviceId?.cost || 0), 0);
        setEarnings(total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, navigate]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateProjectStatus(bookingId, newStatus);
      const response = await getDecoratorProjects();
      setProjects(response.data || []);
      alert('Status updated successfully');
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Decorator Dashboard</h1>

      <div style={{ 
        border: '1px solid #ccc', 
        padding: '1rem', 
        marginBottom: '2rem',
        borderRadius: '8px',
        background: '#f5f5f5'
      }}>
        <h2>Earnings Summary</h2>
        <p><strong>Total Earnings:</strong> ${earnings.toFixed(2)}</p>
        <p><strong>Completed Projects:</strong> {
          projects.filter(p => p.status === 'completed' && p.paymentStatus === 'paid').length
        }</p>
      </div>

      <div>
        <h2>Assigned Projects</h2>
        {projects.length === 0 ? (
          <p>No projects assigned yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {projects.map((project) => (
              <div 
                key={project._id} 
                style={{ 
                  border: '1px solid #ccc', 
                  padding: '1rem',
                  borderRadius: '8px'
                }}
              >
                <h3>{project.serviceId?.service_name}</h3>
                <p><strong>Client:</strong> {project.userId?.email || project.userId}</p>
                <p><strong>Date:</strong> {new Date(project.date).toLocaleString()}</p>
                <p><strong>Location:</strong> {project.location}</p>
                <p><strong>Status:</strong> {project.status}</p>
                <p><strong>Payment Status:</strong> {project.paymentStatus}</p>
                <p><strong>Amount:</strong> ${project.serviceId?.cost} {project.serviceId?.unit}</p>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {project.status === 'assigned' && (
                    <button 
                      onClick={() => handleStatusUpdate(project._id, 'in-progress')}
                      style={{ background: '#007bff', color: 'white' }}
                    >
                      Start Project
                    </button>
                  )}
                  {project.status === 'in-progress' && (
                    <button 
                      onClick={() => handleStatusUpdate(project._id, 'completed')}
                      style={{ background: '#28a745', color: 'white' }}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecoratorDashboardPage;

