import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion as MotionDiv } from "framer-motion";
import CountUp from "react-countup";

const StatsSection = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const stats = [
    { value: 12500, label: "Happy Customers", suffix: "+" },
    { value: 3200, label: "Service Providers", suffix: "+" },
    { value: 98, label: "Success Rate", suffix: "%" },
    { value: 15, label: "Avg. Response Time", suffix: "min" },
  ];

  return (
    <section className="py-5 bg-primary text-white">
      <Container>
        <Row className="g-4">
          {stats.map((stat, index) => (
            <Col md={3} sm={6} key={index}>
              <MotionDiv.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <h2 className="display-3 fw-bold mb-3">
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    suffix={stat.suffix}
                  />
                </h2>
                <p className="mb-0 text-white-50">{stat.label}</p>
              </MotionDiv.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default StatsSection;
