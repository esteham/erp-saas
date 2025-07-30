import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Form,
  Alert,
  FloatingLabel,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { XCircle, PlusCircle, CheckCircle, X } from "react-bootstrap-icons";

const GroupCreateModal = ({ show, handleClose, refreshGroups }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [employeeFields, setEmployeeFields] = useState([
    { value: "", selectedId: null, suggestions: [] },
  ]);
  const [response, setResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (show) {
      axios
        .get(`${BASE_URL}backend/api/employees/view.php`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.success) {
            setAllEmployees(res.data.employees);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch employees:", err);
        });
    }
  }, [show]);

  const handleEmployeeChange = (index, input) => {
    const updated = [...employeeFields];
    updated[index].value = input;
    updated[index].selectedId = null; // reset selected ID when manually typed
    updated[index].suggestions = allEmployees.filter((emp) => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      return (
        emp.id.toString().includes(input.toLowerCase()) ||
        fullName.includes(input.toLowerCase())
      );
    });
    setEmployeeFields(updated);
  };

  const selectSuggestion = (index, emp) => {
    const updated = [...employeeFields];
    updated[index].value = `${emp.id} - ${emp.first_name} ${emp.last_name}`;
    updated[index].selectedId = emp.id;
    updated[index].suggestions = [];
    setEmployeeFields(updated);
  };

  const addEmployeeField = () => {
    setEmployeeFields([
      ...employeeFields,
      { value: "", selectedId: null, suggestions: [] },
    ]);
  };

  const removeEmployeeField = (index) => {
    if (employeeFields.length > 1) {
      const updated = [...employeeFields];
      updated.splice(index, 1);
      setEmployeeFields(updated);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setDescription("");
    setEmployeeFields([{ value: "", selectedId: null, suggestions: [] }]);
    setResponse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      group_name: groupName.trim(),
      description: description.trim(),
      employee_ids: employeeFields
        .map((e) => e.selectedId)
        .filter((id) => !!id),
    };

    try {
      const res = await axios.post(
        `${BASE_URL}backend/api/groups/create.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setResponse(res.data);
      if (res.data.success) {
        resetForm();
        if (refreshGroups) refreshGroups();
        setTimeout(() => handleClose(), 2000);
      }
    } catch (error) {
      setResponse({
        success: false,
        message: error.response?.data?.message || "Network error",
        error: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    resetForm();
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h5 fw-bold">Create New Group</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <FloatingLabel
            controlId="groupName"
            label="Group Name"
            className="mb-3"
          >
            <Form.Control
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              autoFocus
            />
          </FloatingLabel>

          <FloatingLabel
            controlId="description"
            label="Description (Optional)"
            className="mb-3"
          >
            <Form.Control
              as="textarea"
              placeholder="Enter description"
              style={{ height: "100px" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FloatingLabel>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="fw-semibold">Employee IDs</Form.Label>
              <Badge bg="light" text="dark" className="rounded-pill">
                {employeeFields.filter((e) => e.selectedId !== null).length}{" "}
                added
              </Badge>
            </div>

            {employeeFields.map((field, index) => (
              <div key={index} className="mb-3 position-relative">
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="text"
                    placeholder={`Employee ID or name #${index + 1}`}
                    value={field.value}
                    onChange={(e) =>
                      handleEmployeeChange(index, e.target.value)
                    }
                    autoComplete="off"
                    className="flex-grow-1"
                  />
                  <Button
                    variant="outline-danger"
                    onClick={() => removeEmployeeField(index)}
                    className="ms-2"
                    disabled={employeeFields.length <= 1}
                  >
                    <XCircle />
                  </Button>
                </div>

                {/* Suggestion dropdown */}
                {field.suggestions.length > 0 && (
                  <ListGroup
                    className="position-absolute w-100 shadow zindex-tooltip"
                    style={{ zIndex: 999 }}
                  >
                    {field.suggestions.slice(0, 5).map((emp) => (
                      <ListGroup.Item
                        key={emp.id}
                        action
                        onClick={() => selectSuggestion(index, emp)}
                      >
                        {emp.id} - {emp.first_name} {emp.last_name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            ))}

            <Button
              variant="outline-primary"
              onClick={addEmployeeField}
              className="w-100 mt-2 d-flex align-items-center justify-content-center"
            >
              <PlusCircle className="me-2" />
              Add Employee
            </Button>
          </div>

          {response && (
            <Alert
              variant={response.success ? "success" : "danger"}
              className="d-flex align-items-center"
            >
              {response.success ? (
                <CheckCircle className="me-2 flex-shrink-0" size={20} />
              ) : (
                <X className="me-2 flex-shrink-0" size={20} />
              )}
              <div>
                <Alert.Heading className="h6 mb-1">
                  {response.success ? "Success!" : "Error!"}
                </Alert.Heading>
                <p className="mb-0 small">{response.message}</p>
              </div>
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default GroupCreateModal;
