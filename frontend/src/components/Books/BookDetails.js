import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { toast } from 'react-toastify';

const BookDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchBookDetails();
    // Set default due date to 14 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/books/${id}`);
      setBook(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch book details error:', error);
      toast.error('Failed to fetch book details');
      setLoading(false);
    }
  };

  const handleBorrowBook = async () => {
    try {
      setBorrowing(true);
      await api.post('/api/borrow', {
        bookId: id,
        dueDate: dueDate
      });
      
      toast.success('Book borrowed successfully!');
      setShowBorrowModal(false);
      fetchBookDetails(); // Refresh book details
    } catch (error) {
      console.error('Borrow book error:', error);
      toast.error(error.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container>
        <div className="text-center mt-5">
          <h4>Book not found</h4>
          <p className="text-muted">The book you're looking for doesn't exist.</p>
          <Link to="/books" className="btn btn-primary">
            Back to Books
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <Link to="/books" className="btn btn-outline-secondary">
            ← Back to Books
          </Link>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Badge bg="secondary" className="mb-2">{book.category}</Badge>
                  <h1 className="h3">{book.title}</h1>
                  <h2 className="h5 text-muted">by {book.author}</h2>
                </div>
                <div className="text-end">
                  <Badge 
                    bg={book.availableCopies > 0 ? 'success' : 'danger'}
                    className="fs-6"
                  >
                    {book.availableCopies > 0 ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <h6>Book Information</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>ISBN:</strong></td>
                        <td>{book.isbn}</td>
                      </tr>
                      <tr>
                        <td><strong>Publisher:</strong></td>
                        <td>{book.publisher}</td>
                      </tr>
                      <tr>
                        <td><strong>Published Year:</strong></td>
                        <td>{book.publishedYear}</td>
                      </tr>
                      <tr>
                        <td><strong>Language:</strong></td>
                        <td>{book.language}</td>
                      </tr>
                      {book.pages && (
                        <tr>
                          <td><strong>Pages:</strong></td>
                          <td>{book.pages}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Col>
                <Col md={6}>
                  <h6>Availability</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Total Copies:</strong></td>
                        <td>{book.totalCopies}</td>
                      </tr>
                      <tr>
                        <td><strong>Available Copies:</strong></td>
                        <td>{book.availableCopies}</td>
                      </tr>
                      <tr>
                        <td><strong>Location:</strong></td>
                        <td>Section {book.location.section}, Shelf {book.location.shelf}</td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>

              {book.description && (
                <div className="mb-4">
                  <h6>Description</h6>
                  <p className="text-muted">{book.description}</p>
                </div>
              )}

              <div className="mb-3">
                <small className="text-muted">
                  Added on {new Date(book.createdAt).toLocaleDateString()} by {book.addedBy?.name}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Actions</h6>
            </Card.Header>
            <Card.Body>
              {book.availableCopies > 0 ? (
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => setShowBorrowModal(true)}
                  >
                    📚 Borrow This Book
                  </Button>
                  <small className="text-muted text-center">
                    {book.availableCopies} of {book.totalCopies} copies available
                  </small>
                </div>
              ) : (
                <div className="text-center">
                  <Button variant="outline-danger" size="lg" disabled>
                    📚 Not Available
                  </Button>
                  <small className="text-muted d-block mt-2">
                    All copies are currently borrowed
                  </small>
                </div>
              )}

              {user.role === 'admin' && (
                <div className="mt-3 pt-3 border-top">
                  <h6>Admin Actions</h6>
                  <div className="d-grid gap-2">
                    <Link 
                      to={`/admin/books/edit/${book._id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Edit Book
                    </Link>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">Book Stats</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <div className="row">
                  <div className="col-6">
                    <div className="border-end">
                      <div className="h4 text-primary mb-0">{book.totalCopies - book.availableCopies}</div>
                      <small className="text-muted">Currently Borrowed</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="h4 text-success mb-0">{book.availableCopies}</div>
                    <small className="text-muted">Available</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Borrow Modal */}
      <Modal show={showBorrowModal} onHide={() => setShowBorrowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Borrow Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are about to borrow:</p>
          <div className="bg-light p-3 rounded mb-3">
            <h6 className="mb-1">{book.title}</h6>
            <p className="text-muted mb-0">by {book.author}</p>
          </div>
          
          <Form.Group>
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <Form.Text className="text-muted">
              Standard borrowing period is 14 days. You can renew up to 2 times.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBorrowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBorrowBook}
            disabled={borrowing || !dueDate}
          >
            {borrowing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Borrowing...
              </>
            ) : (
              'Confirm Borrow'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookDetails;
