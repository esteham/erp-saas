import React from "react";
import { Table, Button, Spinner } from "react-bootstrap";

const CategoryContent = ({
  categories,
  loading,
  setShowCreateModal,
  setEditModalShow,
  setSelectedcat,
  handleDelete,
}) => {
  const handleEditClick = (cat) => {
    setSelectedcat(cat);
    setEditModalShow(true);
  };

  return (
    <div>
      <h4>Category Management</h4>
      <Button
        variant="primary"
        className="mb-3"
        onClick={() => setShowCreateModal(true)}
      >
        + Add Categoty
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
            {(categories ?? []).map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.name}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEditClick(cat)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(cat.id)}
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

export default CategoryContent;
