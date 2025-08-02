import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaChartLine, 
  FaCreditCard, 
  FaReceipt,
  FaCalendarAlt,
  FaDownload,
  FaFilter
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const FinanceContent = () => {
  const [financialData, setFinancialData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('month');

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadFinancialData();
  }, [dateFilter]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost';
      
      // Load financial overview
      const overviewResponse = await axios.get(`${apiUrl}/backend/api/admin/finance.php?action=overview`, {
        withCredentials: true
      });
      
      // Load transactions
      const transactionsResponse = await axios.get(`${apiUrl}/backend/api/admin/finance.php?action=transactions&limit=10`, {
        withCredentials: true
      });
      
      if (overviewResponse.data.success) {
        const overview = overviewResponse.data.data;
        setFinancialData({
          totalRevenue: overview.totalRevenue || 0,
          totalExpenses: overview.platformCommission || 0,
          netProfit: overview.workerPayouts || 0,
          pendingPayments: overview.pendingPayments || 0,
          completedTransactions: overview.transactionCount || 0,
          averageOrderValue: overview.avgTransaction || 0
        });
      }
      
      if (transactionsResponse.data.success) {
        const transactions = transactionsResponse.data.data || [];
        setTransactions(transactions.map(transaction => ({
          id: transaction.id,
          type: 'income',
          amount: parseFloat(transaction.amount),
          description: `${transaction.service_name} - ${transaction.customer_name}`,
          date: transaction.created_at?.split(' ')[0] || transaction.created_at,
          status: transaction.status,
          customer: transaction.customer_name,
          worker: transaction.worker_name
        })));
      }
      
    } catch (error) {
      console.error('Failed to load financial data:', error);
      toast.error('Failed to load financial data. Please check your connection and try again.');
      
      // Set empty state instead of dummy data
      setFinancialData({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        pendingPayments: 0,
        completedTransactions: 0,
        averageOrderValue: 0
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    toast.info('Export functionality coming soon!');
  };

  const getTransactionIcon = (type) => {
    return type === 'income' ? FaMoneyBillWave : FaCreditCard;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="finance-content">
      <div className="content-header">
        <h2><FaMoneyBillWave /> Financial Management</h2>
        <div className="header-actions">
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-primary" onClick={exportReport}>
            <FaDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="finance-stats">
        <div className="stat-card revenue">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-info">
            <h3>${financialData.totalRevenue?.toLocaleString() || '0'}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card expenses">
          <div className="stat-icon">
            <FaCreditCard />
          </div>
          <div className="stat-info">
            <h3>${financialData.totalExpenses?.toLocaleString() || '0'}</h3>
            <p>Total Expenses</p>
          </div>
        </div>

        <div className="stat-card profit">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <h3>${financialData.netProfit?.toLocaleString() || '0'}</h3>
            <p>Net Profit</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <FaReceipt />
          </div>
          <div className="stat-info">
            <h3>${financialData.pendingPayments?.toLocaleString() || '0'}</h3>
            <p>Pending Payments</p>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">Completed Transactions</span>
          <span className="metric-value">{financialData.completedTransactions || 0}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Average Order Value</span>
          <span className="metric-value">${financialData.averageOrderValue || 0}</span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="transactions-section">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <button className="btn btn-outline">
            <FaFilter /> Filter
          </button>
        </div>

        <div className="transactions-list">
          {transactions.map((transaction) => {
            const IconComponent = getTransactionIcon(transaction.type);
            return (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon" style={{ 
                  background: transaction.type === 'income' ? '#10b981' : '#ef4444' 
                }}>
                  <IconComponent />
                </div>
                
                <div className="transaction-details">
                  <h4>{transaction.description}</h4>
                  <p>{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                
                <div className="transaction-amount">
                  <span className={`amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                  </span>
                  <span 
                    className="status"
                    style={{ color: getStatusColor(transaction.status) }}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .finance-content {
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
          align-items: center;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
        }

        .finance-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .stat-card.revenue .stat-icon { background: linear-gradient(135deg, #10b981, #059669); }
        .stat-card.expenses .stat-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .stat-card.profit .stat-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .stat-card.pending .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }

        .stat-info h3 {
          margin: 0 0 0.25rem 0;
          color: #1f2937;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .stat-info p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .metric-value {
          color: #1f2937;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .transactions-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .transaction-item:hover {
          background: #f1f5f9;
        }

        .transaction-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
        }

        .transaction-details {
          flex: 1;
        }

        .transaction-details h4 {
          margin: 0 0 0.25rem 0;
          color: #1f2937;
          font-size: 0.9rem;
        }

        .transaction-details p {
          margin: 0;
          color: #6b7280;
          font-size: 0.8rem;
        }

        .transaction-amount {
          text-align: right;
        }

        .amount {
          display: block;
          font-weight: 600;
          font-size: 1rem;
        }

        .amount.income { color: #10b981; }
        .amount.expense { color: #ef4444; }

        .status {
          display: block;
          font-size: 0.75rem;
          text-transform: capitalize;
          margin-top: 0.25rem;
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

        .btn-primary { background: #dc2626; color: white; }
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
          .finance-stats {
            grid-template-columns: 1fr;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .transaction-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .transaction-amount {
            text-align: left;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default FinanceContent;
