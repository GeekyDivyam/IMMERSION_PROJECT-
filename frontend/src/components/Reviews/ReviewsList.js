import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Pagination, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import api from '../../config/api';

const ReviewsList = ({ bookId, refreshTrigger }) => {
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchReviews();
  }, [bookId, currentPage, sortBy, sortOrder, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/reviews/book/${bookId}`, {
        params: {
          page: currentPage,
          limit: 5,
          sortBy,
          sortOrder
        }
      });

      setReviews(response.data.data);
      setRatingStats(response.data.ratingStats);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load reviews');
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewUpdate = () => {
    fetchReviews();
  };

  const handleReviewDelete = (reviewId) => {
    setReviews(prev => prev.filter(review => review._id !== reviewId));
    fetchReviews(); // Refresh to update stats
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const renderRatingDistribution = () => {
    if (!ratingStats || ratingStats.totalReviews === 0) return null;

    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-chart-bar me-2"></i>
            Rating Breakdown
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="text-center mb-3">
                <div className="display-4 text-primary fw-bold">
                  {ratingStats.averageRating.toFixed(1)}
                </div>
                <StarRating rating={ratingStats.averageRating} readonly size="lg" />
                <div className="text-muted">
                  Based on {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
                </div>
              </div>
            </Col>
            <Col md={6}>
              {[5, 4, 3, 2, 1].map(rating => {
                const count = ratingStats.ratingDistribution[rating] || 0;
                const percentage = ratingStats.totalReviews > 0 
                  ? (count / ratingStats.totalReviews) * 100 
                  : 0;
                
                return (
                  <div key={rating} className="d-flex align-items-center mb-1">
                    <span className="me-2">{rating}</span>
                    <i className="fas fa-star text-warning me-2"></i>
                    <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <small className="text-muted" style={{ minWidth: '40px' }}>
                      {count}
                    </small>
                  </div>
                );
              })}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const renderSortControls = () => (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">
        Reviews ({ratingStats?.totalReviews || 0})
      </h5>
      <Form.Select 
        value={`${sortBy}-${sortOrder}`}
        onChange={(e) => {
          const [newSortBy, newSortOrder] = e.target.value.split('-');
          setSortBy(newSortBy);
          setSortOrder(newSortOrder);
          setCurrentPage(1);
        }}
        style={{ width: 'auto' }}
      >
        <option value="createdAt-desc">Newest First</option>
        <option value="createdAt-asc">Oldest First</option>
        <option value="rating-desc">Highest Rated</option>
        <option value="rating-asc">Lowest Rated</option>
        <option value="helpfulCount-desc">Most Helpful</option>
      </Form.Select>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-center mt-4">
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
            } else if (page === currentPage - 3 || page === currentPage + 3) {
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <div className="mt-2">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      {renderRatingDistribution()}
      
      {ratingStats && ratingStats.totalReviews > 0 ? (
        <>
          {renderSortControls()}
          
          {reviews.map(review => (
            <ReviewCard
              key={review._id}
              review={review}
              onReviewUpdate={handleReviewUpdate}
              onReviewDelete={handleReviewDelete}
            />
          ))}
          
          {renderPagination()}
        </>
      ) : (
        <Alert variant="info" className="text-center">
          <i className="fas fa-comment-slash fa-2x mb-3 d-block"></i>
          <h5>No reviews yet</h5>
          <p className="mb-0">Be the first to share your thoughts about this book!</p>
        </Alert>
      )}
    </div>
  );
};

export default ReviewsList;
