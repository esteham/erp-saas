import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaClock, 
  FaDollarSign, 
  FaStar,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaTools,
  FaChartLine,
  FaBell,
  FaEye,
  FaThumbsUp,
  FaThumbsDown,
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [workerStats, setWorkerStats] = useState({});
  const [availability, setAvailability] = useState('available');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [requestsRes, statsRes, notificationsRes] = await Promise.all([
        axios.get('/api/workers/show_task.php'),
        axios.get('/api/workers/stats.php'),
        axios.get('/api/workers/notifications.php')
      ]);

      if (requestsRes.data.success) {
        setServiceRequests(requestsRes.data.data);
      }

      if (statsRes.data.success) {
        setWorkerStats(statsRes.data.data);
        setAvailability(statsRes.data.data.availability || 'available');
      }

      if (notificationsRes.data.success) {
        setNotifications(notificationsRes.data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (newAvailability) => {
    try {
      const response = await axios.post('/api/workers/availability.php', {
        availability: newAvailability
      });

      if (response.data.success) {
        setAvailability(newAvailability);
        toast.success('Availability updated successfully');
      } else {
        toast.error(response.data.message || 'Failed to update availability');
      }
    } catch (error) {
      toast.error('Failed to update availability');
      console.error('Availability update error:', error);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await axios.post('/api/workers/request_action.php', {
        request_id: requestId,
        action: action
      });

      if (response.data.success) {
        toast.success(`Request ${action}ed successfully`);
        loadDashboardData(); // Refresh data
      } else {
        toast.error(response.data.message || `Failed to ${action} request`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} request`);
      console.error('Request action error:', error);
    }
  };

  const getAvailabilityBadge = (status) => {
    const badges = {
      available: { class: 'bg-success', text: 'Available', icon: FaCheckCircle },
      busy: { class: 'bg-warning', text: 'Busy', icon: FaClock },
      offline: { class: 'bg-secondary', text: 'Offline', icon: FaClock }
    };
    return badges[status] || badges.available;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-warning', text: 'Pending' },
      assigned: { class: 'bg-info', text: 'Assigned' },
      in_progress: { class: 'bg-primary', text: 'In Progress' },
      completed: { class: 'bg-success', text: 'Completed' },
      cancelled: { class: 'bg-secondary', text: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = serviceRequests.filter(request => {
    return statusFilter === 'all' || request.status === statusFilter;
  });

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      className={`card border-left-${color} shadow h-100 py-2`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-body">
        <div className="row no-gutters align-items-center">
          <div className="col mr-2">
            <div className={`text-xs font-weight-bold text-${color} text-uppercase mb-1`}>
              {title}
            </div>
            <div className="h5 mb-0 font-weight-bold text-gray-800">
              {value}
            </div>
            {subtitle && (
              <div className="text-xs text-muted">
                {subtitle}
              </div>
            )}
          </div>
          <div className="col-auto">
            <Icon className={`fas fa-2x text-${color}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const RequestCard = ({ request }) => {
    const statusBadge = getStatusBadge(request.status);
    
    return (
      <motion.div
        className="card mb-3 shadow-sm"
        whileHover={{ y: -2 }}
        layout
      >
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 text-primary fw-bold">{request.title}</h6>
            <small className="text-muted">
              <FaMapMarkerAlt className="me-1" />
              {request.zone_name}
            </small>
          </div>
          <span className={`badge ${statusBadge.class}`}>
            {statusBadge.text}
          </span>
        </div>
        
        <div className="card-body">
          <p className="card-text text-muted mb-3">
            {request.description?.length > 150 
              ? `${request.description.substring(0, 150)}...` 
              : request.description
            }
          </p>
          
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <small className="text-muted d-block">
                <FaUser className="me-1" />
                Client: {request.contact_name || request.user_name}
              </small>
              <small className="text-muted d-block">
                <FaPhone className="me-1" />
                {request.contact_phone || request.phone}
              </small>
            </div>
            <div className="col-md-6">
              <small className="text-muted d-block">
                <FaCalendarAlt className="me-1" />
                {request.scheduled_at ? formatDate(request.scheduled_at) : 'ASAP'}
              </small>
              <small className="text-success d-block fw-bold">
                <FaDollarSign className="me-1" />
                ${request.final_price || request.price}
              </small>
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => console.log('View details:', request)}
            >
              <FaEye className="me-1" />
              View Details
            </button>
            
            {request.status === 'pending' && (
              <>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleRequestAction(request.id, 'accept')}
                >
                  <FaThumbsUp className="me-1" />
                  Accept
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRequestAction(request.id, 'reject')}
                >
                  <FaThumbsDown className="me-1" />
                  Decline
                </button>
              </>
            )}
            
            {request.status === 'assigned' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleRequestAction(request.id, 'start')}
              >
                <FaClock className="me-1" />
                Start Work
              </button>
            )}
            
            {request.status === 'in_progress' && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleRequestAction(request.id, 'complete')}
              >
                <FaCheckCircle className="me-1" />
                Mark Complete
              </button>
            )}
          </div>
        </div>
        
        <div className="card-footer bg-light text-muted small">
          Created: {formatDate(request.created_at)}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const availabilityBadge = getAvailabilityBadge(availability);
  const AvailabilityIcon = availabilityBadge.icon;

  return (
    <div className="container-fluid px-4">
      {/* Header */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">
            Provider Dashboard 🛠️
          </h1>
          <p className="text-muted mb-0">Welcome back, {user?.username}!</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          {/* Availability Toggle */}
          <div className="d-flex align-items-center">
            <span className="me-2 small">Status:</span>
            <div className="dropdown">
              <button
                className={`btn btn-${availabilityBadge.class.replace('bg-', '')} btn-sm dropdown-toggle`}
                type="button"
                data-bs-toggle="dropdown"
              >
                <AvailabilityIcon className="me-1" />
                {availabilityBadge.text}
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleAvailabilityChange('available')}
                  >
                    <FaCheckCircle className="me-2 text-success" />
                    Available
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleAvailabilityChange('busy')}
                  >
                    <FaClock className="me-2 text-warning" />
                    Busy
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleAvailabilityChange('offline')}
                  >
                    <FaClock className="me-2 text-secondary" />
                    Offline
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="position-relative">
            <button className="btn btn-outline-primary">
              <FaBell />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <StatCard
            title="Total Jobs"
            value={workerStats.total_jobs || 0}
            icon={FaTools}
            color="primary"
            subtitle="All time"
          />
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <StatCard
            title="Monthly Earnings"
            value={`$${workerStats.monthly_earnings || 0}`}
            icon={FaDollarSign}
            color="success"
            subtitle="This month"
          />
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <StatCard
            title="Rating"
            value={`${workerStats.rating || 0}/5`}
            icon={FaStar}
            color="warning"
            subtitle={`${workerStats.total_reviews || 0} reviews`}
          />
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <StatCard
            title="Completion Rate"
            value={`${workerStats.completion_rate || 0}%`}
            icon={FaChartLine}
            color="info"
            subtitle="Success rate"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">
                Service Requests
              </h6>
              <div className="d-flex align-items-center gap-2">
                <FaFilter className="text-muted" />
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="card-body">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(request => (
                  <RequestCard key={request.id} request={request} />
                ))
              ) : (
                <div className="text-center py-5">
                  <FaTools size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No service requests found</h5>
                  <p className="text-muted">New requests will appear here when available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          {/* Quick Stats */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Quick Stats</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Pending Requests</span>
                  <span className="badge bg-warning">
                    {serviceRequests.filter(r => r.status === 'pending').length}
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Active Jobs</span>
                  <span className="badge bg-primary">
                    {serviceRequests.filter(r => ['assigned', 'in_progress'].includes(r.status)).length}
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Completed Today</span>
                  <span className="badge bg-success">
                    {serviceRequests.filter(r => {
                      const today = new Date().toDateString();
                      const completedDate = new Date(r.completed_at).toDateString();
                      return r.status === 'completed' && completedDate === today;
                    }).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Notifications */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Recent Notifications</h6>
            </div>
            <div className="card-body">
              {notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  className={`mb-3 pb-3 border-bottom ${!notification.is_read ? 'bg-light p-2 rounded' : ''}`}
                >
                  <h6 className="mb-1 small">{notification.title}</h6>
                  <p className="mb-1 small text-muted">{notification.message}</p>
                  <small className="text-muted">
                    {formatDate(notification.created_at)}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
