import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import StarRating from './StarRating';
import api from '../../config/api';

const ReviewForm = ({ bookId, onReviewAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review: ''
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/reviews', {
        bookId,
        ...formData
      });
      
      toast.success('Review added successfully!');
      setFormData({ rating: 0, title: '', review: '' });
      setShowForm(false);
      
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <Alert variant="info" className="text-center">
        <i className="fas fa-sign-in-alt me-2"></i>
        Please <strong>login</strong> to write a review
      </Alert>
    );
  }

  if (!showForm) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <h5 className="mb-3">Share Your Thoughts</h5>
          <p className="text-muted mb-3">
            Have you read this book? Help others by sharing your experience!
          </p>
          <Button 
            variant="primary" 
            onClick={() => setShowForm(true)}
            className="px-4"
          >
            <i className="fas fa-star me-2"></i>
            Write a Review
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 review-form-card">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-edit me-2"></i>
          Write Your Review
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Your Rating *</Form.Label>
            <div className="d-flex align-items-center">
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => handleInputChange('rating', rating)}
                size="lg"
              />
              {formData.rating > 0 && (
                <span className="ms-3 text-muted">
                  {formData.rating} out of 5 stars
                </span>
              )}
            </div>
            <Form.Text className="text-muted">
              Click on the stars to rate this book
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Review Title *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Summarize your review in a few words..."
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              minLength={5}
              maxLength={100}
            />
            <Form.Text className="text-muted">
              {formData.title.length}/100 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Your Review *</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Share your thoughts about this book. What did you like or dislike? Would you recommend it to others?"
              value={formData.review}
              onChange={(e) => handleInputChange('review', e.target.value)}
              required
              minLength={10}
              maxLength={1000}
            />
            <Form.Text className="text-muted">
              {formData.review.length}/1000 characters (minimum 10 characters)
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setShowForm(false);
                setFormData({ rating: 0, title: '', review: '' });
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || formData.rating === 0 || formData.title.length < 5 || formData.review.length < 10}
              className="px-4"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i>
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ReviewForm;
