import React from "react";
import { Modal, Button, Badge, ListGroup } from "react-bootstrap";

const TaskDetailsModal = ({ show, handleClose, task, }) => {
  if (!task) return null;

  return (
    <Modal show={show} onHide={handleClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>📄 Task Details - {task.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup variant="flush">
          <ListGroup.Item><strong>Title:</strong> {task.title}</ListGroup.Item>
          <ListGroup.Item><strong>Group:</strong> {task.group_name }</ListGroup.Item>
          <ListGroup.Item><strong>Description:</strong> {task.note || "N/A"}</ListGroup.Item>
          <ListGroup.Item><strong>Deadline:</strong> {task.deadline}</ListGroup.Item>
          <ListGroup.Item><strong>Assigned At:</strong> {task.assigned_at}</ListGroup.Item>
          <ListGroup.Item>
            <strong>Progress:</strong>{" "}
            <Badge bg={task.progress >= 100 ? "success" : "warning"}>
              {task.progress}%
            </Badge>
          </ListGroup.Item>
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskDetailsModal;
