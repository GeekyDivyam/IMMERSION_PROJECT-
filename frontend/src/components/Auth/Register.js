import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    phone: '',
    address: ''
  });
  const [validated, setValidated] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  
  const { register, loading, error } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clean phone number input - only allow digits
    if (name === 'phone') {
      const cleanedPhone = value.replace(/\D/g, ''); // Remove non-digits
      setFormData({
        ...formData,
        [name]: cleanedPhone
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Check password match
    if (name === 'confirmPassword' || name === 'password') {
      const password = name === 'password' ? value : formData.password;
      const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
      setPasswordMatch(password === confirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Check if phone number is valid (if provided)
    const isPhoneValid = !formData.phone || formData.phone.length === 0 || formData.phone.length === 10;

    if (form.checkValidity() === false || !passwordMatch || !isPhoneValid) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    const { confirmPassword, ...userData } = formData;

    // Remove empty phone field to avoid validation issues
    if (!userData.phone || userData.phone.length === 0) {
      delete userData.phone;
    }

    await register(userData);
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="text-primary">📚 E-Library</h2>
                <h4>Register</h4>
                <p className="text-muted">Create your account to access the library.</p>
              </div>

              <div className="alert alert-info mb-3">
                <small>
                  <strong>📋 Registration Requirements:</strong><br/>
                  • Password: At least 6 characters<br/>
                  • Student ID: Use unique ID (e.g., STU100, STU200)<br/>
                  • Phone: Exactly 10 digits or leave empty
                </small>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        minLength={2}
                        placeholder="Enter your full name"
                      />
                      <Form.Control.Feedback type="invalid">
                        Name must be at least 2 characters long.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Student ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        required
                        placeholder="Enter your student ID (e.g., STU100)"
                      />
                      <Form.Control.Feedback type="invalid">
                        Student ID is required.
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Use a unique ID like STU100, STU200, etc. (STU001-STU003 are already taken)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid email address.
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        placeholder="Enter password"
                      />
                      <Form.Control.Feedback type="invalid">
                        Password must be at least 6 characters long.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        isInvalid={!passwordMatch && formData.confirmPassword}
                        placeholder="Confirm password"
                      />
                      <Form.Control.Feedback type="invalid">
                        Passwords do not match.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number (Optional)</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="Enter 10-digit phone number (e.g., 9876543210)"
                    isInvalid={formData.phone && formData.phone.length > 0 && formData.phone.length !== 10}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter exactly 10 digits (no spaces or special characters).
                  </Form.Control.Feedback>
                  {formData.phone && formData.phone.length > 0 && formData.phone.length !== 10 && (
                    <Form.Text className="text-danger">
                      Current length: {formData.phone.length}/10 digits
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    maxLength={200}
                    placeholder="Enter your address"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading || !passwordMatch}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Form>

              <div className="text-center">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary text-decoration-none">
                    Sign in here
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
