import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4">
      <Container>
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <h5 className="fw-bold text-primary">Hyper Local Services</h5>
            <p className="text-muted small">
              Connecting communities with reliable, on-demand services in real
              time.
            </p>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-uppercase fw-bold">Quick Links</h6>
            <ul className="list-unstyled small">
              <li>
                <Link to="/" className="text-decoration-none text-light">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-decoration-none text-light">
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-decoration-none text-light"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-decoration-none text-light">
                  About Us
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={4} className="mb-3">
            <h6 className="text-uppercase fw-bold">Contact Us</h6>
            <p className="text-muted small mb-1">
              Email: support@hyperlocal.com
            </p>
            <p className="text-muted small">Phone: +880 1234-567890</p>
          </Col>
        </Row>

        <hr className="border-secondary" />

        <Row>
          <Col className="text-center">
            <p className="text-muted small mb-0">
              &copy; {new Date().getFullYear()} Hyper Local Services. All rights
              reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
