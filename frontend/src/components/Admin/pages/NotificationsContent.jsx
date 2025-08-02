import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaEye,
  FaCog,
  FaFilter,
  FaMarkdown
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const NotificationsContent = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost';
      const isReadFilter = filter === 'read' ? '1' : filter === 'unread' ? '0' : '';
      const response = await axios.get(`${apiUrl}/backend/api/admin/notifications.php?action=list&is_read=${isReadFilter}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const notifications = response.data.data.notifications || [];
        setNotifications(notifications.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: notification.created_at,
          isRead: notification.is_read === 1 || notification.is_read === true,
          priority: 'medium', // Default priority since not in DB schema
          category: notification.type,
          user: notification.user_name
        })));
      } else {
        throw new Error(response.data.message || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications. Please check your connection and try again.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds) => {
    try {
      await axios.post(`${BASE_URL}backend/api/admin/notifications/mark-read.php`, {
        notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds]
      }, { withCredentials: true });
      
      setNotifications(notifications.map(notif => 
        (Array.isArray(notificationIds) ? notificationIds : [notificationIds]).includes(notif.id) 
          ? { ...notif, isRead: true } 
          : notif
      ));
      
      toast.success('Notifications marked as read');
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const deleteNotifications = async (notificationIds) => {
    if (window.confirm('Are you sure you want to delete selected notifications?')) {
      try {
        await axios.delete(`${BASE_URL}backend/api/admin/notifications.php`, {
          data: { notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds] },
          withCredentials: true
        });
        
        setNotifications(notifications.filter(notif => 
          !(Array.isArray(notificationIds) ? notificationIds : [notificationIds]).includes(notif.id)
        ));
        setSelectedNotifications([]);
        toast.success('Notifications deleted successfully');
      } catch (error) {
        console.error('Failed to delete notifications:', error);
        toast.error('Failed to delete notifications');
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return FaExclamationTriangle;
      case 'error': return FaTimesCircle;
      case 'success': return FaCheckCircle;
      case 'info': return FaInfoCircle;
      default: return FaBell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead;
      case 'read': return notification.isRead;
      case 'high': return notification.priority === 'high';
      case 'system': return notification.category === 'system';
      case 'requests': return notification.category === 'request';
      default: return true;
    }
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-content">
      <div className="content-header">
        <h2><FaBell /> Notification Center</h2>
        <div className="header-actions">
          <button className="btn btn-outline">
            <FaCog /> Settings
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
        <button 
          className={`filter-tab ${filter === 'high' ? 'active' : ''}`}
          onClick={() => setFilter('high')}
        >
          High Priority ({notifications.filter(n => n.priority === 'high').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'system' ? 'active' : ''}`}
          onClick={() => setFilter('system')}
        >
          System
        </button>
        <button 
          className={`filter-tab ${filter === 'requests' ? 'active' : ''}`}
          onClick={() => setFilter('requests')}
        >
          Requests
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedNotifications.length} selected</span>
          <div className="bulk-buttons">
            <button 
              className="btn btn-sm btn-info"
              onClick={() => markAsRead(selectedNotifications)}
            >
              <FaEye /> Mark as Read
            </button>
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => deleteNotifications(selectedNotifications)}
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="notifications-container">
        <div className="notifications-header">
          <label className="select-all">
            <input
              type="checkbox"
              checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
              onChange={selectAllNotifications}
            />
            Select All
          </label>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="no-notifications">
              <FaBell size={48} color="#e5e7eb" />
              <h3>No notifications found</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleNotificationSelection(notification.id)}
                    />
                  </div>

                  <div 
                    className="notification-icon"
                    style={{ color: getNotificationColor(notification.type) }}
                  >
                    <IconComponent />
                  </div>

                  <div className="notification-content">
                    <div className="notification-header">
                      <h4>{notification.title}</h4>
                      <div className="notification-meta">
                        <span 
                          className="priority-badge"
                          style={{ background: getPriorityBadge(notification.priority) }}
                        >
                          {notification.priority}
                        </span>
                        <span className="timestamp">{formatTimestamp(notification.timestamp)}</span>
                      </div>
                    </div>
                    <p>{notification.message}</p>
                    <div className="notification-category">
                      <span className="category-tag">{notification.category}</span>
                    </div>
                  </div>

                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <FaEye />
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteNotifications(notification.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style jsx>{`
        .notifications-content {
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

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .filter-tab.active {
          background: #dc2626;
          border-color: #dc2626;
          color: white;
        }

        .filter-tab:hover:not(.active) {
          background: #f8fafc;
        }

        .bulk-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f0f9ff;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .bulk-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .notifications-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .notifications-header {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .select-all {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          color: #374151;
        }

        .notifications-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.2s ease;
        }

        .notification-item:hover {
          background: #f8fafc;
        }

        .notification-item.unread {
          background: #fef7ff;
          border-left: 4px solid #dc2626;
        }

        .notification-checkbox {
          display: flex;
          align-items: center;
          padding-top: 0.25rem;
        }

        .notification-icon {
          font-size: 1.25rem;
          padding-top: 0.25rem;
        }

        .notification-content {
          flex: 1;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .notification-header h4 {
          margin: 0;
          color: #1f2937;
          font-size: 1rem;
          font-weight: 600;
        }

        .notification-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .priority-badge {
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .timestamp {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .notification-content p {
          margin: 0 0 0.75rem 0;
          color: #6b7280;
          line-height: 1.5;
        }

        .notification-category {
          display: flex;
          gap: 0.5rem;
        }

        .category-tag {
          padding: 0.25rem 0.5rem;
          background: #e5e7eb;
          color: #374151;
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: capitalize;
        }

        .notification-actions {
          display: flex;
          gap: 0.5rem;
          padding-top: 0.25rem;
        }

        .no-notifications {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          gap: 1rem;
        }

        .no-notifications h3 {
          margin: 0;
          color: #6b7280;
        }

        .no-notifications p {
          margin: 0;
          color: #9ca3af;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .btn-primary { background: #dc2626; color: white; }
        .btn-info { background: #06b6d4; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-outline { 
          background: transparent; 
          color: #6b7280; 
          border: 1px solid #e5e7eb; 
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .notification-item {
            flex-direction: column;
            gap: 0.75rem;
          }

          .notification-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .notification-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .bulk-actions {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsContent;
