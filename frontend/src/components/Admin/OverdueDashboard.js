import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../config/api';

const OverdueDashboard = () => {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [returnForm, setReturnForm] = useState({
    returnCondition: 'good',
    returnNotes: '',
    fineAmount: 0
  });

  useEffect(() => {
    fetchOverdueBooks();
    fetchNotificationStats();
  }, []);

  const fetchOverdueBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/borrow/overdue');
      setOverdueBooks(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch overdue books');
      console.error('Fetch overdue books error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await api.get('/api/notifications/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Fetch notification stats error:', error);
    }
  };

  const handleReturnBook = async () => {
    try {
      await api.post(`/api/borrow/return/${selectedRecord._id}`, returnForm);
      toast.success('Book returned successfully');
      setShowReturnModal(false);
      setSelectedRecord(null);
      setReturnForm({ returnCondition: 'good', returnNotes: '', fineAmount: 0 });
      fetchOverdueBooks();
      fetchNotificationStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to return book');
    }
  };

  const handleRenewBook = async (recordId) => {
    try {
      await api.post(`/api/borrow/renew/${recordId}`);
      toast.success('Book renewed successfully');
      fetchOverdueBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to renew book');
    }
  };

  const sendTestNotifications = async () => {
    try {
      await api.post('/api/notifications/send-immediate');
      toast.success('Test notifications sent successfully');
    } catch (error) {
      toast.error('Failed to send test notifications');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBadgeVariant = (days) => {
    if (days <= 3) return 'warning';
    if (days <= 7) return 'danger';
    return 'dark';
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Loading overdue books...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>📊 Overdue Books Dashboard</h2>
          <p className="text-muted">Manage overdue books and send notifications</p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{stats.overdue || 0}</h3>
              <p className="text-muted mb-0">Overdue Books</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{stats.dueToday || 0}</h3>
              <p className="text-muted mb-0">Due Today</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{stats.dueSoon || 0}</h3>
              <p className="text-muted mb-0">Due Soon (3 days)</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={sendTestNotifications}
              >
                📧 Send Test Notifications
              </Button>
              <p className="text-muted mb-0 mt-2">Test Email System</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Overdue Books Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">⚠️ Overdue Books ({overdueBooks.length})</h5>
              <Button variant="outline-secondary" size="sm" onClick={fetchOverdueBooks}>
                <i className="fas fa-sync-alt me-1"></i>Refresh
              </Button>
            </Card.Header>
            <Card.Body>
              {overdueBooks.length === 0 ? (
                <Alert variant="success" className="text-center">
                  <i className="fas fa-check-circle fa-2x mb-3 d-block"></i>
                  <h5>No Overdue Books!</h5>
                  <p className="mb-0">All books are returned on time or still within due date.</p>
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Borrower</th>
                      <th>Due Date</th>
                      <th>Days Overdue</th>
                      <th>Fine</th>
                      <th>Contact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueBooks.map((record) => (
                      <tr key={record._id}>
                        <td>
                          <div>
                            <strong>{record.book.title}</strong>
                            <br />
                            <small className="text-muted">by {record.book.author}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{record.user.name}</strong>
                            <br />
                            <small className="text-muted">{record.user.email}</small>
                          </div>
                        </td>
                        <td>{formatDate(record.dueDate)}</td>
                        <td>
                          <Badge bg={getBadgeVariant(record.overdueDays)}>
                            {record.overdueDays} days
                          </Badge>
                        </td>
                        <td>
                          <strong className="text-danger">${record.calculatedFine}</strong>
                        </td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            href={`mailto:${record.user.email}?subject=Overdue Book: ${record.book.title}`}
                          >
                            <i className="fas fa-envelope me-1"></i>Email
                          </Button>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => {
                                setSelectedRecord(record);
                                setReturnForm({
                                  ...returnForm,
                                  fineAmount: record.calculatedFine
                                });
                                setShowReturnModal(true);
                              }}
                            >
                              <i className="fas fa-check me-1"></i>Return
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleRenewBook(record._id)}
                              disabled={record.renewalCount >= 2}
                            >
                              <i className="fas fa-redo me-1"></i>Renew
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Return Book Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Return Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <>
              <div className="mb-3">
                <h6>Book Details:</h6>
                <p><strong>{selectedRecord.book.title}</strong> by {selectedRecord.book.author}</p>
                <p><strong>Borrower:</strong> {selectedRecord.user.name}</p>
                <p><strong>Days Overdue:</strong> {selectedRecord.overdueDays}</p>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Book Condition</Form.Label>
                  <Form.Select
                    value={returnForm.returnCondition}
                    onChange={(e) => setReturnForm({...returnForm, returnCondition: e.target.value})}
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="damaged">Damaged</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fine Amount ($)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={returnForm.fineAmount}
                    onChange={(e) => setReturnForm({...returnForm, fineAmount: parseFloat(e.target.value) || 0})}
                  />
                  <Form.Text className="text-muted">
                    Calculated fine: ${selectedRecord.calculatedFine}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Return Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={returnForm.returnNotes}
                    onChange={(e) => setReturnForm({...returnForm, returnNotes: e.target.value})}
                    placeholder="Any notes about the book condition or return..."
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReturnModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleReturnBook}>
            <i className="fas fa-check me-1"></i>Process Return
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OverdueDashboard;
