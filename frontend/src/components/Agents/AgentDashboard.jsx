import React from 'react';

const AgentDashboard = () => {
  return (
    <div className="container mt-5">
      <h2>👔 HR Dashboard</h2>
      <p>Welcome, HR! You can manage employee information.</p>

      {/* HR-specific actions */}
      <ul>
        <li>View Employee List</li>
        <li>Schedule Interviews</li>
        <li>Manage Attendance</li>
      </ul>
    </div>
  );
};

export default AgentDashboard;
