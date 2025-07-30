import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Badge, Card, Button } from "react-bootstrap";
import TaskProgressModal from "./TaskProgressModal"; 
import TaskDetailsModal from "./TaskDetailsModal";


const WorkersTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}backend/api/tasks/employee/show_task.php`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setTasks(res.data.data);
        } else {
          setError(res.data.message || "Failed to load tasks");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching tasks: " + err.message);
        setLoading(false);
      });
  };

  const handleDetails = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTask(null);
    fetchTasks();
  };
  const handleShowDetails = (task) => {
    setSelectedTaskDetails(task);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedTaskDetails(null);
  };


  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <Card className="mt-3">
        <Card.Header>📋 My Assigned Tasks</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Deadline</th>
                <th>Assigned At</th>
                <th>Progress</th>
                <th>Files</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, idx) => (
                <tr key={task.task_id}>
                  <td>{idx + 1}</td>
                  <td>{task.title}</td>
                  <td>{task.deadline}</td>
                  <td>{task.assigned_at}</td>
                  <td>
                    <Badge bg={task.progress >= 100 ? "success" : "warning"}>
                      {task.progress}%
                    </Badge>
                  </td>
                  <td>
                    {task.files.length > 0 ? (
                      task.files.map((file, index) => (
                        <div key={index}>
                          <a style={{ textDecoration: 'none' }}
                            href={`${BASE_URL}backend/assets/uploads/tasks/${file}`}
                            target="_blank"
                            rel="noreferrer"
                            download
                          >
                            📁 Download File {index + 1}
                          </a>
                        </div>
                      ))
                    ) : (
                      <span>No files</span>
                    )}
                  </td>
                  <td>
                    {selectedTaskDetails && (
                      <TaskDetailsModal
                        show={showDetailsModal}
                        handleClose={handleCloseDetails}
                        task={selectedTaskDetails}
                        BASE_URL={BASE_URL}
                      />
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowDetails(task)}
                    >
                      Details
                    </Button>

                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleDetails(task)}
                    >
                      Update Progress
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {selectedTask && (
        <TaskProgressModal
          show={showModal}
          handleClose={handleModalClose}
          task={selectedTask}
        />
      )}
    </>
  );
};

export default WorkersTasks;
