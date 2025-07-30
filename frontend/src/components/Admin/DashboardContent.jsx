import React from "react";
import { Button, Row, Col, Card } from "react-bootstrap";
import {
  PeopleFill,
  FolderFill,
  GearFill,
  PersonPlusFill,
  PlusCircleFill,
} from "react-bootstrap-icons";

const DashboardContent = ({ setShowEmployeeModal, setShowGroupModal }) => {
  return (
    <div>
      <h2 className="mb-4">Admin Dashboard</h2>
      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <Button
                variant="primary"
                className="me-3 mb-2 d-flex align-items-center"
                onClick={() => setShowEmployeeModal(true)}
              >
                <PersonPlusFill className="me-2" /> Register Employee
              </Button>
              <Button
                variant="success"
                className="d-flex align-items-center"
                onClick={() => setShowGroupModal(true)}
              >
                <PlusCircleFill className="me-2" /> Create Group
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>System Overview</Card.Title>
              <Card.Text>
                Welcome back, Admin! You have full access to manage the system.
              </Card.Text>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <PeopleFill className="me-2" /> Manage Employees
                </li>
                <li className="mb-2">
                  <FolderFill className="me-2" /> View Reports
                </li>
                <li>
                  <GearFill className="me-2" /> System Settings
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardContent;