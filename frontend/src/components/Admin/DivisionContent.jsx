import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import CreateDivisionModal from "../../pages/Division/CreateDivisionModal";
import EditDivisionModal from "../../pages/Division/EditDivisionModal";

const DivisionContent = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setEditModalShow] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchDivisions = async () => {
    try {
      const res = await fetch(`${BASE_URL}backend/api/division/fetch_division.php`);
      const result = await res.json();
      if (result.success) {
        setDivisions(result.data);
      } else {
        setDivisions([]);
        alert("Failed to fetch divisions: " + result.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Server error while fetching divisions");
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this division?")) return;

    try {
      const res = await fetch(`${BASE_URL}backend/api/division/delete.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();
      if (result.success) {
        fetchDivisions();
      } else {
        alert("Failed to delete division");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while deleting division");
    }
  };

  const handleEdit = (division) => {
    setSelectedDivision(division);
    setEditModalShow(true);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Division Management</h4>
        <Button variant="success" onClick={() => setShowCreateModal(true)}>
          + Add Division
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Division Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {divisions.length > 0 ? (
            divisions.map((division, index) => (
              <tr key={division.id}>
                <td>{index + 1}</td>
                <td>{division.name}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(division)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(division.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No divisions found</td>
            </tr>
          )}
        </tbody>
      </Table>

      <CreateDivisionModal
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        onSuccess={fetchDivisions}
      />

      <EditDivisionModal
        show={showEditModal}
        handleClose={() => {
          setEditModalShow(false);
          setSelectedDivision(null);
        }}
        division={selectedDivision}
        onSuccess={() => {
          fetchDivisions();
          setEditModalShow(false);
          setSelectedDivision(null);
        }}
      />
    </div>
  );
};

export default DivisionContent;
