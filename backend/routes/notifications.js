const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const emailService = require('../services/emailService');
const notificationScheduler = require('../services/notificationScheduler');
const BorrowRecord = require('../models/BorrowRecord');

// @route   POST /api/notifications/test-email
// @desc    Send test email notification
// @access  Private (Admin)
router.post('/test-email', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { type = 'welcome', email } = req.body;
    const testUser = { 
      name: req.user.name, 
      email: email || req.user.email 
    };
    const testBook = {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald'
    };

    let result;
    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(testUser);
        break;
      case 'due-reminder':
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);
        result = await emailService.sendDueDateReminder(testUser, testBook, dueDate);
        break;
      case 'overdue':
        result = await emailService.sendOverdueNotification(testUser, testBook, 5, 25);
        break;
      case 'returned':
        result = await emailService.sendBookReturnedConfirmation(testUser, testBook, 10);
        break;
      default:
        return res.status(400).json({ message: 'Invalid email type' });
    }

    res.json({
      success: true,
      message: `Test ${type} email sent successfully`,
      result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/notifications/send-immediate
// @desc    Send immediate notifications for testing
// @access  Private (Admin)
router.post('/send-immediate', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const result = await notificationScheduler.sendImmediateNotifications();
    
    res.json({
      success: true,
      message: 'Immediate notifications sent',
      result
    });
  } catch (error) {
    console.error('Send immediate notifications error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private (Admin)
router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Books due in 3 days
    const dueSoonCount = await BorrowRecord.countDocuments({
      status: 'borrowed',
      dueDate: { $lte: threeDaysFromNow, $gte: now }
    });

    // Overdue books
    const overdueCount = await BorrowRecord.countDocuments({
      status: { $in: ['borrowed', 'overdue'] },
      dueDate: { $lt: now }
    });

    // Books due today
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const dueTodayCount = await BorrowRecord.countDocuments({
      status: 'borrowed',
      dueDate: { $gte: todayStart, $lte: today }
    });

    res.json({
      success: true,
      data: {
        dueSoon: dueSoonCount,
        overdue: overdueCount,
        dueToday: dueTodayCount,
        lastCheck: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
