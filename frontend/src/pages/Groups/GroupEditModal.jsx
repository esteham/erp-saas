import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { Modal, Button, Form, FloatingLabel, Alert } from "react-bootstrap";
import { XCircle, PlusCircle, CheckCircle, X } from "react-bootstrap-icons";

const GroupEditModal = ({ show, handleClose, groupData, refreshGroups }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [employeeIds, setEmployeeIds] = useState([{ value: "", label: "" }]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [response, setResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (groupData) {
      setGroupName(groupData.group_name || "");
      setDescription(groupData.description || "");
      setEmployeeIds(
        groupData.members?.map((member) => ({
          value: member.id.toString(),
          label: `${member.first_name} ${member.last_name} (ID: ${member.id})`,
        })) || [{ value: "", label: "" }]
      );
    }
  }, [groupData]);

  useEffect(() => {
    // Fetch all employees
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}backend/api/employees/view.php`,
          { withCredentials: true }
        );
        if (res.data.success) {
          const options = res.data.employees.map((emp) => ({
            value: emp.id.toString(),
            label: `${emp.first_name} ${emp.last_name} (ID: ${emp.id})`,
          }));
          setAllEmployees(options);
        }
      } catch (err) {
        console.error("Failed to load employees:", err);
      }
    };
    fetchEmployees();
  }, [BASE_URL]);

  const handleEmployeeChange = (index, selected) => {
    const updated = [...employeeIds];
    updated[index] = selected;
    setEmployeeIds(updated);
  };

  const addEmployeeField = () => {
    setEmployeeIds([...employeeIds, { value: "", label: "" }]);
  };

  const removeEmployeeField = (index) => {
    if (employeeIds.length > 1) {
      const updated = [...employeeIds];
      updated.splice(index, 1);
      setEmployeeIds(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      group_id: groupData.group_id,
      group_name: groupName.trim(),
      description: description.trim(),
      employee_ids: employeeIds
        .filter((item) => item?.value)
        .map((item) => item.value),
    };

    try {
      const res = await axios.post(
        `${BASE_URL}backend/api/groups/edit.php`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setResponse(res.data);
      if (res.data.success) {
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

  const resetForm = () => {
    setGroupName("");
    setDescription("");
    setEmployeeIds([{ value: "", label: "" }]);
    setResponse(null);
  };

  const handleModalClose = () => {
    resetForm();
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h5 fw-bold">Edit Group</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <FloatingLabel controlId="groupName" label="Group Name" className="mb-3">
            <Form.Control
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              autoFocus
            />
          </FloatingLabel>

          <FloatingLabel controlId="description" label="Description" className="mb-3">
            <Form.Control
              as="textarea"
              placeholder="Enter description"
              style={{ height: "100px" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FloatingLabel>

          <div className="mb-3">
            <Form.Label className="fw-semibold">Employees</Form.Label>
            {employeeIds.map((selected, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <div style={{ flexGrow: 1 }}>
                  <Select
                    options={allEmployees}
                    value={selected}
                    onChange={(selectedOption) => handleEmployeeChange(index, selectedOption)}
                    placeholder={`Select employee #${index + 1}`}
                    isClearable
                  />
                </div>
                <Button
                  variant="outline-danger"
                  onClick={() => removeEmployeeField(index)}
                  className="ms-2"
                  disabled={employeeIds.length <= 1}
                >
                  <XCircle />
                </Button>
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
              {response.success ? <CheckCircle className="me-2" /> : <X className="me-2" />}
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
              {isSubmitting ? "Updating..." : "Update Group"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default GroupEditModal;