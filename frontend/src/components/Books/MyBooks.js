import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);
  const [renewing, setRenewing] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/borrow/my-books');
      setBorrowedBooks(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch my books error:', error);
      toast.error('Failed to fetch your books');
      setLoading(false);
    }
  };

  const handleReturnBook = async (borrowId) => {
    try {
      setReturning(borrowId);
      await axios.put(`/api/borrow/${borrowId}/return`);
      toast.success('Book returned successfully!');
      setShowReturnModal(false);
      fetchMyBooks();
    } catch (error) {
      console.error('Return book error:', error);
      toast.error(error.response?.data?.message || 'Failed to return book');
    } finally {
      setReturning(null);
    }
  };

  const handleRenewBook = async (borrowId) => {
    try {
      setRenewing(borrowId);
      await axios.put(`/api/borrow/${borrowId}/renew`);
      toast.success('Book renewed successfully!');
      fetchMyBooks();
    } catch (error) {
      console.error('Renew book error:', error);
      toast.error(error.response?.data?.message || 'Failed to renew book');
    } finally {
      setRenewing(null);
    }
  };

  const getStatusBadge = (record) => {
    const isOverdue = new Date() > new Date(record.dueDate) && record.status !== 'returned';
    
    if (record.status === 'returned') {
      return <Badge bg="success">Returned</Badge>;
    } else if (isOverdue || record.status === 'overdue') {
      return <Badge bg="danger">Overdue</Badge>;
    } else {
      return <Badge bg="primary">Borrowed</Badge>;
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  const currentBooks = borrowedBooks.filter(record => record.status !== 'returned');
  const returnedBooks = borrowedBooks.filter(record => record.status === 'returned');

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

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>My Books 📚</h1>
          <p className="text-muted">Manage your borrowed books</p>
        </Col>
      </Row>

      {/* Current Books */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Currently Borrowed ({currentBooks.length})</h5>
              <Badge bg="info">{currentBooks.length}/5 books</Badge>
            </Card.Header>
            <Card.Body>
              {currentBooks.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Borrowed Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Renewals</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBooks.map((record) => (
                      <tr key={record._id}>
                        <td>
                          <div>
                            <h6 className="mb-1">{record.book.title}</h6>
                            <small className="text-muted">by {record.book.author}</small>
                          </div>
                        </td>
                        <td>{new Date(record.borrowDate).toLocaleDateString()}</td>
                        <td>
                          <div>
                            {new Date(record.dueDate).toLocaleDateString()}
                            <br />
                            <small className={`text-${
                              new Date() > new Date(record.dueDate) ? 'danger' : 'muted'
                            }`}>
                              {getDaysRemaining(record.dueDate)}
                            </small>
                          </div>
                        </td>
                        <td>{getStatusBadge(record)}</td>
                        <td>
                          <Badge bg="secondary">{record.renewalCount}/2</Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleRenewBook(record._id)}
                              disabled={
                                record.renewalCount >= 2 || 
                                new Date() > new Date(record.dueDate) ||
                                renewing === record._id
                              }
                            >
                              {renewing === record._id ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                'Renew'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => {
                                setSelectedBook(record);
                                setShowReturnModal(true);
                              }}
                            >
                              Return
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">You haven't borrowed any books yet.</p>
                  <Button variant="primary" href="/books">
                    Browse Books
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Returned Books History */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Borrowing History ({returnedBooks.length})</h5>
            </Card.Header>
            <Card.Body>
              {returnedBooks.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Borrowed Date</th>
                      <th>Due Date</th>
                      <th>Returned Date</th>
                      <th>Status</th>
                      <th>Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnedBooks.slice(0, 10).map((record) => (
                      <tr key={record._id}>
                        <td>
                          <div>
                            <h6 className="mb-1">{record.book.title}</h6>
                            <small className="text-muted">by {record.book.author}</small>
                          </div>
                        </td>
                        <td>{new Date(record.borrowDate).toLocaleDateString()}</td>
                        <td>{new Date(record.dueDate).toLocaleDateString()}</td>
                        <td>{new Date(record.returnDate).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={
                            new Date(record.returnDate) > new Date(record.dueDate) 
                              ? 'warning' 
                              : 'success'
                          }>
                            {new Date(record.returnDate) > new Date(record.dueDate) 
                              ? 'Returned Late' 
                              : 'Returned On Time'
                            }
                          </Badge>
                        </td>
                        <td>
                          {record.fine.amount > 0 ? (
                            <Badge bg={record.fine.paid ? 'success' : 'danger'}>
                              ${record.fine.amount} {record.fine.paid ? '(Paid)' : '(Unpaid)'}
                            </Badge>
                          ) : (
                            <Badge bg="success">No Fine</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No borrowing history yet.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Return Confirmation Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Return Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBook && (
            <>
              <p>Are you sure you want to return this book?</p>
              <div className="bg-light p-3 rounded">
                <h6 className="mb-1">{selectedBook.book.title}</h6>
                <p className="text-muted mb-2">by {selectedBook.book.author}</p>
                <p className="mb-0">
                  <strong>Due Date:</strong> {new Date(selectedBook.dueDate).toLocaleDateString()}
                </p>
                {new Date() > new Date(selectedBook.dueDate) && (
                  <div className="alert alert-warning mt-2 mb-0">
                    <small>
                      <strong>Note:</strong> This book is overdue. A fine may be applied.
                    </small>
                  </div>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReturnModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleReturnBook(selectedBook._id)}
            disabled={returning === selectedBook?._id}
          >
            {returning === selectedBook?._id ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Returning...
              </>
            ) : (
              'Confirm Return'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyBooks;
