import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Admin Dashboard 🛠️</h1>
          <p className="text-muted">Manage your library system</p>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>📚 Manage Books</h3>
              <p className="text-muted">Add, edit, and organize your book collection</p>
              <Link to="/admin/books" className="btn btn-primary">
                Manage Books
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>👥 Manage Users</h3>
              <p className="text-muted">View and manage user accounts</p>
              <Link to="/admin/users" className="btn btn-primary">
                Manage Users
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/admin/books/add" className="btn btn-success">
                  Add New Book
                </Link>
                <Link to="/books" className="btn btn-outline-primary">
                  Browse Books
                </Link>
                <Link to="/dashboard" className="btn btn-outline-secondary">
                  Main Dashboard
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
