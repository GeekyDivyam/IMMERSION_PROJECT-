import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ManageBooks = () => {
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Manage Books 📚</h1>
              <p className="text-muted">Add, edit, and organize your book collection</p>
            </div>
            <Link to="/admin/books/add" className="btn btn-success">
              Add New Book
            </Link>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body className="text-center py-5">
              <h4>Book Management Interface</h4>
              <p className="text-muted mb-4">
                This section will contain the full book management interface including:
              </p>
              <ul className="list-unstyled text-start" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <li>✅ View all books with pagination</li>
                <li>✅ Search and filter books</li>
                <li>✅ Edit book details</li>
                <li>✅ Delete books</li>
                <li>✅ Track book availability</li>
                <li>✅ Manage book locations</li>
              </ul>
              <div className="mt-4">
                <Link to="/admin/books/add" className="btn btn-primary me-2">
                  Add New Book
                </Link>
                <Link to="/books" className="btn btn-outline-primary">
                  View All Books
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ManageBooks;
