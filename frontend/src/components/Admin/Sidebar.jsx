import React, { useState } from "react";
import { Nav, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import {
  GearFill,
  PeopleFill,
  FolderFill,
  HouseFill,
  CashStack,
  Building,
  ArrowRightShort,
  ArrowLeftShort,
} from "react-bootstrap-icons";
import "../../assets/css/Sidebar.css";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { id: "dashboard", icon: HouseFill, label: "Dashboard" },
    { id: "employees", icon: PeopleFill, label: "Employees" },
    { id: "groups", icon: FolderFill, label: "Groups" },
    { id: "departments", icon: Building, label: "Departments" },
    { id: "tasks", icon: FolderFill, label: "Tasks" },
    { id: "settings", icon: GearFill, label: "Settings" },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const renderTooltip = (label) => (
    <Tooltip id={`tooltip-${label}`}>{label}</Tooltip>
  );

  return (
    <Col
      md={collapsed ? 1 : 3}
      lg={collapsed ? 1 : 2}
      className={`sidebar px-0 ${collapsed ? "collapsed" : ""}`}
    >
      <div className="sidebar-header p-3 d-flex justify-content-between align-items-center">
        {!collapsed && <h4 className="text-white mb-0">Admin Panel</h4>}
        <button
          onClick={toggleSidebar}
          className="toggle-btn bg-transparent border-0 text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ArrowRightShort size={20} />
          ) : (
            <ArrowLeftShort size={20} />
          )}
        </button>
      </div>

      <Nav variant="pills" className="flex-column">
        {navItems.map((item) => (
          <Nav.Item key={item.id}>
            <OverlayTrigger
              placement="right"
              overlay={renderTooltip(item.label)}
              show={collapsed && hoveredItem === item.id ? true : false}
            >
              <Nav.Link
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                className="d-flex align-items-center"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <item.icon className={`me-2 ${collapsed ? "mx-auto" : ""}`} />
                {!collapsed && item.label}
                {activeTab === item.id && !collapsed && (
                  <span className="active-indicator"></span>
                )}
              </Nav.Link>
            </OverlayTrigger>
          </Nav.Item>
        ))}
      </Nav>

      {!collapsed && (
        <div className="sidebar-footer p-3 text-center text-muted small">
          v2.4.1 • {new Date().getFullYear()}
        </div>
      )}
    </Col>
  );
};

export default Sidebar;