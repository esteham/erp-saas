import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaClock,
  FaMapMarkerAlt,
  FaFilter,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ScheduleContent = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadSchedules();
  }, [currentDate, viewMode]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost';
      const response = await axios.get(`${apiUrl}/backend/api/admin/schedule.php`, {
        params: {
          date: currentDate.toISOString().split('T')[0],
          view: viewMode,
          status: filterStatus === 'all' ? '' : filterStatus
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        setSchedules(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'API returned error');
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
      toast.error('Failed to load schedules. Please check your connection and try again.');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (scheduleId, newStatus) => {
    try {
      const response = await axios.put(`${BASE_URL}/backend/api/admin/schedules.php`, {
        id: scheduleId,
        status: newStatus
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        toast.success('Schedule status updated successfully');
        loadSchedules();
      } else {
        toast.error('Failed to update schedule status');
      }
    } catch (error) {
      console.error('Failed to update schedule status:', error);
      toast.error('Failed to update schedule status');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        const response = await axios.delete(`${BASE_URL}/backend/api/admin/schedules.php`, {
          data: { id: scheduleId },
          withCredentials: true
        });
        
        if (response.data.success) {
          toast.success('Schedule deleted successfully');
          loadSchedules();
        } else {
          toast.error('Failed to delete schedule');
        }
      } catch (error) {
        console.error('Failed to delete schedule:', error);
        toast.error('Failed to delete schedule');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    }
    return `${mins}m`;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const getFilteredSchedules = () => {
    if (filterStatus === 'all') return schedules;
    return schedules.filter(schedule => schedule.status === filterStatus);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="schedule-content">
      <div className="content-header">
        <h2><FaCalendarAlt /> Schedule Management</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingSchedule(null);
              setShowModal(true);
            }}
          >
            <FaPlus /> Add Schedule
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="schedule-controls">
        <div className="date-navigation">
          <button className="btn btn-outline-secondary" onClick={() => navigateDate(-1)}>
            <FaChevronLeft />
          </button>
          <h4>{currentDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long',
            ...(viewMode === 'day' && { day: 'numeric' })
          })}</h4>
          <button className="btn btn-outline-secondary" onClick={() => navigateDate(1)}>
            <FaChevronRight />
          </button>
        </div>

        <div className="view-controls">
          <div className="btn-group" role="group">
            <button 
              className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button 
              className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
        </div>

        <div className="filter-controls">
          <select 
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Schedule List */}
      <div className="schedule-list">
        {getFilteredSchedules().length === 0 ? (
          <div className="no-data">
            <FaCalendarAlt size={48} />
            <h4>No schedules found</h4>
            <p>No schedules match your current filters.</p>
          </div>
        ) : (
          getFilteredSchedules().map((schedule) => (
            <div key={schedule.id} className="schedule-card">
              <div className="schedule-header">
                <div className="schedule-time">
                  <FaClock />
                  <span>{formatTime(schedule.time)}</span>
                  <span className="duration">({formatDuration(schedule.duration)})</span>
                </div>
                <div 
                  className="schedule-status"
                  style={{ backgroundColor: getStatusColor(schedule.status) }}
                >
                  {getStatusLabel(schedule.status)}
                </div>
              </div>

              <div className="schedule-body">
                <h5>{schedule.title}</h5>
                <div className="schedule-details">
                  <div className="detail-item">
                    <FaUser />
                    <span>Worker: {schedule.worker_name}</span>
                  </div>
                  <div className="detail-item">
                    <FaMapMarkerAlt />
                    <span>{schedule.address}</span>
                  </div>
                  <div className="detail-item">
                    <span>Service: {schedule.service_type}</span>
                  </div>
                  {schedule.notes && (
                    <div className="detail-item">
                      <span>Notes: {schedule.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="schedule-actions">
                <select 
                  className="form-select form-select-sm"
                  value={schedule.status}
                  onChange={(e) => handleStatusChange(schedule.id, e.target.value)}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button 
                  className="btn btn-sm btn-info"
                  onClick={() => {
                    setEditingSchedule(schedule);
                    setShowModal(true);
                  }}
                >
                  <FaEdit />
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(schedule.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .schedule-content {
          max-width: 1200px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          gap: 1rem;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .content-header h2 {
          margin: 0;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .schedule-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .date-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .date-navigation h4 {
          margin: 0;
          min-width: 200px;
          text-align: center;
        }

        .view-controls .btn-group {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .filter-controls select {
          min-width: 150px;
        }

        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .schedule-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .schedule-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .schedule-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .duration {
          color: #6b7280;
          font-weight: normal;
          font-size: 0.9rem;
        }

        .schedule-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .schedule-body {
          padding: 1.5rem;
        }

        .schedule-body h5 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .schedule-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .detail-item svg {
          color: #9ca3af;
          width: 14px;
        }

        .schedule-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .schedule-actions select {
          flex: 1;
          max-width: 150px;
        }

        .no-data {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .no-data svg {
          color: #d1d5db;
          margin-bottom: 1rem;
        }

        .no-data h4 {
          margin: 0 0 0.5rem 0;
          color: #374151;
        }

        .no-data p {
          margin: 0;
        }

        @media (max-width: 768px) {
          .schedule-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .date-navigation {
            justify-content: center;
          }
          
          .schedule-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
          
          .schedule-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default ScheduleContent;
