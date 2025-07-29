// frontend/src/components/common/Header.jsx
import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <Navbar  bg="primary" variant="dark" expand="lg" sticky="top"style={{ padding: "20px" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          🛠️ HyperLocal Services
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/services">Services</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            <Nav.Link as={Link} to="/contact">About</Nav.Link>
          </Nav>
          <Nav className="gap-2">
            <Link to="/login">
              <Button variant="outline-light" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="light" size="sm">Register</Button>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;