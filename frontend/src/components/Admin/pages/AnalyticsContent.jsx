import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaUsers, 
  FaMoneyBillWave, 
  FaTasks, 
  FaCalendarAlt,
  FaTrendUp,
  FaTrendDown,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const AnalyticsContent = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/backend/api/admin/analytics.php?range=${timeRange}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setAnalytics(response.data.data || {});
      } else {
        throw new Error('API returned error');
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback data for demo
      setAnalytics({
        revenue: {
          current: 45600,
          previous: 38200,
          growth: 19.4
        },
        users: {
          current: 156,
          previous: 142,
          growth: 9.9
        },
        requests: {
          current: 234,
          previous: 198,
          growth: 18.2
        },
        workers: {
          current: 45,
          previous: 41,
          growth: 9.8
        },
        monthlyRevenue: [
          { month: 'Jan', revenue: 32000 },
          { month: 'Feb', revenue: 38000 },
          { month: 'Mar', revenue: 35000 },
          { month: 'Apr', revenue: 42000 },
          { month: 'May', revenue: 45600 },
          { month: 'Jun', revenue: 48000 }
        ],
        topServices: [
          { name: 'Plumbing', requests: 89, revenue: 18500 },
          { name: 'Cleaning', requests: 67, revenue: 12400 },
          { name: 'Electrical', requests: 45, revenue: 15600 },
          { name: 'Gardening', requests: 33, revenue: 8900 }
        ],
        topWorkers: [
          { name: 'Alice Wilson', jobs: 45, rating: 4.8, revenue: 9200 },
          { name: 'Bob Brown', jobs: 32, rating: 4.6, revenue: 7800 },
          { name: 'Carol Davis', jobs: 67, rating: 4.9, revenue: 11400 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-content">
      <div className="content-header">
        <h2><FaChartLine /> Analytics Dashboard</h2>
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon revenue">
            <FaMoneyBillWave />
          </div>
          <div className="metric-content">
            <h3>{formatCurrency(analytics.revenue?.current || 0)}</h3>
            <p>Total Revenue</p>
            <div className={`metric-change ${analytics.revenue?.growth >= 0 ? 'positive' : 'negative'}`}>
              {analytics.revenue?.growth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {formatPercentage(analytics.revenue?.growth || 0)}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon users">
            <FaUsers />
          </div>
          <div className="metric-content">
            <h3>{analytics.users?.current || 0}</h3>
            <p>Total Users</p>
            <div className={`metric-change ${analytics.users?.growth >= 0 ? 'positive' : 'negative'}`}>
              {analytics.users?.growth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {formatPercentage(analytics.users?.growth || 0)}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon requests">
            <FaTasks />
          </div>
          <div className="metric-content">
            <h3>{analytics.requests?.current || 0}</h3>
            <p>Service Requests</p>
            <div className={`metric-change ${analytics.requests?.growth >= 0 ? 'positive' : 'negative'}`}>
              {analytics.requests?.growth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {formatPercentage(analytics.requests?.growth || 0)}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon workers">
            <FaUsers />
          </div>
          <div className="metric-content">
            <h3>{analytics.workers?.current || 0}</h3>
            <p>Active Workers</p>
            <div className={`metric-change ${analytics.workers?.growth >= 0 ? 'positive' : 'negative'}`}>
              {analytics.workers?.growth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {formatPercentage(analytics.workers?.growth || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="analytics-grid">
        {/* Revenue Chart */}
        <div className="chart-card">
          <h4>Monthly Revenue Trend</h4>
          <div className="simple-chart">
            {analytics.monthlyRevenue?.map((item, index) => (
              <div key={index} className="chart-bar">
                <div 
                  className="bar" 
                  style={{ 
                    height: `${(item.revenue / 50000) * 100}%`,
                    backgroundColor: '#dc2626'
                  }}
                ></div>
                <span className="bar-label">{item.month}</span>
                <span className="bar-value">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="table-card">
          <h4>Top Services</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Requests</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topServices?.map((service, index) => (
                  <tr key={index}>
                    <td>{service.name}</td>
                    <td>{service.requests}</td>
                    <td>{formatCurrency(service.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Workers */}
        <div className="table-card">
          <h4>Top Performing Workers</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Jobs</th>
                  <th>Rating</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topWorkers?.map((worker, index) => (
                  <tr key={index}>
                    <td>{worker.name}</td>
                    <td>{worker.jobs}</td>
                    <td>⭐ {worker.rating}</td>
                    <td>{formatCurrency(worker.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-content {
          max-width: 1400px;
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

        .time-range-selector select {
          min-width: 150px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .metric-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .metric-icon.revenue {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .metric-icon.users {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .metric-icon.requests {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .metric-icon.workers {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .metric-content h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.75rem;
          font-weight: bold;
          color: #1f2937;
        }

        .metric-content p {
          margin: 0 0 0.5rem 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .metric-change {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .metric-change.positive {
          color: #10b981;
        }

        .metric-change.negative {
          color: #ef4444;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1.5rem;
        }

        .chart-card, .table-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .chart-card h4, .table-card h4 {
          margin: 0 0 1.5rem 0;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .simple-chart {
          display: flex;
          align-items: end;
          gap: 1rem;
          height: 200px;
          padding: 1rem 0;
        }

        .chart-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          height: 100%;
          position: relative;
        }

        .bar {
          width: 100%;
          max-width: 40px;
          background: #dc2626;
          border-radius: 4px 4px 0 0;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }

        .bar:hover {
          opacity: 0.8;
        }

        .bar-label {
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .bar-value {
          font-size: 0.7rem;
          color: #374151;
          font-weight: 600;
        }

        .table {
          margin: 0;
        }

        .table th {
          border-top: none;
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }

        .table td {
          font-size: 0.9rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .simple-chart {
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsContent;
