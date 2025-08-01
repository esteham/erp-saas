import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const CreateDivisionModal = ({ show, handleClose, onSuccess }) => {
  const [divisionName, setDivisionName] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!divisionName.trim()) {
      setMessage("Division name is required");
      setStatus("error");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}backend/api/division/create.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ name: divisionName }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(result.message);
        setStatus("success");
        setDivisionName("");
        onSuccess();
        setTimeout(() => {
          handleClose();
          setMessage("");
        }, 1000);
      } else {
        setMessage(result.message || "Failed to add division");
        setStatus("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error occurred");
      setStatus("error");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Division</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && (
          <Alert variant={status === "success" ? "success" : "danger"}>
            {message}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="divisionName">
            <Form.Label>Division Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter division name"
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
            />
          </Form.Group>
          <Button className="mt-3" variant="primary" type="submit">
            Save Division
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateDivisionModal;
