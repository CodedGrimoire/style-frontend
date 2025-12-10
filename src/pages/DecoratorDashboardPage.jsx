import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDecoratorProjects, updateProjectStatus } from '../services/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
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

    // Reset all state when user changes to prevent showing previous user's data
    setProjects([]);
    setEarnings(0);
    setTodaySchedule([]);
    setError(null);
    setLoading(true);

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
        toast.success('Projects loaded successfully');
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, navigate]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const loadingToast = toast.loading('Updating project status...');
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

      toast.success('Status updated successfully', { id: loadingToast });
    } catch (err) {
      toast.error(err.message || 'Failed to update status', { id: loadingToast });
    }
  };

  const getStatusSteps = () => {
    // Return all status steps in order (always show all steps)
    return [
      { value: 'assigned', label: 'Assigned' },
      { value: 'planning-phase', label: 'Planning Phase' },
      { value: 'materials-prepared', label: 'Materials Prepared' },
      { value: 'on-the-way', label: 'On the Way to Venue' },
      { value: 'setup-in-progress', label: 'Setup in Progress' },
      { value: 'completed', label: 'Completed' },
    ];
  };

  // Map backend status to detailed flow step for display
  // This allows us to show the detailed 6-step flow even though backend only has 3 statuses
  const getDisplayStatus = (backendStatus) => {
    const statusMap = {
      'assigned': 'assigned',
      'in-progress': 'setup-in-progress', // When in-progress, show "Setup in Progress" as active
      'completed': 'completed',
      // Support any custom statuses that might come from backend
      'planning-phase': 'planning-phase',
      'planning': 'planning-phase',
      'materials-prepared': 'materials-prepared',
      'on-the-way': 'on-the-way',
      'setup-in-progress': 'setup-in-progress',
    };
    return statusMap[backendStatus] || backendStatus;
  };

  // Get which steps should be marked as completed based on current status
  const getCompletedSteps = (backendStatus) => {
    const displayStatus = getDisplayStatus(backendStatus);
    const statusOrder = ['assigned', 'planning-phase', 'materials-prepared', 'on-the-way', 'setup-in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(displayStatus);
    
    // If status is 'in-progress', mark all steps before 'setup-in-progress' as completed
    if (backendStatus === 'in-progress') {
      return statusOrder.slice(0, statusOrder.indexOf('setup-in-progress'));
    }
    
    // Otherwise, mark all steps before current as completed
    return currentIndex > 0 ? statusOrder.slice(0, currentIndex) : [];
  };

  // Get the next backend status to send
  const getNextBackendStatus = (currentStatus) => {
    // Map detailed flow statuses to backend statuses
    if (currentStatus === 'assigned') {
      return 'in-progress'; // Move from assigned to in-progress
    } else if (currentStatus === 'in-progress') {
      return 'completed'; // Move from in-progress to completed
    } else if (currentStatus === 'completed') {
      return null; // Already completed
    }
    // For any other status, try to map to next backend status
    const detailedToBackend = {
      'planning-phase': 'in-progress',
      'materials-prepared': 'in-progress',
      'on-the-way': 'in-progress',
      'setup-in-progress': 'completed',
    };
    return detailedToBackend[currentStatus] || 'in-progress';
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

                  {/* Status Steps - On-Site Service Status Flow */}
                  <div className="project-status-steps">
                    <h4 className="status-steps-title">On-Site Service Status Flow</h4>
                    <div className="status-steps">
                      {getStatusSteps().map((step, index) => {
                        const displayStatus = getDisplayStatus(project.status);
                        const completedSteps = getCompletedSteps(project.status);
                        const statusOrder = ['assigned', 'planning-phase', 'materials-prepared', 'on-the-way', 'setup-in-progress', 'completed'];
                        const currentIndex = statusOrder.indexOf(displayStatus);
                        const stepIndex = statusOrder.indexOf(step.value);
                        
                        // Determine if step is active, completed, or pending
                        const isActive = step.value === displayStatus;
                        const isCompleted = completedSteps.includes(step.value) || (stepIndex !== -1 && currentIndex !== -1 && stepIndex < currentIndex);
                        const isPending = stepIndex !== -1 && currentIndex !== -1 && stepIndex > currentIndex && !isCompleted;
                        
                        return (
                          <div
                            key={step.value}
                            className={`status-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isPending ? 'pending' : ''}`}
                            title={step.label}
                          >
                            <div className="status-step-circle">
                              {isCompleted ? '✓' : isActive ? '●' : index + 1}
                            </div>
                            <span className="status-step-label">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Update Status Actions */}
                  <div className="project-actions">
                    {project.status !== 'completed' && getNextBackendStatus(project.status) && (
                      <button
                        className="btn-primary"
                        onClick={() => handleStatusUpdate(project._id, getNextBackendStatus(project.status))}
                      >
                        {project.status === 'assigned' ? 'Start Planning Phase' : 
                       project.status === 'in-progress' ? 'Mark as Completed' :
                       'Next Step'}
                      </button>
                    )}
                    {project.status === 'completed' && (
                      <span className="project-completed-badge">✓ Project Completed</span>
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
