import React from "react";
import { Table, Button, Spinner } from "react-bootstrap";

const DepartmentsContent = ({
  departments,
  loading,
  setShowCreateModal,
  setEditModalShow,
  setSelectedDept,
  handleDelete,
}) => {
  const handleEditClick = (dept) => {
    setSelectedDept(dept);
    setEditModalShow(true);
  };

  return (
    <div>
      <h4>Department Management</h4>
      <Button
        variant="primary"
        className="mb-3"
        onClick={() => setShowCreateModal(true)}
      >
        + Add Department
      </Button>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th style={{ width: "160px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.id}</td>
                <td>{dept.name}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEditClick(dept)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(dept.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default DepartmentsContent;
