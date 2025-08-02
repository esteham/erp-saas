import React from 'react';

const DashboardLayout = ({ 
  sidebar, 
  children, 
  className = '',
  contentPadding = '2rem',
  backgroundColor = '#f8fafc' 
}) => {
  return (
    <div className={`dashboard-layout ${className}`}>
      {sidebar}
      <div className="dashboard-main-content">
        {children}
      </div>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: ${backgroundColor};
        }

        .dashboard-main-content {
          flex: 1;
          margin-left: 280px;
          padding: ${contentPadding};
          min-height: 100vh;
          transition: margin-left 0.3s ease;
        }

        @media (max-width: 768px) {
          .dashboard-main-content {
            margin-left: 0;
            padding: 1rem;
          }
        }

        /* Ensure proper spacing for mobile when sidebar is open */
        @media (max-width: 480px) {
          .dashboard-main-content {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
