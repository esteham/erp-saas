import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { motion as MotionDiv } from "framer-motion";

const OurClients = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      quote: "Found a plumber within 15 minutes who fixed my leak at a fair price. Amazing service!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Small Business Owner",
      quote: "The dynamic pricing saved me 30% on regular cleaning services. Highly recommend!",
      rating: 5
    },
    {
      name: "David Wilson",
      role: "Property Manager",
      quote: "Managed to get last-minute repairs done for multiple properties efficiently.",
      rating: 4
    }
  ];

  return (
    <section className="py-5 bg-light">
      <Container>
        <MotionDiv.div
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true }}
        >
          <h2 className="text-center mb-5 display-5 fw-semibold">
            What Our <span className="text-primary">Clients Say</span>
          </h2>
        </MotionDiv.div>

        <Row className="g-4">
          {testimonials.map((testimonial, index) => (
            <Col md={4} key={index}>
              <MotionDiv.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-100 border-0 rounded-4 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-warning">★</span>
                      ))}
                    </div>
                    <blockquote className="mb-4">
                      <p className="lead font-italic">"{testimonial.quote}"</p>
                    </blockquote>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                        <span className="text-primary fw-bold">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h6 className="mb-0">{testimonial.name}</h6>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                    </div>
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

export default OurClients;