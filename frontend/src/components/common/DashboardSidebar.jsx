import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const DashboardSidebar = ({ 
  title,
  userInfo,
  menuItems,
  activeTab,
  setActiveTab,
  onLogout,
  avatarIcon: AvatarIcon,
  gradientColors = ['#667eea', '#764ba2'],
  statusBadge
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="mobile-overlay" onClick={toggleMobile} />}

      <motion.div 
        className={`dashboard-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              <AvatarIcon />
            </div>
            <div className="user-details">
              <h4>{title}</h4>
              {statusBadge && (
                <span className={`status-badge ${statusBadge.type}`}>
                  {statusBadge.text}
                </span>
              )}
              {userInfo && (
                <small className="user-name">{userInfo.name}</small>
              )}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <motion.button
            className="logout-btn"
            onClick={onLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </motion.button>
        </div>

        <style jsx>{`
          .mobile-menu-btn {
            display: none;
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 1001;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 0.75rem;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            color: #374151;
            font-size: 1.125rem;
          }

          .mobile-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
          }

          .dashboard-sidebar {
            width: 280px;
            height: 100vh;
            background: linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%);
            color: white;
            position: fixed;
            left: 0;
            top: 0;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
          }

          .sidebar-header {
            padding: 2rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .user-avatar {
            width: 50px;
            height: 50px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            backdrop-filter: blur(10px);
          }

          .user-details h4 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
          }

          .user-name {
            color: rgba(255,255,255,0.8);
            font-size: 0.875rem;
          }

          .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-top: 0.25rem;
          }

          .status-badge.online {
            background: #10b981;
            color: white;
          }

          .status-badge.busy {
            background: #f59e0b;
            color: white;
          }

          .status-badge.offline {
            background: #6b7280;
            color: white;
          }

          .sidebar-nav {
            flex: 1;
            padding: 1rem 0;
            overflow-y: auto;
          }

          .nav-item {
            width: 100%;
            padding: 1rem 1.5rem;
            background: none;
            border: none;
            color: white;
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            position: relative;
          }

          .nav-item:hover {
            background: rgba(255,255,255,0.1);
          }

          .nav-item.active {
            background: rgba(255,255,255,0.2);
            border-right: 4px solid #fbbf24;
          }

          .nav-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: #fbbf24;
          }

          .nav-icon {
            font-size: 1.1rem;
            width: 20px;
            min-width: 20px;
          }

          .nav-label {
            font-size: 0.95rem;
            font-weight: 500;
            flex: 1;
          }

          .nav-badge {
            background: #ef4444;
            color: white;
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 10px;
            min-width: 20px;
            text-align: center;
          }

          .sidebar-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid rgba(255,255,255,0.1);
          }

          .logout-btn {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }

          .logout-btn:hover {
            background: rgba(239, 68, 68, 0.3);
            border-color: rgba(239, 68, 68, 0.5);
            transform: translateY(-1px);
          }

          /* Scrollbar styling */
          .sidebar-nav::-webkit-scrollbar {
            width: 4px;
          }

          .sidebar-nav::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
          }

          .sidebar-nav::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
          }

          .sidebar-nav::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.5);
          }

          @media (max-width: 768px) {
            .mobile-menu-btn {
              display: block;
            }

            .mobile-overlay {
              display: block;
            }

            .dashboard-sidebar {
              transform: translateX(-100%);
            }
            
            .dashboard-sidebar.mobile-open {
              transform: translateX(0);
            }
          }

          @media (max-width: 480px) {
            .dashboard-sidebar {
              width: 100vw;
            }
          }
        `}</style>
      </motion.div>
    </>
  );
};

export default DashboardSidebar;
