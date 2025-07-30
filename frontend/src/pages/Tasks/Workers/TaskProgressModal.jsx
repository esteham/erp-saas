import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Alert,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import axios from "axios";

const TaskProgressModal = ({ show, handleClose }) => {
  const [taskId, setTaskId] = useState("");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [fetchingTasks, setFetchingTasks] = useState(false);
  const [note, setNote] = useState("");
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (show) {
      fetchWorkersTasks();
    }
  }, [show]);

  const fetchWorkersTasks = async () => {
    setFetchingTasks(true);
    try {
      const response = await axios.get(
        `${BASE_URL}backend/api/tasks/employee/show_task.php`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setTaskList(response.data.data);
      } else {
        setMessage({ type: "danger", text: "Failed to load tasks" });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Error fetching tasks" + error.message });
    } finally {
      setFetchingTasks(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(
        `${BASE_URL}backend/api/tasks/employee/update_progress.php`,
        {
          task_id: taskId,
          progress_percent: progress,
          note: note.trim() === "" ? null : note,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setMessage({ type: "success", text: response.data.message });
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        setMessage({ type: "danger", text: response.data.message });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Server Error: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setTaskId("");
    setProgress(0);
    setMessage({ type: "", text: "" });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Task Progress</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {message.text && <Alert variant={message.type}>{message.text}</Alert>}

          <Form.Group className="mb-3" controlId="taskId">
            <Form.Label>Select Task</Form.Label>
            {fetchingTasks ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <Form.Select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                required
              >
                <option value="">-- Select a task --</option>
                {taskList.map((task) => (
                  <option key={task.task_id} value={task.task_id}>
                    {task.title} (#{task.task_id})
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="progress">
            <Form.Label>Progress: {progress}%</Form.Label>
            <Form.Range
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
            />
            <ProgressBar now={progress} label={`${progress}%`} />
          </Form.Group>
        </Modal.Body>
        <Form.Group className="mb-3" controlId="note">
          <Form.Label>Note (optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Write a note about the progress..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Form.Group>


        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskProgressModal;
