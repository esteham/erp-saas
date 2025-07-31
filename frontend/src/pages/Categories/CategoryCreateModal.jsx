import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const CategoryCreateModal = ({ show, handleClose, refreshCategories }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (name.trim() === "") {
      setError("Category name is required.");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}backend/api/categories/create.php`,
        { name },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        refreshCategories();
        setName("");
        handleClose();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error("Category creation error:", err);
      setError("Failed to create Category.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group>
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Category name"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CategoryCreateModal;
