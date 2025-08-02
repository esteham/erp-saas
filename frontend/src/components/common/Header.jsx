import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = user && ["admin", "agent", "worker"].includes(user.role);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/AdminDashboard";
      case "agent":
        return "/AgentDashboard";
      case "worker":
        return "/WorkerDashboard";
      default:
        return "/";
    }
  };

  return (
    <Navbar className="header" variant="dark" expand="lg" sticky="top" >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
        HyperLocal Services
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          {!isLoggedIn && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/services">Services</Nav.Link>
              <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
            </Nav>
          )}

          <Nav className="ms-auto gap-2 align-items-center">
            {!isLoggedIn ? (
              <>
                <Link to="/LoginFetch">
                  <Button variant="outline-light" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="light" size="sm">Register</Button>
                </Link>
              </>
            ) : (
              <div className="dropdown">
                <Button
                  variant="light"
                  size="sm"
                  className="dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user.username}
                </Button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to={getDashboardPath()}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
