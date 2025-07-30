import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Card, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TaskAssignment = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskFiles, setTaskFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  // file input er jonno ref
  const fileInputRef = useRef(null);

  // Load all groups on mount
  useEffect(() => {
    axios
      .get(`${BASE_URL}backend/api/groups/fetchAllGroups.php`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setGroups(res.data.groups);
        } else {
          setMessage({ type: "error", text: res.data.message });
        }
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load groups" });
      });
  }, []);

  // Load employees when group changes
  useEffect(() => {
    if (!selectedGroup) {
      setEmployees([]);
      setSelectedEmployees([]);
      return;
    }
    axios
      .post(
        `${BASE_URL}backend/api/employees/fetchGroupEmployees.php`,
        { group_id: selectedGroup },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.success) {
          setEmployees(res.data.employees);
        } else {
          setEmployees([]);
          setMessage({ type: "error", text: res.data.message });
        }
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load employees" });
      });
  }, [selectedGroup]);

  // Handle employee selection toggle
  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setTaskFiles(e.target.files);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedGroup ||
      selectedEmployees.length === 0 ||
      !taskTitle ||
      !deadline
    ) {
      setMessage({ type: "error", text: "All required fields must be filled" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("group_id", selectedGroup);
      selectedEmployees.forEach((id) => formData.append("employee_ids[]", id));
      formData.append("task_title", taskTitle);
      formData.append("task_note", taskNote);
      formData.append(
        "deadline",
        deadline ? deadline.toISOString().split("T")[0] : ""
      );

      for (let i = 0; i < taskFiles.length; i++) {
        formData.append("task_files[]", taskFiles[i]);
      }

      const res = await axios.post(
        `${BASE_URL}backend/api/tasks/admin/assign.php`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setMessage({ type: "success", text: res.data.message });

        // Reset all fields
        setSelectedGroup("");
        setEmployees([]);
        setSelectedEmployees([]);
        setTaskTitle("");
        setTaskNote("");
        setDeadline("");
        setTaskFiles([]);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      } else {
        setMessage({
          type: "error",
          text: res.data.message || "Failed to assign task",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <Card className="p-4">
      <h3>Assign New Task</h3>
      {message && (
        <Alert
          variant={message.type === "success" ? "success" : "danger"}
          dismissible
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Select Group</Form.Label>
              <Form.Select
                className="custom-select-fix"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                required
              >
                <option value="">-- Select Group --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.group_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          {employees.length > 0 && (
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Employees</Form.Label>
                <div
                  className="border rounded p-2"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {employees.map((emp) => (
                    <div key={emp.id}>
                      <Form.Check
                        type="checkbox"
                        label={`${emp.first_name} ${emp.last_name}`}
                        checked={selectedEmployees.includes(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                      />
                    </div>
                  ))}
                </div>
              </Form.Group>
            </Col>
          )}
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Task Title</Form.Label>
              <Form.Control
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="d-block">Deadline</Form.Label>
              <DatePicker
                selected={deadline}
                onChange={(date) => setDeadline(date)}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="Select a date"
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Task Note</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={taskNote}
            onChange={(e) => setTaskNote(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Attach Files</Form.Label>
          <Form.Control
            type="file"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </Form.Group>
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Assign Task"}
        </Button>
      </Form>
    </Card>
  );
};

export default TaskAssignment;
