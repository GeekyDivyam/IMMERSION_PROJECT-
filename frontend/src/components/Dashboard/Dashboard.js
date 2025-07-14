import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's borrowed books
      const myBooksResponse = await api.get('/api/borrow/my-books');
      setMyBooks(myBooksResponse.data.data.filter(book => book.status !== 'returned').slice(0, 5));

      // Fetch recent books
      const booksResponse = await api.get('/api/books?limit=6');
      setRecentBooks(booksResponse.data.data);

      // Fetch admin stats if user is admin
      if (user.role === 'admin') {
        const statsResponse = await api.get('/api/users/stats/dashboard');
        setStats(statsResponse.data.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
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

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Welcome back, {user.name}! 👋</h1>
          <p className="text-muted">
            {user.role === 'admin' ? 'Admin Dashboard' : 'Your Library Dashboard'}
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Admin Statistics */}
      {user.role === 'admin' && stats && (
        <Row className="dashboard-stats mb-4">
          <Col md={2} className="mb-3">
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="stat-number">{stats.totalUsers}</div>
                <div className="text-muted">Total Users</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className="mb-3">
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="stat-number">{stats.activeUsers}</div>
                <div className="text-muted">Active Users</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className="mb-3">
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="stat-number">{stats.totalBorrows}</div>
                <div className="text-muted">Total Borrows</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className="mb-3">
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="stat-number">{stats.activeBorrows}</div>
                <div className="text-muted">Active Borrows</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className="mb-3">
            <Card className="stat-card h-100 border-warning">
              <Card.Body>
                <div className="stat-number text-warning">{stats.overdueBorrows}</div>
                <div className="text-muted">Overdue</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className="mb-3">
            <Card className="stat-card h-100">
              <Card.Body className="d-flex align-items-center justify-content-center">
                <Link to="/admin" className="btn btn-primary btn-sm">
                  Admin Panel
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        {/* My Current Books */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Current Books</h5>
              <Link to="/my-books" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {myBooks.length > 0 ? (
                <div className="list-group list-group-flush">
                  {myBooks.map((record) => (
                    <div key={record._id} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{record.book.title}</h6>
                          <p className="mb-1 text-muted small">by {record.book.author}</p>
                          <small className={`badge ${
                            record.status === 'overdue' ? 'bg-danger' : 'bg-success'
                          }`}>
                            Due: {new Date(record.dueDate).toLocaleDateString()}
                          </small>
                        </div>
                        <span className={`badge ${
                          record.status === 'overdue' ? 'bg-danger' : 'bg-primary'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No books currently borrowed</p>
                  <Link to="/books" className="btn btn-primary">
                    Browse Books
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Books */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recently Added Books</h5>
              <Link to="/books" className="btn btn-sm btn-outline-primary">
                Browse All
              </Link>
            </Card.Header>
            <Card.Body>
              {recentBooks.length > 0 ? (
                <div className="row">
                  {recentBooks.map((book) => (
                    <div key={book._id} className="col-md-6 mb-3">
                      <div className="card book-card h-100">
                        <div className="card-body p-3">
                          <h6 className="card-title mb-1">{book.title}</h6>
                          <p className="card-text text-muted small mb-2">
                            by {book.author}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-secondary">{book.category}</span>
                            <small className={`text-${book.availableCopies > 0 ? 'success' : 'danger'}`}>
                              {book.availableCopies > 0 ? 'Available' : 'Not Available'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No books available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/books" className="btn btn-primary">
                  Browse Books
                </Link>
                <Link to="/my-books" className="btn btn-outline-primary">
                  My Books
                </Link>
                <Link to="/profile" className="btn btn-outline-secondary">
                  Update Profile
                </Link>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/books/add" className="btn btn-success">
                      Add New Book
                    </Link>
                    <Link to="/admin/users" className="btn btn-info">
                      Manage Users
                    </Link>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
