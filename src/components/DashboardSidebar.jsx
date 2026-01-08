import { Link, useLocation } from 'react-router-dom';
import '../styles/dashboard.css';

const DashboardSidebar = ({ role = 'user', activeTab, setActiveTab }) => {
  const location = useLocation();

  const userMenuItems = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'bookings', label: 'My Bookings', icon: '📅' },
    { id: 'payments', label: 'Payment History', icon: '💳' }
  ];

  const adminMenuItems = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'my-bookings', label: 'My Bookings', icon: '📅' },
    { id: 'payments', label: 'Payment History', icon: '💳' },
    { id: 'bookings', label: 'Manage Bookings', icon: '📋' },
    { id: 'services', label: 'Manage Services', icon: '🛠️' },
    { id: 'decorators', label: 'Manage Decorators', icon: '🎨' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ];

  const decoratorMenuItems = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'my-bookings', label: 'My Bookings', icon: '📅' },
    { id: 'payments', label: 'Payment History', icon: '💳' },
    { id: 'projects', label: 'My Projects', icon: '📁' },
    { id: 'schedule', label: 'Schedule', icon: '📅' }
  ];

  const menuItems = role === 'admin' ? adminMenuItems : role === 'decorator' ? decoratorMenuItems : userMenuItems;

  return (
    <aside className="dashboard-sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
