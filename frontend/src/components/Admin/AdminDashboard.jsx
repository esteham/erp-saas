import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import WorkerContent from "./WorkerContent";
import CategoryContent from "./CategoryContent";
import DivisionContent from "./DivisionContent";
import TaskContext from "./TaskContext";
import FinanceContent from "./FinanceContent";
import MessagesContent from "./MessagesContent";
import NotificationsContent from "./NotificationsContent";
import SettingsContent from "./SettingsContent";
import CategoryCreateModal from "../../pages/Categories/CategoryCreateModal";
import "../../assets/css/AdminDashboard.css";
import ErrorBoundary from "../ErrorBoundary";
import axios from "axios";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Category related states
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModalShow, setEditModalShow] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const refreshCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}backend/api/categories/fetch_category.php`);
      if (res.data.success) {
        setCategories(res.data.categories || []);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await axios.post(
        `${BASE_URL}backend/api/categories/delete.php`,
        { id },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        refreshCategories();
      } else {
        alert("Delete failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "category") {
      refreshCategories();
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "worker":
        return <WorkerContent />;
      case "category":
        return (
          <>
            <CategoryContent
              categories={categories}
              loading={loading}
              setShowCreateModal={setShowCreateModal}
              setEditModalShow={setEditModalShow}
              setSelectedcat={setSelectedCat}
              handleDelete={handleDeleteCategory}
            />
            <CategoryCreateModal
              show={showCreateModal}
              handleClose={() => setShowCreateModal(false)}
              refreshCategories={refreshCategories}
            />
            {/* আপনি চাইলে EditModal এখানেও বসাতে পারেন */}
          </>
        );
      case "division":
        return <DivisionContent />;
      case "tasks":
        return <TaskContext />;
      case "finance":
        return <FinanceContent />;
      case "messages":
        return <MessagesContent />;
      case "notifications":
        return <NotificationsContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return <h4>Invalid tab selected</h4>;
    }
  };

  return (
    <Container fluid className="admin-dashboard">
      <Row>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Col md={9} lg={10} className="main-content p-4">
          <ErrorBoundary>{renderContent()}</ErrorBoundary>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
