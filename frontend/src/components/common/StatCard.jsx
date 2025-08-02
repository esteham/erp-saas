import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  subtitle, 
  trend,
  onClick,
  delay = 0
}) => {
  const colorClasses = {
    primary: { bg: '#3b82f6', light: '#dbeafe' },
    success: { bg: '#10b981', light: '#d1fae5' },
    warning: { bg: '#f59e0b', light: '#fef3c7' },
    danger: { bg: '#ef4444', light: '#fee2e2' },
    info: { bg: '#06b6d4', light: '#cffafe' },
    purple: { bg: '#8b5cf6', light: '#e9d5ff' },
    indigo: { bg: '#6366f1', light: '#e0e7ff' }
  };

  const colorConfig = colorClasses[color] || colorClasses.primary;

  return (
    <motion.div
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      whileHover={{ scale: onClick ? 1.03 : 1.02, y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
    >
      <div className="stat-content">
        <div className="stat-icon" style={{ backgroundColor: colorConfig.bg }}>
          <Icon />
        </div>
        <div className="stat-info">
          <div className="stat-value">{value}</div>
          <div className="stat-title">{title}</div>
          {subtitle && <div className="stat-subtitle">{subtitle}</div>}
          {trend && (
            <div className={`stat-trend ${trend.type}`}>
              {trend.icon && <trend.icon className="trend-icon" />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          cursor: ${onClick ? 'pointer' : 'default'};
          border: 1px solid #f1f5f9;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: ${colorConfig.bg};
          opacity: 0.8;
        }

        .stat-card:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
          border-color: ${colorConfig.bg}20;
        }

        .stat-card.clickable:hover {
          transform: translateY(-2px);
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 1rem;
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
          box-shadow: 0 4px 12px ${colorConfig.bg}40;
        }

        .stat-info {
          flex: 1;
          min-width: 0;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.2;
          margin-bottom: 0.25rem;
        }

        .stat-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .stat-subtitle {
          font-size: 0.8125rem;
          color: #9ca3af;
          margin-bottom: 0.5rem;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .stat-trend.positive {
          color: #059669;
        }

        .stat-trend.negative {
          color: #dc2626;
        }

        .stat-trend.neutral {
          color: #6b7280;
        }

        .trend-icon {
          font-size: 0.75rem;
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .stat-card {
            padding: 1.25rem;
          }

          .stat-content {
            gap: 0.75rem;
          }

          .stat-icon {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }

          .stat-value {
            font-size: 1.75rem;
          }

          .stat-title {
            font-size: 0.8125rem;
          }
        }

        /* Animation for value changes */
        .stat-value {
          transition: all 0.3s ease;
        }

        .stat-card:hover .stat-value {
          color: ${colorConfig.bg};
        }
      `}</style>
    </motion.div>
  );
};

export default StatCard;
