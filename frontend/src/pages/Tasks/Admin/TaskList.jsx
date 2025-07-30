import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Badge } from "react-bootstrap";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${BASE_URL}backend/api/tasks/admin/list.php`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setTasks(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch tasks");
        }
      })
      .catch(() => {
        setError("Server error occurred");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h3 className="mb-4">📋 Assigned Tasks</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Deadline</th>
            <th>Assigned At</th>
            <th>Group</th>
            <th>Employee</th>
            <th>Email</th>
            <th>Files</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.task_id}>
                <td>{task.title}</td>
                <td>{task.deadline}</td>
                <td>{task.assigned_at}</td>
                <td>
                  <Badge bg="info">{task.group_name}</Badge>
                </td>
                <td>{task.employee_name}</td>
                <td>{task.employee_email}</td>
                <td>
                  {task.files.length > 0 ? (
                    task.files.map((file, index) => (
                      <div key={index}>
                        <a
                          href={`${BASE_URL}backend/assets/uploads/tasks/${file}`}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="btn btn-sm btn-primary"
                        >
                          Download
                        </a>
                      </div>
                    ))
                  ) : (
                    <span>No files</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TaskList;
