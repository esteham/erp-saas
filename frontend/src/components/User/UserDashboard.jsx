import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlus, 
  FaHistory, 
  FaChartLine, 
  FaBell,
  FaSearch,
  FaFilter,
  FaUser,
  FaCog,
  FaHeart
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ServiceCard from '../Services/ServiceCard';
import ServiceRequestForm from '../Services/ServiceRequestForm';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [serviceRequests, setServiceRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [requestsRes, statsRes, notificationsRes] = await Promise.all([
        axios.get('/api/user/history.php'),
        axios.get('/api/user/stats.php'),
        axios.get('/api/user/notifications.php')
      ]);

      if (requestsRes.data.success) {
        setServiceRequests(requestsRes.data.data);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
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

  const handleServiceRequestSuccess = (newRequest) => {
    setServiceRequests(prev => [newRequest, ...prev]);
    setShowRequestForm(false);
    loadDashboardData(); // Refresh stats
  };

  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
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
            {change && (
              <div className={`text-xs ${change > 0 ? 'text-success' : 'text-danger'}`}>
                {change > 0 ? '+' : ''}{change}% from last month
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

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      className={`nav-link ${isActive ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      <Icon className="me-2" />
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      {/* Header */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">
            {getGreeting()}, {user?.username}! 👋
          </h1>
          <p className="text-muted mb-0">Welcome to your service dashboard</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setShowRequestForm(true)}
          >
            <FaPlus className="me-2" />
            Request Service
          </button>
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
            title="Total Requests"
            value={stats.total_requests || 0}
            icon={FaHistory}
            color="primary"
            change={stats.requests_change}
          />
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <StatCard
            title="Completed Services"
            value={stats.completed_services || 0}
            icon={FaChartLine}
            color="success"
            change={stats.completed_change}
          />
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <StatCard
            title="Total Spent"
            value={`$${stats.total_spent || 0}`}
            icon={FaChartLine}
            color="info"
            change={stats.spending_change}
          />
        </div>
        <div className="col-xl-3 col-md-6 mb-4">
          <StatCard
            title="Favorite Services"
            value={stats.favorite_services || 0}
            icon={FaHeart}
            color="warning"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <TabButton
                id="overview"
                label="Overview"
                icon={FaChartLine}
                isActive={activeTab === 'overview'}
                onClick={setActiveTab}
              />
            </li>
            <li className="nav-item">
              <TabButton
                id="requests"
                label="My Requests"
                icon={FaHistory}
                isActive={activeTab === 'requests'}
                onClick={setActiveTab}
              />
            </li>
            <li className="nav-item">
              <TabButton
                id="profile"
                label="Profile"
                icon={FaUser}
                isActive={activeTab === 'profile'}
                onClick={setActiveTab}
              />
            </li>
            <li className="nav-item">
              <TabButton
                id="settings"
                label="Settings"
                icon={FaCog}
                isActive={activeTab === 'settings'}
                onClick={setActiveTab}
              />
            </li>
          </ul>
        </div>

        <div className="card-body">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="row"
            >
              <div className="col-lg-8">
                <h5 className="mb-3">Recent Activity</h5>
                {serviceRequests.slice(0, 3).map(request => (
                  <ServiceCard
                    key={request.id}
                    service={request}
                    onViewDetails={(service) => console.log('View details:', service)}
                  />
                ))}
              </div>
              <div className="col-lg-4">
                <h5 className="mb-3">Notifications</h5>
                <div className="list-group">
                  {notifications.slice(0, 5).map(notification => (
                    <div
                      key={notification.id}
                      className={`list-group-item ${!notification.is_read ? 'list-group-item-primary' : ''}`}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{notification.title}</h6>
                        <small>{new Date(notification.created_at).toLocaleDateString()}</small>
                      </div>
                      <p className="mb-1">{notification.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Search and Filter */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaFilter />
                    </span>
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Service Requests Grid */}
              <div className="row">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map(request => (
                    <div key={request.id} className="col-lg-6 col-xl-4 mb-4">
                      <ServiceCard
                        service={request}
                        onViewDetails={(service) => console.log('View details:', service)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    <div className="text-muted">
                      <FaHistory size={48} className="mb-3" />
                      <h5>No service requests found</h5>
                      <p>Start by requesting your first service!</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowRequestForm(true)}
                      >
                        <FaPlus className="me-2" />
                        Request Service
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h5 className="mb-3">Profile Information</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Personal Details</h6>
                      <p><strong>Username:</strong> {user?.username}</p>
                      <p><strong>Email:</strong> {user?.email}</p>
                      <p><strong>Role:</strong> {user?.role}</p>
                      <p><strong>Member Since:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Service Statistics</h6>
                      <p><strong>Total Requests:</strong> {stats.total_requests || 0}</p>
                      <p><strong>Completed Services:</strong> {stats.completed_services || 0}</p>
                      <p><strong>Average Rating Given:</strong> {stats.avg_rating_given || 'N/A'}</p>
                      <p><strong>Total Spent:</strong> ${stats.total_spent || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h5 className="mb-3">Account Settings</h5>
              <div className="row">
                <div className="col-md-8">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Notification Preferences</h6>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="emailNotifications" defaultChecked />
                        <label className="form-check-label" htmlFor="emailNotifications">
                          Email notifications for service updates
                        </label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="smsNotifications" />
                        <label className="form-check-label" htmlFor="smsNotifications">
                          SMS notifications for urgent updates
                        </label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="promotionalEmails" />
                        <label className="form-check-label" htmlFor="promotionalEmails">
                          Promotional emails and offers
                        </label>
                      </div>
                      <button className="btn btn-primary mt-3">Save Preferences</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Service Request Modal */}
      {showRequestForm && (
        <ServiceRequestForm
          onClose={() => setShowRequestForm(false)}
          onSuccess={handleServiceRequestSuccess}
        />
      )}
    </div>
  );
};

export default UserDashboard;
