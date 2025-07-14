import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-toastify';

const AddBook = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publishedYear: new Date().getFullYear(),
    category: '',
    description: '',
    totalCopies: 1,
    language: 'English',
    pages: '',
    location: {
      shelf: '',
      section: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 
    'Biography', 'Education', 'Literature', 'Business', 'Health', 
    'Arts', 'Religion', 'Philosophy', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/books', formData);
      toast.success('Book added successfully!');
      navigate('/admin/books');
    } catch (error) {
      console.error('Add book error:', error);
      const message = error.response?.data?.message || 'Failed to add book';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <Link to="/admin/books" className="btn btn-outline-secondary">
            ← Back to Manage Books
          </Link>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Add New Book 📚</h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter book title"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Author *</Form.Label>
                      <Form.Control
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        required
                        placeholder="Enter author name"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>ISBN *</Form.Label>
                      <Form.Control
                        type="text"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleChange}
                        required
                        placeholder="Enter ISBN"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Publisher *</Form.Label>
                      <Form.Control
                        type="text"
                        name="publisher"
                        value={formData.publisher}
                        onChange={handleChange}
                        required
                        placeholder="Enter publisher name"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Published Year *</Form.Label>
                      <Form.Control
                        type="number"
                        name="publishedYear"
                        value={formData.publishedYear}
                        onChange={handleChange}
                        required
                        min="1000"
                        max={new Date().getFullYear()}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Language</Form.Label>
                      <Form.Control
                        type="text"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        placeholder="Enter language"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Total Copies *</Form.Label>
                      <Form.Control
                        type="number"
                        name="totalCopies"
                        value={formData.totalCopies}
                        onChange={handleChange}
                        required
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pages</Form.Label>
                      <Form.Control
                        type="number"
                        name="pages"
                        value={formData.pages}
                        onChange={handleChange}
                        min="1"
                        placeholder="Number of pages"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Section *</Form.Label>
                      <Form.Control
                        type="text"
                        name="location.section"
                        value={formData.location.section}
                        onChange={handleChange}
                        required
                        placeholder="e.g., A, B, C"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Shelf *</Form.Label>
                      <Form.Control
                        type="text"
                        name="location.shelf"
                        value={formData.location.shelf}
                        onChange={handleChange}
                        required
                        placeholder="e.g., A1, B2, C3"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter book description (optional)"
                    maxLength={1000}
                  />
                  <Form.Text className="text-muted">
                    {formData.description.length}/1000 characters
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Adding Book...
                      </>
                    ) : (
                      'Add Book'
                    )}
                  </Button>
                  <Link to="/admin/books" className="btn btn-secondary">
                    Cancel
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddBook;
