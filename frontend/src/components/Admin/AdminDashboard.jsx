import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import EmployeesContent from "./EmployeesContent";
import GroupsContent from "./GroupsContent";
import SettingsContent from "./SettingsContent";
import DepartmentsContent from "./DepartmentsContent";
import TaskContext from "./TaskContext";
import WorkerRegistrationModal from "../../pages/Workers/WorkerRegistrationModal";
import GroupCreateModal from "../../pages/Groups/GroupCreateModal";
import GroupEditModal from "../../pages/Groups/GroupEditModal";
import DepartmentCreateModal from "../../pages/Departments/DepartmentCreateModal";
import DepartmentEditModal from "../../pages/Departments/DepartmentEditModal";
// import TaskAssignment from "../../pages/Tasks/TaskAssignment";
import "../../assets/css/AdminDashboard.css";

import ErrorBoundary from "../ErrorBoundary";

const AdminDashboard = () => {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editModalShow, setEditModalShow] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptEditModal, setDeptEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchGroups = () => {
    setLoadingGroups(true);
    axios
      .get(`${BASE_URL}backend/api/groups/view.php`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setGroups(res.data.groups);
        } else {
          console.error("Failed to fetch groups:", res.data.message);
        }
        setLoadingGroups(false);
      })
      .catch((err) => {
        console.error("Error fetching groups:", err);
        setLoadingGroups(false);
      });
  };

  const fetchDepartments = () => {
    setLoadingDepartments(true);
    axios
      .get(`${BASE_URL}backend/api/department/fetctDepartment.php`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setDepartments(res.data.departments);
        } else {
          console.error("Failed to fetch departments:", res.data.message);
        }
        setLoadingDepartments(false);
      })
      .catch((err) => {
        console.error("Error fetching departments:", err);
        setLoadingDepartments(false);
      });
  };

  useEffect(() => {
    fetchGroups();
    fetchDepartments();
  }, []);

  const handleDeleteGroup = async (id) => {
    if (!window.confirm("Are you sure to delete this group?")) return;

    try {
      const res = await axios.post(
        `${BASE_URL}backend/api/groups/delete.php`,
        {
          group_id: id,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const updated = groups.filter((group) => group.group_id !== id);
        setGroups(updated);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Are you sure to delete this department?")) return;

    try {
      const res = await axios.post(
        `${BASE_URL}backend/api/department/delete.php`,
        {
          id,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const updated = departments.filter((dept) => dept.id !== id);
        setDepartments(updated);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <Container fluid className="admin-dashboard">
      <Row>
        <ErrorBoundary>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </ErrorBoundary>

        <Col md={9} lg={10} className="main-content p-4">
          {activeTab === "dashboard" && (
            <DashboardContent
              setShowEmployeeModal={setShowEmployeeModal}
              setShowGroupModal={setShowGroupModal}
            />
          )}

          {activeTab === "employees" && (
            <EmployeesContent setShowEmployeeModal={setShowEmployeeModal} />
          )}

          {activeTab === "groups" && (
            <GroupsContent
              groups={groups}
              loadingGroups={loadingGroups}
              setShowGroupModal={setShowGroupModal}
              setSelectedGroup={setSelectedGroup}
              setEditModalShow={setEditModalShow}
              handleDeleteGroup={handleDeleteGroup}
            />
          )}

          {activeTab === "departments" && (
            <DepartmentsContent
              departments={departments}
              loading={loadingDepartments}
              setShowCreateModal={setShowDeptModal}
              setEditModalShow={setDeptEditModal}
              setSelectedDept={setSelectedDept}
              handleDelete={handleDeleteDepartment}
            />
          )}

          {activeTab === "payroll" && <PayrollContent />}
          {activeTab === "tasks" && <TaskContext />}
          {activeTab === "settings" && <SettingsContent />}

          <WorkerRegistrationModal
            show={showEmployeeModal}
            handleClose={() => setShowEmployeeModal(false)}
          />
          <GroupCreateModal
            show={showGroupModal}
            handleClose={() => setShowGroupModal(false)}
          />
          {selectedGroup && (
            <GroupEditModal
              show={editModalShow}
              handleClose={() => setEditModalShow(false)}
              groupData={selectedGroup}
              refreshGroups={fetchGroups}
            />
          )}
          <DepartmentCreateModal
            show={showDeptModal}
            handleClose={() => setShowDeptModal(false)}
            refreshDepartments={fetchDepartments}
          />
          {selectedDept && (
            <DepartmentEditModal
              show={deptEditModal}
              handleClose={() => setDeptEditModal(false)}
              departmentData={selectedDept}
              refreshDepartments={fetchDepartments}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
