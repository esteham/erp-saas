import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  InputGroup,
  Table,
  Modal,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { PersonPlusFill } from "react-bootstrap-icons";
import axios from "axios";
import * as XLSX from "xlsx";

const EmployeesContent = ({ setShowEmployeeModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsModalShow, setDetailsModalShow] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [deptEmployeeCount, setDeptEmployeeCount] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}backend/api/employees/view.php`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setEmployees(res.data.employees);
        } else {
          alert("Failed to fetch employees.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure to delete this employee?")) return;

    axios
      .post(
        `${BASE_URL}backend/api/employees/delete.php`,
        { id },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.data.success) {
          setEmployees((prev) => prev.filter((e) => e.id !== id));
        } else {
          alert(res.data.message);
        }
      });
  };

  const fetchDepartments = () => {
    axios
      .get(`${BASE_URL}backend/api/department/fetctDepartment.php`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      });
  };

  // When a department is selected, fetch employees for that department
  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setSelectedDept(deptId);
    if (!deptId) {
      setDeptEmployeeCount(null);
      fetchEmployees();
      return;
    }

    setLoading(true);
    axios
      .post(
        `${BASE_URL}backend/api/employees/count_by_department.php`,
        { department_id: deptId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.data.success) {
          setEmployees(res.data.employees);
          setDeptEmployeeCount(res.data.employees.length);
        } else {
          setEmployees([]);
          setDeptEmployeeCount(0);
        }
        setLoading(false);
      })
      .catch(() => {
        setEmployees([]);
        setDeptEmployeeCount(0);
        setLoading(false);
      });
  };

  // search filter
  const filteredEmployees = employees.filter(
    (e) =>
      e.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toString().includes(searchTerm)
  );

  // pagination slicing only if department not selected
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = selectedDept
    ? filteredEmployees
    : filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Excel download function
  const downloadExcel = () => {
    const deptName =
      departments.find((d) => d.id == selectedDept)?.name || "Unknown";

    // Header + Sub-header
    const rows = [
      ["Employee List"],
      [`Department: ${deptName}`],
      [],
      ["ID", "Name", "Email", "Phone Number"],
      ...filteredEmployees.map((emp) => [
        emp.id,
        `${emp.first_name} ${emp.last_name}`,
        emp.email,
        emp.phone || "",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Auto width set
    const colWidths = rows[3].map((_, colIndex) => {
      const maxLen = rows.reduce((max, row) => {
        const val = row[colIndex];
        const len = val ? val.toString().length : 0;
        return Math.max(max, len);
      }, 0);
      return { wch: maxLen + 2 };
    });
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    XLSX.writeFile(wb, `Employees_${deptName.replace(/\s+/g, "_")}.xlsx`);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Employee Management</h2>
        <Button
          variant="primary"
          onClick={() => setShowEmployeeModal(true)}
          className="d-flex align-items-center"
        >
          <PersonPlusFill className="me-2" /> Add Employee
        </Button>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <Form.Group controlId="departmentSelect">
            <Form.Label>Select Department</Form.Label>
            <Form.Select value={selectedDept} onChange={handleDepartmentChange}>
              <option value="">-- Select Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <div className="col-md-6 d-flex align-items-end">
          <InputGroup>
            <Form.Control
              placeholder="Search by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      {selectedDept && (
        <div className="mb-3">
          <p>
            <strong>Total Employees:</strong> {deptEmployeeCount ?? 0}
          </p>
          <Button
            onClick={downloadExcel}
            variant="success"
            size="sm"
            className="mb-3"
          >
            Download Excel
          </Button>
          {loading ? (
            <Spinner animation="border" />
          ) : (
            // শুধু নামের list দেখানো হচ্ছে department select হলে
            <ul>
              {filteredEmployees.map((emp) => (
                <li key={emp.id}>
                  {emp.first_name} {emp.last_name} - {emp.email}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!selectedDept && (
        <Card>
          <Card.Body>
            {loading ? (
              <Spinner animation="border" />
            ) : (
              <>
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEmployees.map((e) => (
                      <tr key={e.id}>
                        <td>{e.id}</td>
                        <td>
                          {e.first_name} {e.last_name}
                        </td>
                        <td>{e.email}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => {
                              setSelectedEmployee(e);
                              setDetailsModalShow(true);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(e.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Pagination */}
                <Pagination>
                  {[...Array(totalPages)].map((_, idx) => (
                    <Pagination.Item
                      key={idx}
                      active={idx + 1 === currentPage}
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Details Modal */}
      <Modal show={detailsModalShow} onHide={() => setDetailsModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <>
              <p>
                <strong>Name :</strong> {selectedEmployee.first_name}{" "}
                {selectedEmployee.last_name}
              </p>
              <p>
                <strong>Email :</strong> {selectedEmployee.email}
              </p>
              <p>
                <strong>Phone :</strong> {selectedEmployee.phone}
              </p>
              <p>
                <strong>Role :</strong> {selectedEmployee.user_role}
              </p>
              <p>
                <strong>Department:</strong> {selectedEmployee.department_name}
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeesContent;
