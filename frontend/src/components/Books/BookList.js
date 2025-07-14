import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Pagination, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-toastify';
import '../../styles/BookAnimations.css';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    authors: [],
    languages: [],
    yearRange: { minYear: 1900, maxYear: new Date().getFullYear() }
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchBooks();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, search, category, available, author, language, yearFrom, yearTo]);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/api/books/filters');
      setFilterOptions(response.data.data);
    } catch (error) {
      console.error('Fetch filter options error:', error);
      // Use fallback categories if API fails
      setFilterOptions(prev => ({
        ...prev,
        categories: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Education', 'Literature', 'Business', 'Health', 'Arts', 'Religion', 'Philosophy', 'Other']
      }));
    }
  };

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
      if (author) params.append('author', author);
      if (language) params.append('language', language);
      if (yearFrom) params.append('yearFrom', yearFrom);
      if (yearTo) params.append('yearTo', yearTo);

      const response = await api.get(`/api/books?${params}`);
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
    if (filterType === 'author') setAuthor(value);
    if (filterType === 'language') setLanguage(value);
    if (filterType === 'yearFrom') setYearFrom(value);
    if (filterType === 'yearTo') setYearTo(value);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setAvailable('');
    setAuthor('');
    setLanguage('');
    setYearFrom('');
    setYearTo('');
    setCurrentPage(1);
  };

  const handleQuickSearch = (searchTerm) => {
    setSearch(searchTerm);
    setCurrentPage(1);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Row>
      {[...Array(12)].map((_, index) => (
        <Col key={index} md={4} lg={3} className="mb-4">
          <Card className="loading-book-card loading-skeleton">
            <Card.Body>
              <div className="loading-skeleton" style={{ height: '20px', marginBottom: '10px' }}></div>
              <div className="loading-skeleton" style={{ height: '16px', marginBottom: '8px' }}></div>
              <div className="loading-skeleton" style={{ height: '14px', marginBottom: '8px' }}></div>
              <div className="loading-skeleton" style={{ height: '12px', marginBottom: '20px' }}></div>
              <div className="loading-skeleton" style={{ height: '36px' }}></div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

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
          <Card className="search-container shadow-sm">
            <Card.Body>
              {/* Quick Search Buttons */}
              <Row className="mb-3">
                <Col>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="quick-search-btn"
                      onClick={() => handleQuickSearch('fiction')}
                    >
                      <i className="fas fa-book me-1"></i>Fiction
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="quick-search-btn"
                      onClick={() => handleQuickSearch('science')}
                    >
                      <i className="fas fa-flask me-1"></i>Science
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="quick-search-btn"
                      onClick={() => handleQuickSearch('technology')}
                    >
                      <i className="fas fa-laptop-code me-1"></i>Technology
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="quick-search-btn"
                      onClick={() => handleQuickSearch('history')}
                    >
                      <i className="fas fa-landmark me-1"></i>History
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="quick-search-btn"
                      onClick={() => handleQuickSearch('biography')}
                    >
                      <i className="fas fa-user me-1"></i>Biography
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="quick-search-btn"
                      onClick={handleClearFilters}
                    >
                      <i className="fas fa-times me-1"></i>Clear All Filters
                    </Button>
                  </div>
                </Col>
              </Row>

              <Form onSubmit={handleSearchSubmit}>
                <Row className="align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Search Books</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Search by title, author, ISBN, publisher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        value={category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {filterOptions.categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
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
                  <Col md={2}>
                    <Button
                      variant="outline-info"
                      className="w-100"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      {showAdvancedFilters ? 'Hide' : 'More'} Filters
                    </Button>
                  </Col>
                </Row>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <Row className="mt-3 pt-3 border-top advanced-filters">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Author</Form.Label>
                        <Form.Select
                          value={author}
                          onChange={(e) => handleFilterChange('author', e.target.value)}
                        >
                          <option value="">All Authors</option>
                          {filterOptions.authors.map(auth => (
                            <option key={auth} value={auth}>{auth}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Language</Form.Label>
                        <Form.Select
                          value={language}
                          onChange={(e) => handleFilterChange('language', e.target.value)}
                        >
                          <option value="">All Languages</option>
                          {filterOptions.languages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Published From</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Year"
                          min={filterOptions.yearRange.minYear}
                          max={filterOptions.yearRange.maxYear}
                          value={yearFrom}
                          onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Published To</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Year"
                          min={filterOptions.yearRange.minYear}
                          max={filterOptions.yearRange.maxYear}
                          value={yearTo}
                          onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search Results Summary */}
      {!loading && (
        <Row className="mb-3 search-results-summary">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">
                  {books.length > 0 ? `Found ${books.length} books` : 'No books found'}
                  {search && ` for "${search}"`}
                </h5>
                {(search || category || available || author || language || yearFrom || yearTo) && (
                  <div className="text-muted small">
                    Active filters:
                    {search && <Badge bg="primary" className="ms-1">Search: {search}</Badge>}
                    {category && <Badge bg="secondary" className="ms-1">Category: {category}</Badge>}
                    {available && <Badge bg="success" className="ms-1">Available Only</Badge>}
                    {author && <Badge bg="info" className="ms-1">Author: {author}</Badge>}
                    {language && <Badge bg="warning" className="ms-1">Language: {language}</Badge>}
                    {(yearFrom || yearTo) && (
                      <Badge bg="dark" className="ms-1">
                        Year: {yearFrom || 'Any'} - {yearTo || 'Any'}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="text-muted small">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Books Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : books.length > 0 ? (
        <>
          <Row>
            {books.map((book, index) => (
              <Col key={book._id} lg={3} md={4} sm={6} className="mb-4">
                <Card className="book-card h-100 shadow-sm" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="secondary" className="category-badge">{book.category}</Badge>
                        {book.language && book.language !== 'English' && (
                          <Badge bg="info" className="ms-1">{book.language}</Badge>
                        )}
                      </div>
                      <h6 className="card-title fw-bold book-title">{book.title}</h6>
                      <p className="text-muted small mb-1">
                        <strong>Author:</strong> {book.author}
                      </p>
                      <p className="text-muted small mb-1">
                        <strong>Published:</strong> {book.publishedYear} | {book.publisher}
                      </p>
                      {book.isbn && (
                        <p className="text-muted small mb-1">
                          <strong>ISBN:</strong> {book.isbn}
                        </p>
                      )}
                      {book.description && (
                        <p className="text-muted small mb-2" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {book.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          <i className="fas fa-book"></i> {book.availableCopies}/{book.totalCopies} available
                        </small>
                        <Badge
                          bg={book.availableCopies > 0 ? 'success' : 'danger'}
                          className={`ms-2 availability-badge ${book.availableCopies > 0 ? 'available' : 'not-available'}`}
                        >
                          {book.availableCopies > 0 ? '✓ Available' : '✗ Not Available'}
                        </Badge>
                      </div>

                      <div className="d-grid">
                        <Link
                          to={`/books/${book._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          <i className="fas fa-eye me-1"></i>View Details
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
            <Card className="search-results-summary">
              <Card.Body className="text-center py-5">
                <div className="mb-3">
                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                </div>
                <h4>No books found</h4>
                <p className="text-muted">
                  {search || category || available
                    ? 'Try adjusting your search criteria or browse all books'
                    : 'No books are currently available in the library'
                  }
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="primary"
                    onClick={handleClearFilters}
                  >
                    <i className="fas fa-times me-1"></i>Clear Filters
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => handleQuickSearch('')}
                  >
                    <i className="fas fa-list me-1"></i>Browse All Books
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default BookList;
