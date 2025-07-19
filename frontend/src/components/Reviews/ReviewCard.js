import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import StarRating from './StarRating';
import api from '../../config/api';

const ReviewCard = ({ review, onReviewUpdate, onReviewDelete }) => {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    rating: review.rating,
    title: review.title,
    review: review.review
  });
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleHelpfulVote = async (helpful) => {
    try {
      await api.post(`/api/reviews/${review._id}/helpful`, { helpful });
      toast.success('Vote recorded successfully');
      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record vote');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/api/reviews/${review._id}`, editForm);
      toast.success('Review updated successfully');
      setShowEditModal(false);
      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/api/reviews/${review._id}`);
        toast.success('Review deleted successfully');
        if (onReviewDelete) {
          onReviewDelete(review._id);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  const canEdit = user && user.id === review.user._id;
  const canDelete = user && (user.id === review.user._id || user.role === 'admin');

  return (
    <>
      <Card className="review-card mb-3 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div className="d-flex align-items-center mb-1">
                <StarRating rating={review.rating} readonly size="sm" />
                <Badge bg="primary" className="ms-2">
                  {review.rating}/5
                </Badge>
              </div>
              <h6 className="review-title mb-1">{review.title}</h6>
              <small className="text-muted">
                by {review.user.name} • {formatDate(review.createdAt)}
              </small>
            </div>
            {(canEdit || canDelete) && (
              <div className="review-actions">
                {canEdit && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => setShowEditModal(true)}
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                )}
              </div>
            )}
          </div>

          <p className="review-text mb-3">{review.review}</p>

          <div className="d-flex justify-content-between align-items-center">
            <div className="helpful-section">
              {user && user.id !== review.user._id && (
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">Was this helpful?</small>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleHelpfulVote(true)}
                  >
                    <i className="fas fa-thumbs-up me-1"></i>
                    Yes
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleHelpfulVote(false)}
                  >
                    <i className="fas fa-thumbs-down me-1"></i>
                    No
                  </Button>
                </div>
              )}
            </div>
            {review.helpfulCount > 0 && (
              <small className="text-muted">
                {review.helpfulCount} people found this helpful
              </small>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Edit Review Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Review</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div>
                <StarRating
                  rating={editForm.rating}
                  onRatingChange={(rating) => setEditForm(prev => ({ ...prev, rating }))}
                  size="lg"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Review Title</Form.Label>
              <Form.Control
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                required
                minLength={5}
                maxLength={100}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editForm.review}
                onChange={(e) => setEditForm(prev => ({ ...prev, review: e.target.value }))}
                required
                minLength={10}
                maxLength={1000}
              />
              <Form.Text className="text-muted">
                {editForm.review.length}/1000 characters
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Review'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default ReviewCard;
