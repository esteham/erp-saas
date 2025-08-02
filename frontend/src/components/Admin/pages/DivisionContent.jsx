import React, { useState, useEffect } from 'react';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const DivisionContent = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDivision, setEditingDivision] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}backend/api/admin/divisions.php`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setDivisions(response.data.data || []);
      } else {
        // Fallback data for demo
        setDivisions([
          {
            id: 1,
            name: 'North Division',
            description: 'Covers northern areas of the city',
            manager: 'John Smith',
            workers_count: 15,
            active_requests: 8
          },
          {
            id: 2,
            name: 'South Division',
            description: 'Covers southern areas of the city',
            manager: 'Sarah Johnson',
            workers_count: 12,
            active_requests: 5
          },
          {
            id: 3,
            name: 'East Division',
            description: 'Covers eastern areas of the city',
            manager: 'Mike Wilson',
            workers_count: 10,
            active_requests: 3
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load divisions:', error);
      toast.error('Failed to load divisions');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (division) => {
    setEditingDivision(division);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this division?')) {
      try {
        const response = await axios.delete(`${BASE_URL}backend/api/admin/divisions.php`, {
          data: { id },
          withCredentials: true
        });
        
        if (response.data.success) {
          toast.success('Division deleted successfully');
          loadDivisions();
        } else {
          toast.error('Failed to delete division');
        }
      } catch (error) {
        console.error('Failed to delete division:', error);
        toast.error('Failed to delete division');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading divisions...</p>
      </div>
    );
  }

  return (
    <div className="divisions-content">
      <div className="content-header">
        <h2><FaBuilding /> Division Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingDivision(null);
            setShowModal(true);
          }}
        >
          <FaPlus /> Add New Division
        </button>
      </div>

      <div className="divisions-grid">
        {divisions.map((division) => (
          <div key={division.id} className="division-card">
            <div className="division-header">
              <div className="division-icon">
                <FaBuilding />
              </div>
              <div className="division-info">
                <h4>{division.name}</h4>
                <p>{division.description}</p>
              </div>
            </div>

            <div className="division-stats">
              <div className="stat-item">
                <span className="stat-label">Manager:</span>
                <span className="stat-value">{division.manager}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Workers:</span>
                <span className="stat-value">{division.workers_count}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Requests:</span>
                <span className="stat-value">{division.active_requests}</span>
              </div>
            </div>

            <div className="division-actions">
              <button 
                className="btn btn-sm btn-info"
                onClick={() => handleEdit(division)}
              >
                <FaEdit /> Edit
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(division.id)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .divisions-content {
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

        .divisions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .division-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .division-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .division-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .division-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }

        .division-info h4 {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.25rem;
        }

        .division-info p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .division-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #f8fafc;
          border-radius: 6px;
        }

        .stat-label {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .stat-value {
          color: #1f2937;
          font-weight: 600;
        }

        .division-actions {
          display: flex;
          gap: 0.5rem;
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

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .divisions-grid {
            grid-template-columns: 1fr;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DivisionContent;
