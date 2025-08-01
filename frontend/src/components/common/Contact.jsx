import React from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { motion as MotionDiv } from 'framer-motion';

const Contact = () => {
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
      phone: Yup.string().matches(/^[0-9]+$/, 'Must be only digits').min(10, 'Must be at least 10 digits'),
      service: Yup.string().required('Please select a service'),
      message: Yup.string().required('Please enter your message').min(10, 'Message must be at least 10 characters')
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await axios.post('/api/contact', values);
        alert('Thank you for your message! We will get back to you soon.');
        resetForm();
      } catch (error) {
        alert('There was an error submitting your message. Please try again later.' +error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const services = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Landscaping',
    'Cleaning',
    'Handyman Services',
    'Pest Control'
  ];

  return (
    <MotionDiv.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="py-5">
        <h1 className="text-center mb-5">Contact Us</h1>
        
        <Row className="g-4">
          <Col lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h2 className="mb-4">Get in Touch</h2>
                <p className="mb-4">
                  Have questions about our services or need to schedule an appointment? 
                  Fill out the form and we'll get back to you as soon as possible.
                </p>
                
                <Form onSubmit={formik.handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.name}
                      isInvalid={formik.touched.name && !!formik.errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      isInvalid={formik.touched.email && !!formik.errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      placeholder="(123) 456-7890"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.phone}
                      isInvalid={formik.touched.phone && !!formik.errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Service Needed</Form.Label>
                    <Form.Select
                      name="service"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.service}
                      isInvalid={formik.touched.service && !!formik.errors.service}
                    >
                      <option value="">Select a service</option>
                      {services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.service}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="message"
                      placeholder="Tell us about your needs..."
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.message}
                      isInvalid={formik.touched.message && !!formik.errors.message}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h2 className="mb-4">Contact Information</h2>
                <p className="mb-4">
                  We're here to help you with all your service needs. 
                  Reach out to us through any of these channels.
                </p>
                
                <div className="d-flex align-items-start mb-4">
                  <div className="me-3 text-primary">
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="mb-1">Phone</h5>
                    <p className="mb-0">(123) 456-7890</p>
                    <small className="text-muted">Mon-Fri, 8am-6pm</small>
                  </div>
                </div>
                
                <div className="d-flex align-items-start mb-4">
                  <div className="me-3 text-primary">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="mb-1">Email</h5>
                    <p className="mb-0">contact@localservice.com</p>
                    <small className="text-muted">Response within 24 hours</small>
                  </div>
                </div>
                
                <div className="d-flex align-items-start mb-4">
                  <div className="me-3 text-primary">
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="mb-1">Office</h5>
                    <p className="mb-0">123 Service Street</p>
                    <p className="mb-0">Your City, ST 12345</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-start">
                  <div className="me-3 text-primary">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="mb-1">Business Hours</h5>
                    <p className="mb-1">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="mb-1">Saturday: 9:00 AM - 2:00 PM</p>
                    <p className="mb-0">Sunday: Closed</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5>Service Area</h5>
                  <p>We proudly serve the following areas:</p>
                  <ul className="row">
                    <li className="col-md-6">Your City</li>
                    <li className="col-md-6">Nearby Town</li>
                    <li className="col-md-6">Suburb A</li>
                    <li className="col-md-6">Suburb B</li>
                    <li className="col-md-6">County Area</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MotionDiv.div>
  );
};

export default Contact;