import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion as MotionDiv } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const footerLinks = [
    {
      title: "Company",
      links: [
        { name: "About Us", to: "/about" },
        { name: "Careers", to: "/careers" },
        { name: "Blog", to: "/blog" },
        { name: "Press", to: "/press" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", to: "/help" },
        { name: "Safety Center", to: "/safety" },
        { name: "Community Guidelines", to: "/guidelines" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of Service", to: "/terms" },
        { name: "Privacy Policy", to: "/privacy" },
        { name: "Cookie Policy", to: "/cookies" }
      ]
    }
  ];

  return (
    <footer className="bg-dark text-light pt-5 pb-3">
      <Container>
        <Row className="g-4 mb-4">
          {/* Brand Info */}
          <Col lg={4} md={6}>
            <MotionDiv.div
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              viewport={{ once: true }}
            >
              <div className="d-flex align-items-center mb-3">
                <span className="bg-primary rounded-circle p-2 me-2">
                  <span className="text-white fs-4">⚡</span>
                </span>
                <h4 className="fw-bold mb-0 text-primary">HyperLocal</h4>
              </div>
              <p className="text-muted mb-3">
                Revolutionizing local services with smart technology and community-driven solutions.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="text-light fs-5 hover-primary">
                  <FaFacebook />
                </a>
                <a href="#" className="text-light fs-5 hover-primary">
                  <FaTwitter />
                </a>
                <a href="#" className="text-light fs-5 hover-primary">
                  <FaInstagram />
                </a>
                <a href="#" className="text-light fs-5 hover-primary">
                  <FaLinkedin />
                </a>
              </div>
            </MotionDiv.div>
          </Col>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <Col lg={2} md={6} key={index}>
              <MotionDiv.div
                initial="hidden"
                whileInView="visible"
                variants={fadeIn}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h5 className="text-uppercase fw-bold fs-6 mb-3">{section.title}</h5>
                <ul className="list-unstyled">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex} className="mb-2">
                      <Link 
                        to={link.to} 
                        className="text-decoration-none text-light hover-primary d-inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </MotionDiv.div>
            </Col>
          ))}

          {/* Contact Info */}
          <Col lg={4} md={6}>
            <MotionDiv.div
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h5 className="text-uppercase fw-bold fs-6 mb-3">Contact Us</h5>
              <ul className="list-unstyled text-muted">
                <li className="mb-3 d-flex align-items-start">
                  <FaMapMarkerAlt className="text-primary mt-1 me-2" />
                  <span>123 Service Lane, Tech City, TC 10001</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <FaPhoneAlt className="text-primary mt-1 me-2" />
                  <span>+880 1234-567890</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <FaEnvelope className="text-primary mt-1 me-2" />
                  <span>support@hyperlocal.com</span>
                </li>
              </ul>

              <div className="mt-4">
                <h6 className="text-uppercase fw-bold fs-6 mb-3">Newsletter</h6>
                <div className="d-flex">
                  <input 
                    type="email" 
                    className="form-control rounded-start-pill bg-secondary border-0 text-white" 
                    placeholder="Your email" 
                  />
                  <button className="btn btn-primary rounded-end-pill px-3">
                    Subscribe
                  </button>
                </div>
              </div>
            </MotionDiv.div>
          </Col>
        </Row>

        <MotionDiv.div
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true }}
        >
          <hr className="border-secondary my-4" />
        </MotionDiv.div>

        <Row>
          <Col>
            <MotionDiv.div
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              viewport={{ once: true }}
            >
              <p className="text-center small mb-0">
                &copy; {new Date().getFullYear()} HyperLocal Services. All rights reserved.
              </p>
            </MotionDiv.div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;