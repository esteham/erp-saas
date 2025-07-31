import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import WorkerContent from "./WorkerContent";
import GroupsContent from "./AreaContent";
import SettingsContent from "./SettingsContent";
import CategoryContent from "./CategoryContent";
import TaskContext from "./TaskContext";
import WorkerRegistrationModal from "../../pages/Workers/WorkerRegistrationModal";
import GroupCreateModal from "../../pages/Groups/GroupCreateModal";
import GroupEditModal from "../../pages/Groups/GroupEditModal";
import CategoryCreateModal from "../../pages/Categories/CategoryCreateModal";
import CategoryEditModal from "../../pages/Categories/CategoryEditModal";
import AreaContent from "./AreaContent";
import "../../assets/css/AdminDashboard.css";

import ErrorBoundary from "../ErrorBoundary";

const AdminDashboard = () => {
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editModalShow, setEditModalShow] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryEditModal, setCategoryEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  const fetchCategories = () => {
    setLoadingCategories(true);
    axios
      .get(`${BASE_URL}backend/api/categories/fetchCategory.php`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.categories);
        } else {
          console.error("Failed to fetch categories:", res.data.message);
        }
        setLoadingCategories(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoadingCategories(false);
      });
  };

  useEffect(() => {
    fetchGroups();
    fetchCategories();
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

  //Category delete final
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure to delete this category?")) return;

    try {
      const res = await axios.post(
        `${BASE_URL}backend/api/categories/delete.php`,
        { id },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Delete Response:", res.data);

      if (res.data.success) {
        const updated = categories.filter((cat) => cat.id !== id);
        setCategories(updated);
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
              setShowWorkerModal={setShowWorkerModal}
              setShowGroupModal={setShowGroupModal}
            />
          )}

          {activeTab === "workers" && (
            <WorkerContent setShowWorkerModal={setShowWorkerModal} />
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

          {activeTab === "category" && (
            <CategoryContent
              categories={categories}
              loading={loadingCategories}
              setShowCreateModal={setShowCategoryModal}
              setEditModalShow={setCategoryEditModal}
              setSelectedcat={setSelectedCategory} 
              handleDelete={handleDeleteCategory}
            />
          )}

          {activeTab === "area" && <AreaContent />}
          {activeTab === "tasks" && <TaskContext />}
          {activeTab === "settings" && <SettingsContent />}

          <WorkerRegistrationModal
            show={showWorkerModal}
            handleClose={() => setShowWorkerModal(false)}
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
          <CategoryCreateModal
            show={showCategoryModal}
            handleClose={() => setShowCategoryModal(false)}
            refreshCategories={fetchCategories}
          />
          {selectedCategory && (
            <CategoryEditModal
              show={categoryEditModal}
              handleClose={() => setCategoryEditModal(false)}
              categoryData={selectedCategory}
              refreshCategories={fetchCategories}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
