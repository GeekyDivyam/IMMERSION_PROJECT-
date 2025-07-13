import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories] = useState([
    'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 
    'Biography', 'Education', 'Literature', 'Business', 'Health', 
    'Arts', 'Religion', 'Philosophy', 'Other'
  ]);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, search, category, available]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });

      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (available) params.append('available', available);

      const response = await axios.get(`/api/books?${params}`);
      setBooks(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error('Fetch books error:', error);
      toast.error('Failed to fetch books');
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks();
  };

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    if (filterType === 'category') setCategory(value);
    if (filterType === 'available') setAvailable(value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && books.length === 0) {
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
          <h1>Browse Books 📚</h1>
          <p className="text-muted">Discover and borrow books from our collection</p>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSearchSubmit}>
                <Row className="align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Search Books</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Search by title, author, ISBN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        value={category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Availability</Form.Label>
                      <Form.Select
                        value={available}
                        onChange={(e) => handleFilterChange('available', e.target.value)}
                      >
                        <option value="">All Books</option>
                        <option value="true">Available Only</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Button type="submit" variant="primary" className="w-100">
                      Search
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Books Grid */}
      {books.length > 0 ? (
        <>
          <Row>
            {books.map((book) => (
              <Col key={book._id} lg={3} md={4} sm={6} className="mb-4">
                <Card className="book-card h-100">
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <Badge bg="secondary" className="mb-2">{book.category}</Badge>
                      <h6 className="card-title">{book.title}</h6>
                      <p className="text-muted small mb-2">by {book.author}</p>
                      <p className="text-muted small mb-2">
                        Published: {book.publishedYear} | {book.publisher}
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          {book.availableCopies}/{book.totalCopies} available
                        </small>
                        <Badge 
                          bg={book.availableCopies > 0 ? 'success' : 'danger'}
                          className="ms-2"
                        >
                          {book.availableCopies > 0 ? 'Available' : 'Not Available'}
                        </Badge>
                      </div>
                      
                      <div className="d-grid">
                        <Link 
                          to={`/books/${book._id}`} 
                          className="btn btn-primary btn-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.First 
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return <Pagination.Ellipsis key={page} />;
                    }
                    return null;
                  })}
                  
                  <Pagination.Next 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last 
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </Col>
            </Row>
          )}
        </>
      ) : (
        <Row>
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <h4>No books found</h4>
                <p className="text-muted">
                  {search || category || available 
                    ? 'Try adjusting your search criteria' 
                    : 'No books are currently available in the library'
                  }
                </p>
                {(search || category || available) && (
                  <Button 
                    variant="outline-primary" 
                    onClick={() => {
                      setSearch('');
                      setCategory('');
                      setAvailable('');
                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default BookList;
