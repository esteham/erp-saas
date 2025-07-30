import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const DepartmentEditModal = ({
  show,
  handleClose,
  departmentData,
  refreshDepartments,
}) => {
  const [name, setName] = useState(departmentData.name || "");
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setName(departmentData.name || "");
  }, [departmentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (name.trim() === "") {
      setError("Department name is required.");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}backend/api/department/edit.php`,
        { id: departmentData.id, name },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        refreshDepartments();
        handleClose();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update department.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Department</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group>
            <Form.Label>Department Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter department name"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Update
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DepartmentEditModal;
