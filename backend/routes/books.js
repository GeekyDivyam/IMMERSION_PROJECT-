const express = require('express');
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all books with search and pagination
// @route   GET /api/books
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true };
    
    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by availability
    if (req.query.available === 'true') {
      query.availableCopies = { $gt: 0 };
    }

    const books = await Book.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name');
    
    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Add new book
// @route   POST /api/books
// @access  Private/Admin
router.post('/', [protect, admin], [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('author').trim().isLength({ min: 1 }).withMessage('Author is required'),
  body('isbn').trim().isLength({ min: 1 }).withMessage('ISBN is required'),
  body('publisher').trim().isLength({ min: 1 }).withMessage('Publisher is required'),
  body('publishedYear').isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Valid published year is required'),
  body('category').isIn(['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Education', 'Literature', 'Business', 'Health', 'Arts', 'Religion', 'Philosophy', 'Other']).withMessage('Valid category is required'),
  body('totalCopies').isInt({ min: 1 }).withMessage('Total copies must be at least 1'),
  body('location.shelf').trim().isLength({ min: 1 }).withMessage('Shelf location is required'),
  body('location.section').trim().isLength({ min: 1 }).withMessage('Section is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if book with same ISBN already exists
    const existingBook = await Book.findOne({ isbn: req.body.isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const bookData = {
      ...req.body,
      availableCopies: req.body.totalCopies,
      addedBy: req.user.id
    };

    const book = await Book.create(bookData);
    await book.populate('addedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: book
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
router.put('/:id', [protect, admin], async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Don't allow changing available copies directly
    delete req.body.availableCopies;
    
    // If total copies is being updated, adjust available copies
    if (req.body.totalCopies) {
      const borrowedCopies = book.totalCopies - book.availableCopies;
      req.body.availableCopies = Math.max(0, req.body.totalCopies - borrowedCopies);
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name');

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Delete book (soft delete)
// @route   DELETE /api/books/:id
// @access  Private/Admin
router.delete('/:id', [protect, admin], async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book has active borrows
    if (book.availableCopies < book.totalCopies) {
      return res.status(400).json({ 
        message: 'Cannot delete book with active borrows. Please ensure all copies are returned first.' 
      });
    }

    // Soft delete
    book.isActive = false;
    await book.save();

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
