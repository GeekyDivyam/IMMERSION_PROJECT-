const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Book = require('../models/Book');

// @route   GET /api/reviews/book/:bookId
// @desc    Get all reviews for a specific book
// @access  Public
router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({
      book: req.params.bookId,
      isApproved: true
    }).populate('user', 'name').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, rating, title, review } = req.body;

    // Create new review
    const newReview = new Review({
      user: req.user.id,
      book: bookId,
      rating,
      title,
      review
    });

    await newReview.save();
    await newReview.populate('user', 'name');

    res.status(201).json({
      success: true,
      data: newReview,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;
