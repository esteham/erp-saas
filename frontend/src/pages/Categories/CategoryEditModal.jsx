import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const CategoryEditModal = ({
  show,
  handleClose,
  categoryData,
  refreshCategories,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (categoryData && categoryData.name) {
      setName(categoryData.name);
    } else {
      setName("");
    }
  }, [categoryData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (name.trim() === "") {
      setError("Category name is required.");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}backend/api/categories/edit.php`,
        { id: categoryData.id, name },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        refreshCategories();
        handleClose();
      } else {
        setError(res.data.message || "Failed to update category.");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update category. Please try again.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group controlId="categoryName">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
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

export default CategoryEditModal;
