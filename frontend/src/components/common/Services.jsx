import React from 'react';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs, ListGroup } from 'react-bootstrap';
import { 
  WrenchIcon,
  BoltIcon,
  FireIcon,
  SunIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { motion as MotionDiv } from 'framer-motion';

const Services = () => {
  const iconStyle = { width: "20px", height: "20px", color: "#0d6efd" };
  const smallIconStyle = { width: "18px", height: "18px", color: "green", marginRight: "10px" };
  const processIconStyle = { width: "30px", height: "30px", color: "#0d6efd" };

  const services = [
    {
      id: 'plumbing',
      title: 'Plumbing Services',
      icon: <WrenchIcon style={iconStyle} />,
      description: 'Comprehensive plumbing solutions for homes and businesses',
      features: [
        '24/7 emergency plumbing',
        'Pipe repair & replacement',
        'Drain cleaning',
        'Water heater installation',
        'Fixture installation'
      ],
      popular: true
    },
    {
      id: 'electrical',
      title: 'Electrical Services',
      icon: <BoltIcon style={iconStyle} />,
      description: 'Safe and reliable electrical work by certified professionals',
      features: [
        'Electrical panel upgrades',
        'Lighting installation',
        'Outlet & switch repair',
        'Whole-home rewiring',
        'Generator installation'
      ],
      popular: false
    },
    {
      id: 'hvac',
      title: 'HVAC Services',
      icon: <FireIcon style={iconStyle} />,
      description: 'Heating, ventilation and air conditioning solutions',
      features: [
        'AC installation & repair',
        'Furnace maintenance',
        'Duct cleaning',
        'Thermostat installation',
        'Indoor air quality'
      ],
      popular: true
    },
    {
      id: 'handyman',
      title: 'Handyman Services',
      icon: <SunIcon style={iconStyle} />,
      description: 'All-around home maintenance and repairs',
      features: [
        'Drywall repair',
        'Painting',
        'Furniture assembly',
        'Shelving installation',
        'Door/window repair'
      ],
      popular: false
    },
    {
      id: 'cleaning',
      title: 'Professional Cleaning',
      icon: <SparklesIcon style={iconStyle} />,
      description: 'Deep cleaning services for residential and commercial',
      features: [
        'Move-in/move-out cleaning',
        'Carpet cleaning',
        'Window washing',
        'Pressure washing',
        'Disinfection services'
      ],
      popular: false
    },
    {
      id: 'maintenance',
      title: 'Preventive Maintenance',
      icon: <ShieldCheckIcon style={iconStyle} />,
      description: 'Keep your systems running smoothly year-round',
      features: [
        'Seasonal HVAC checkups',
        'Plumbing inspections',
        'Electrical safety checks',
        'Gutter cleaning',
        'Appliance maintenance'
      ],
      popular: true
    }
  ];

  const servicePackages = [
    {
      name: "Basic",
      price: "$99",
      period: "per service",
      features: [
        "Standard service call",
        "1-hour minimum",
        "Diagnostic included",
        "Parts not included",
        "Weekday service only"
      ],
      recommended: false
    },
    {
      name: "Premium",
      price: "$249",
      period: "per month",
      features: [
        "Priority scheduling",
        "2 service calls/month",
        "15% discount on parts",
        "Emergency service",
        "24/7 availability"
      ],
      recommended: true
    },
    {
      name: "Elite",
      price: "$499",
      period: "per month",
      features: [
        "Unlimited service calls",
        "25% discount on parts",
        "Dedicated technician",
        "Annual system review",
        "Full home inspection"
      ],
      recommended: false
    }
  ];

  return (
    <MotionDiv.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="py-5">
        {/* Hero Section */}
        <Row className="align-items-center mb-5">
          <Col lg={6}>
            <Badge bg="primary" className="mb-3">Quality Services Since 203</Badge>
            <h1 className="display-5 fw-bold mb-4">Professional Services for Your Home & Business</h1>
            <p className="lead mb-4">
              We deliver exceptional service with certified professionals, transparent pricing, 
              and a 30% satisfaction guarantee.
            </p>
            <Button variant="primary" size="lg" className="me-3">Book a Service</Button>
            <Button variant="outline-primary" size="lg">Request Estimate</Button>
          </Col>
          <Col lg={6}>
            <img 
              src="/src/assets/many-different-professions-collage-happy-600nw-2453357543.webp" 
              alt="Our services" 
              className="img-fluid rounded shadow"
            />
          </Col>
        </Row>

        {/* Services Tabs */}
        <div className="mb-5">
          <h2 className="text-center mb-4">Our Services</h2>
          <p className="text-center text-muted mb-5">
            Comprehensive solutions for all your home service needs
          </p>
          
          <Tabs
              defaultActiveKey="all"
              id="services-tabs"
              className="mb-4 justify-content-center"
              fill
            >
                <Tab
                  eventKey="all"
                  title={<span style={{ color: "black" }}>All Services</span>}
                />
                <Tab
                  eventKey="popular"
                  title={<span style={{ color: "black" }}>Most Popular</span>}
                />
                <Tab
                  eventKey="emergency"
                  title={<span style={{ color: "black" }}>Emergency Services</span>}
                />
            </Tabs>
          <Row className="g-4">
            {services.map((service, index) => (
              <Col key={index} md={6} lg={4}>
                <MotionDiv.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-30 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="bg-light rounded-circle p-3">
                          {service.icon}
                        </div>
                        {service.popular && (
                          <Badge bg="warning" text="dark">Popular</Badge>
                        )}
                      </div>
                      <h4 className="mb-3">{service.title}</h4>
                      <p className="text-muted mb-4">{service.description}</p>
                      <ListGroup variant="flush" className="mb-4">
                        {service.features.map((feature, i) => (
                          <ListGroup.Item key={i} className="border-0 px-0 py-1">
                            <div className="d-flex align-items-center">
                              <CheckCircleIcon style={smallIconStyle} />
                              <span>{feature}</span>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                      <Button variant="outline-primary" className="w-30">Learn More</Button>
                    </Card.Body>
                  </Card>
                </MotionDiv.div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Service Process */}
        <Row className="py-5 my-5 bg-light rounded-3">
          <Col lg={12} className="text-center mb-5">
            <h2>Our Simple Service Process</h2>
            <p className="text-muted">How we deliver exceptional service every time</p>
          </Col>
          {[
            {
              title: "Schedule Your Service",
              description: "Book online or call us to schedule a convenient time",
              icon: <ClipboardDocumentCheckIcon style={processIconStyle} />
            },
            {
              title: "Expert Technician Arrives",
              description: "Our certified professional will arrive on time",
              icon: <WrenchIcon style={processIconStyle} />
            },
            {
              title: "Diagnosis & Estimate",
              description: "We assess the issue and provide transparent pricing",
              icon: <ShieldCheckIcon style={processIconStyle} />
            },
            {
              title: "Service Completed",
              description: "We complete the job to your satisfaction",
              icon: <CheckCircleIcon style={processIconStyle} />
            }
          ].map((step, index) => (
            <Col key={index} md={6} lg={3}>
              <div className="text-center p-3">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>
                  {step.icon}
                </div>
                <h5 className="mb-2">{step.title}</h5>
                <p className="text-muted mb-0">{step.description}</p>
              </div>
            </Col>
          ))}
        </Row>

        {/* Pricing Section */}
        <div className="py-5">
          <h2 className="text-center mb-4">Service Packages</h2>
          <p className="text-center text-muted mb-5">
            Choose the plan that fits your needs
          </p>
          
          <Row className="g-4">
            {servicePackages.map((pkg, index) => (
              <Col key={index} md={6} lg={4}>
                <MotionDiv.div
                  whileHover={{ scale: pkg.recommended ? 1.03 : 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`h-30 border-0 shadow-sm ${pkg.recommended ? 'border-primary border-2' : ''}`}>
                    {pkg.recommended && (
                      <div className="bg-primary text-white text-center py-2">
                        <strong>Recommended</strong>
                      </div>
                    )}
                    <Card.Body className="p-4 text-center">
                      <h4 className="mb-3">{pkg.name}</h4>
                      <h2 className="mb-1">{pkg.price}</h2>
                      <p className="text-muted mb-4">{pkg.period}</p>
                      <ListGroup variant="flush" className="mb-4 text-start">
                        {pkg.features.map((feature, i) => (
                          <ListGroup.Item key={i} className="border-0 px-0 py-2">
                            <div className="d-flex align-items-center">
                              <CheckCircleIcon style={smallIconStyle} />
                              <span>{feature}</span>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                      <Button 
                        variant={pkg.recommended ? "primary" : "outline-primary"} 
                        className="w-30"
                      >
                        Get Started
                      </Button>
                    </Card.Body>
                  </Card>
                </MotionDiv.div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Call to Action */}
        <Card className="bg-primary text-white shadow border-0 mt-5">
          <Card.Body className="p-5">
            <Row className="align-items-center">
              <Col lg={8}>
                <h2 className="mb-3">Ready to Experience Exceptional Service?</h2>
                <p className="mb-0 lead">
                  Contact us today for a free estimate or to schedule your service appointment.
                </p>
              </Col>
              <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
                <Button variant="light" size="lg" className="me-2">Call Now</Button>
                <Button variant="outline-light" size="lg">Email Us</Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </MotionDiv.div>
  );
};

export default Services;
