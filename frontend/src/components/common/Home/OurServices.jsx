import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { motion as MotionDiv } from "framer-motion";

const OurServices = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const services = [
    {
      title: "Home Services",
      icon: "🏠",
      description:
        "Plumbing, electrical, cleaning, and all your home maintenance needs",
      color: "#4e73df",
    },
    {
      title: "Professional Services",
      icon: "👔",
      description:
        "Legal, accounting, tutoring, and other professional services",
      color: "#1cc88a",
    },
    {
      title: "Health & Wellness",
      icon: "💆",
      description: "Massage therapy, personal training, and wellness services",
      color: "#f6c23e",
    },
    {
      title: "Tech Support",
      icon: "💻",
      description: "Device repair, IT support, and smart home installations",
      color: "#e74a3b",
    },
  ];

  return (
    <section className="py-5 bg-white">
      <Container>
        <MotionDiv.div
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true }}
        >
          <h2 className="text-center mb-5 display-5 fw-semibold">
            Our <span className="text-primary">Services</span>
          </h2>
          <p className="text-center text-muted mb-5 lead">
            Comprehensive solutions for all your local service needs
          </p>
        </MotionDiv.div>

        <Row className="g-4">
          {services.map((service, index) => (
            <Col md={3} key={index}>
              <MotionDiv.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-100 border-0 rounded-4 shadow-sm hover-shadow-lg transition-all">
                  <Card.Body className="p-4 text-center">
                    <div
                      className="rounded-circle p-3 mb-3 mx-auto"
                      style={{
                        width: "70px",
                        height: "70px",
                        background: `${service.color}20`,
                        color: service.color,
                        fontSize: "30px",
                      }}
                    >
                      {service.icon}
                    </div>
                    <h4 className="mb-3">{service.title}</h4>
                    <p className="text-muted mb-0">{service.description}</p>
                  </Card.Body>
                </Card>
              </MotionDiv.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default OurServices;
