import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";

const EditDivisionModal = ({ show, handleClose, division, onSuccess }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (division) {
      setName(division.name || "");
      setFeedback(null);
    }
  }, [division]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!division?.id || name.trim() === "") {
      setFeedback({ type: "danger", message: "Division ID and name are required." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await axios.post("backend/api/division/update.php", {
        id: division.id,
        name: name.trim(),
      });

      if (response.data?.success) {
        onSuccess();
      } else {
        setFeedback({ type: "danger", message: response.data?.message || "Update failed" });
      }
    } catch (err) {
      setFeedback({ type: "danger", message: "Server error occurred: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!division) return null;

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Division</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {feedback && <Alert variant={feedback.type}>{feedback.message}</Alert>}
          <Form.Group controlId="divisionName">
            <Form.Label>Division Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter division name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditDivisionModal;