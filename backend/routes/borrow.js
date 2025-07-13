const express = require('express');
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Borrow a book
// @route   POST /api/borrow
// @access  Private
router.post('/', [protect], [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
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

    const { bookId, dueDate } = req.body;
    const userId = req.user.id;

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available for borrowing' });
    }

    // Check if user already has this book borrowed
    const existingBorrow = await BorrowRecord.findOne({
      user: userId,
      book: bookId,
      status: { $in: ['borrowed', 'overdue'] }
    });

    if (existingBorrow) {
      return res.status(400).json({ message: 'You already have this book borrowed' });
    }

    // Check user's borrowing limit (max 5 books)
    const userBorrowCount = await BorrowRecord.countDocuments({
      user: userId,
      status: { $in: ['borrowed', 'overdue'] }
    });

    if (userBorrowCount >= 5) {
      return res.status(400).json({ message: 'You have reached the maximum borrowing limit (5 books)' });
    }

    // Create borrow record
    const borrowRecord = await BorrowRecord.create({
      user: userId,
      book: bookId,
      dueDate: new Date(dueDate),
      issuedBy: req.user.role === 'admin' ? userId : userId // In real app, this would be the admin who issued
    });

    // Update book available copies
    book.availableCopies -= 1;
    await book.save();

    // Update user's borrowed books
    await User.findByIdAndUpdate(userId, {
      $push: { borrowedBooks: borrowRecord._id }
    });

    await borrowRecord.populate([
      { path: 'book', select: 'title author isbn' },
      { path: 'user', select: 'name email studentId' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: borrowRecord
    });
  } catch (error) {
    console.error('Borrow book error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Return a book
// @route   PUT /api/borrow/:id/return
// @access  Private
router.put('/:id/return', protect, async (req, res) => {
  try {
    const borrowRecord = await BorrowRecord.findById(req.params.id)
      .populate('book')
      .populate('user', 'name email studentId');

    if (!borrowRecord) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    // Check if user owns this borrow record or is admin
    if (borrowRecord.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (borrowRecord.status === 'returned') {
      return res.status(400).json({ message: 'Book is already returned' });
    }

    // Calculate fine if overdue
    const returnDate = new Date();
    borrowRecord.returnDate = returnDate;
    borrowRecord.status = 'returned';
    borrowRecord.returnedBy = req.user.id;

    if (returnDate > borrowRecord.dueDate) {
      borrowRecord.calculateFine();
    }

    await borrowRecord.save();

    // Update book available copies
    const book = await Book.findById(borrowRecord.book._id);
    book.availableCopies += 1;
    await book.save();

    // Remove from user's borrowed books
    await User.findByIdAndUpdate(borrowRecord.user._id, {
      $pull: { borrowedBooks: borrowRecord._id }
    });

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: borrowRecord
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Get user's borrowed books
// @route   GET /api/borrow/my-books
// @access  Private
router.get('/my-books', protect, async (req, res) => {
  try {
    const borrowRecords = await BorrowRecord.find({ user: req.user.id })
      .populate('book', 'title author isbn category')
      .sort({ borrowDate: -1 });

    res.json({
      success: true,
      data: borrowRecords
    });
  } catch (error) {
    console.error('Get user books error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Get all borrow records (Admin only)
// @route   GET /api/borrow/all
// @access  Private/Admin
router.get('/all', [protect, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by overdue
    if (req.query.overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $in: ['borrowed', 'overdue'] };
    }

    const borrowRecords = await BorrowRecord.find(query)
      .populate('user', 'name email studentId')
      .populate('book', 'title author isbn')
      .sort({ borrowDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BorrowRecord.countDocuments(query);

    res.json({
      success: true,
      data: borrowRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all borrow records error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Renew a book
// @route   PUT /api/borrow/:id/renew
// @access  Private
router.put('/:id/renew', protect, async (req, res) => {
  try {
    const borrowRecord = await BorrowRecord.findById(req.params.id)
      .populate('book')
      .populate('user');

    if (!borrowRecord) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    // Check if user owns this borrow record
    if (borrowRecord.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (borrowRecord.status !== 'borrowed') {
      return res.status(400).json({ message: 'Can only renew borrowed books' });
    }

    if (borrowRecord.renewalCount >= 2) {
      return res.status(400).json({ message: 'Maximum renewal limit reached' });
    }

    // Check if book is overdue
    if (new Date() > borrowRecord.dueDate) {
      return res.status(400).json({ message: 'Cannot renew overdue books' });
    }

    // Extend due date by 14 days
    const newDueDate = new Date(borrowRecord.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 14);

    borrowRecord.dueDate = newDueDate;
    borrowRecord.renewalCount += 1;
    await borrowRecord.save();

    res.json({
      success: true,
      message: 'Book renewed successfully',
      data: borrowRecord
    });
  } catch (error) {
    console.error('Renew book error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
