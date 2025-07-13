const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', [protect, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Filter by active status
    if (req.query.active !== undefined) {
      query.isActive = req.query.active === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', [protect, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('borrowedBooks');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's borrow history
    const borrowHistory = await BorrowRecord.find({ user: req.params.id })
      .populate('book', 'title author isbn')
      .sort({ borrowDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        borrowHistory
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [protect], [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().matches(/^\d{10}$/).withMessage('Please enter a valid 10-digit phone number'),
  body('address').optional().isLength({ max: 200 }).withMessage('Address cannot be more than 200 characters')
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

    const { name, phone, address } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Update user by admin
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', [protect, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow updating password through this route
    delete req.body.password;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Deactivate/Activate user (Admin only)
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
router.put('/:id/toggle-status', [protect, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has active borrows before deactivating
    if (user.isActive) {
      const activeBorrows = await BorrowRecord.countDocuments({
        user: req.params.id,
        status: { $in: ['borrowed', 'overdue'] }
      });

      if (activeBorrows > 0) {
        return res.status(400).json({ 
          message: 'Cannot deactivate user with active book borrows' 
        });
      }
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Get dashboard statistics (Admin only)
// @route   GET /api/users/stats/dashboard
// @access  Private/Admin
router.get('/stats/dashboard', [protect, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const totalBorrows = await BorrowRecord.countDocuments();
    const activeBorrows = await BorrowRecord.countDocuments({ 
      status: { $in: ['borrowed', 'overdue'] } 
    });
    const overdueBorrows = await BorrowRecord.countDocuments({ 
      status: 'overdue' 
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalBorrows,
        activeBorrows,
        overdueBorrows
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
