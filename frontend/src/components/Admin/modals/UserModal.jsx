import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaUserTag } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserModal = ({ show, handleClose, user = null }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'customer',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const BASE_URL = import.meta.env.VITE_API_URL;
  const isEditing = !!user;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!isEditing && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = isEditing 
        ? `${BASE_URL}backend/api/admin/users.php`
        : `${BASE_URL}backend/api/admin/users.php`;
      
      const method = isEditing ? 'PUT' : 'POST';
      const data = {
        ...formData,
        id: user?.id
      };

      // Remove confirmPassword from data
      delete data.confirmPassword;
      
      // Don't send empty password for updates
      if (isEditing && !data.password) {
        delete data.password;
      }

      const response = await axios({
        method,
        url,
        data,
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(`User ${isEditing ? 'updated' : 'created'} successfully`);
        handleClose();
        // Reset form
        setFormData({
          name: '',
          email: '',
          role: 'customer',
          password: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.data.message || `Failed to ${isEditing ? 'update' : 'create'} user`);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'customer',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} size="md">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUser className="me-2" />
          {isEditing ? 'Edit User' : 'Add New User'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <Form.Label>
              <FaUser className="me-2" />
              Full Name
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              isInvalid={!!errors.name}
              placeholder="Enter full name"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </div>

          <div className="mb-3">
            <Form.Label>
              <FaEnvelope className="me-2" />
              Email Address
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              isInvalid={!!errors.email}
              placeholder="Enter email address"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </div>

          <div className="mb-3">
            <Form.Label>
              <FaUserTag className="me-2" />
              Role
            </Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="customer">Customer</option>
              <option value="worker">Worker</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </div>

          <div className="mb-3">
            <Form.Label>
              <FaLock className="me-2" />
              {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              isInvalid={!!errors.password}
              placeholder={isEditing ? "Enter new password" : "Enter password"}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </div>

          {!isEditing && (
            <div className="mb-3">
              <Form.Label>
                <FaLock className="me-2" />
                Confirm Password
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                isInvalid={!!errors.confirmPassword}
                placeholder="Confirm password"
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              Please fix the errors above before submitting.
            </Alert>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
