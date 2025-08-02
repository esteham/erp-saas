import React from 'react';
import { 
  FaTachometerAlt,
  FaTasks,
  FaCalendarAlt,
  FaChartLine,
  FaUser,
  FaBell,
  FaCog,
  FaTools,
  FaHistory,
  FaWallet,
  FaQuestionCircle
} from 'react-icons/fa';
import DashboardSidebar from '../common/DashboardSidebar';

const WorkerSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'tasks', label: 'My Tasks', icon: FaTasks },
    { id: 'schedule', label: 'Schedule', icon: FaCalendarAlt },
    { id: 'performance', label: 'Performance', icon: FaChartLine },
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'services', label: 'Services', icon: FaTools },
    { id: 'history', label: 'Work History', icon: FaHistory },
    { id: 'earnings', label: 'Earnings', icon: FaWallet },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'help', label: 'Help & Support', icon: FaQuestionCircle },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  return (
    <DashboardSidebar
      title="Worker Panel"
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
      avatarIcon={FaUser}
      gradientColors={['#667eea', '#764ba2']}
      statusBadge={{ type: 'online', text: 'Online' }}
    />
  );
};

export default WorkerSidebar;
