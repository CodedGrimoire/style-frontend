import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDecoratorProjects, updateProjectStatus } from '../services/api';
import Loading from '../components/Loading';
import '../styles/dashboard.css';
import 'animate.css';

const DecoratorDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earnings, setEarnings] = useState(0);
  const [todaySchedule, setTodaySchedule] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await getDecoratorProjects();
        const allProjects = response.data || [];
        setProjects(allProjects);
        
        // Calculate earnings from completed projects
        const completed = allProjects.filter(
          p => p.status === 'completed' && p.paymentStatus === 'paid'
        );
        const total = completed.reduce((sum, p) => sum + (p.serviceId?.cost || 0), 0);
        setEarnings(total);

        // Get today's schedule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayProjects = allProjects.filter(p => {
          const projectDate = new Date(p.date);
          return projectDate >= today && projectDate < tomorrow && p.status !== 'cancelled';
        });
        setTodaySchedule(todayProjects);
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
      const allProjects = response.data || [];
      setProjects(allProjects);
      
      // Recalculate earnings
      const completed = allProjects.filter(
        p => p.status === 'completed' && p.paymentStatus === 'paid'
      );
      const total = completed.reduce((sum, p) => sum + (p.serviceId?.cost || 0), 0);
      setEarnings(total);

      // Update today's schedule
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const todayProjects = allProjects.filter(p => {
        const projectDate = new Date(p.date);
        return projectDate >= today && projectDate < tomorrow && p.status !== 'cancelled';
      });
      setTodaySchedule(todayProjects);

      alert('Status updated successfully');
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { value: 'assigned', label: 'Assigned' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
    ];
    return steps;
  };

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'assigned') return 'in-progress';
    if (currentStatus === 'in-progress') return 'completed';
    return null;
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Decorator Dashboard</h1>
        <p className="dashboard-subtitle">Manage your assigned projects and track your earnings</p>
      </div>

      <div className="dashboard-content">
        {/* Earnings Summary */}
        <div className="dashboard-section animate__animated animate__fadeInUp">
          <h2 className="section-heading">Earnings Summary</h2>
          <div className="earnings-summary">
            <div className="earnings-stat">
              <span className="earnings-label">Total Earnings</span>
              <span className="earnings-value">${earnings.toFixed(2)}</span>
            </div>
            <div className="earnings-stat">
              <span className="earnings-label">Completed Projects</span>
              <span className="earnings-value">
                {projects.filter(p => p.status === 'completed' && p.paymentStatus === 'paid').length}
              </span>
            </div>
            <div className="earnings-stat">
              <span className="earnings-label">Active Projects</span>
              <span className="earnings-value">
                {projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length}
              </span>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="dashboard-section animate__animated animate__fadeInUp">
          <h2 className="section-heading">Today's Schedule</h2>
          {todaySchedule.length === 0 ? (
            <div className="empty-state">
              <p>No projects scheduled for today.</p>
            </div>
          ) : (
            <div className="schedule-list">
              {todaySchedule.map((project) => (
                <div key={project._id} className="schedule-item">
                  <div className="schedule-time">
                    {new Date(project.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="schedule-details">
                    <h4 className="schedule-service">{project.serviceId?.service_name}</h4>
                    <p className="schedule-location">{project.location}</p>
                    <p className="schedule-client">Client: {project.userId?.email || project.userId}</p>
                  </div>
                  <div className="schedule-status">
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Projects */}
        <div className="dashboard-section animate__animated animate__fadeInUp">
          <h2 className="section-heading">My Assigned Projects</h2>
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects assigned yet.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project._id} className="project-card">
                  <div className="project-header">
                    <h3 className="project-service-name">{project.serviceId?.service_name}</h3>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="project-details">
                    <div className="project-detail-item">
                      <span className="detail-label">Client:</span>
                      <span className="detail-value">
                        {project.userId?.name || project.userId?.email || project.userId || 'Unknown'}
                      </span>
                    </div>
                    <div className="project-detail-item">
                      <span className="detail-label">Date & Time:</span>
                      <span className="detail-value">
                        {new Date(project.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="project-detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{project.location}</span>
                    </div>
                    <div className="project-detail-item">
                      <span className="detail-label">Payment Status:</span>
                      <span className={`payment-badge payment-${project.paymentStatus}`}>
                        {project.paymentStatus}
                      </span>
                    </div>
                    <div className="project-detail-item">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">
                        ${project.serviceId?.cost} {project.serviceId?.unit}
                      </span>
                    </div>
                  </div>

                  {/* Status Steps */}
                  <div className="project-status-steps">
                    <h4 className="status-steps-title">Project Status</h4>
                    <div className="status-steps">
                      {getStatusSteps(project.status).map((step, index) => {
                        const isActive = step.value === project.status;
                        const isCompleted = 
                          (step.value === 'assigned' && ['in-progress', 'completed'].includes(project.status)) ||
                          (step.value === 'in-progress' && project.status === 'completed');
                        return (
                          <div
                            key={step.value}
                            className={`status-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                          >
                            <div className="status-step-circle">
                              {isCompleted ? '✓' : index + 1}
                            </div>
                            <span className="status-step-label">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Update Status Actions */}
                  <div className="project-actions">
                    {getNextStatus(project.status) && (
                      <button
                        className="btn-primary"
                        onClick={() => handleStatusUpdate(project._id, getNextStatus(project.status))}
                      >
                        {project.status === 'assigned' ? 'Start Project' : 'Mark as Completed'}
                      </button>
                    )}
                    {project.status === 'completed' && (
                      <span className="project-completed-badge">Project Completed</span>
                    )}
                  </div>

                  {/* Payment History */}
                  {project.paymentStatus === 'paid' && (
                    <div className="project-payment-info">
                      <p className="payment-info-text">
                        Payment received: ${project.serviceId?.cost} {project.serviceId?.unit}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecoratorDashboardPage;
