const cron = require('node-cron');
const BorrowRecord = require('../models/BorrowRecord');
const emailService = require('./emailService');

// Notification scheduler service
const notificationScheduler = {
  // Check for due date reminders (runs daily at 9 AM)
  scheduleDueDateReminders: () => {
    cron.schedule('0 9 * * *', async () => {
      console.log('🔔 Running due date reminder check...');
      
      try {
        // Find books due in 3 days
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        threeDaysFromNow.setHours(23, 59, 59, 999); // End of day
        
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        twoDaysFromNow.setHours(0, 0, 0, 0); // Start of day
        
        const dueSoonBooks = await BorrowRecord.find({
          status: 'borrowed',
          dueDate: {
            $gte: twoDaysFromNow,
            $lte: threeDaysFromNow
          }
        })
        .populate('user', 'name email')
        .populate('book', 'title author');
        
        console.log(`📚 Found ${dueSoonBooks.length} books due in 3 days`);
        
        // Send reminders
        for (const record of dueSoonBooks) {
          await emailService.sendDueDateReminder(
            record.user,
            record.book,
            record.dueDate
          );
        }
        
        console.log('✅ Due date reminders sent successfully');
      } catch (error) {
        console.error('❌ Error sending due date reminders:', error);
      }
    });
  },

  // Check for overdue books (runs daily at 10 AM)
  scheduleOverdueNotifications: () => {
    cron.schedule('0 10 * * *', async () => {
      console.log('⚠️ Running overdue notification check...');
      
      try {
        const now = new Date();
        
        // Find overdue books
        const overdueBooks = await BorrowRecord.find({
          status: { $in: ['borrowed', 'overdue'] },
          dueDate: { $lt: now }
        })
        .populate('user', 'name email')
        .populate('book', 'title author');
        
        console.log(`📚 Found ${overdueBooks.length} overdue books`);
        
        // Send overdue notifications and update status
        for (const record of overdueBooks) {
          // Calculate overdue days and fine
          const overdueDays = Math.ceil((now - record.dueDate) / (1000 * 60 * 60 * 24));
          const finePerDay = 5;
          const fine = overdueDays * finePerDay;
          
          // Update fine amount
          record.fine.amount = fine;
          record.status = 'overdue';
          await record.save();
          
          // Send notification (but not every day - only on specific intervals)
          const shouldSendNotification = 
            overdueDays === 1 || // First day overdue
            overdueDays === 7 || // One week overdue
            overdueDays % 14 === 0; // Every 2 weeks after
          
          if (shouldSendNotification) {
            await emailService.sendOverdueNotification(
              record.user,
              record.book,
              overdueDays,
              fine
            );
          }
        }
        
        console.log('✅ Overdue notifications processed successfully');
      } catch (error) {
        console.error('❌ Error processing overdue notifications:', error);
      }
    });
  },

  // Manual function to send immediate notifications (for testing)
  sendImmediateNotifications: async () => {
    console.log('🔔 Sending immediate notifications for testing...');
    
    try {
      // Find books due in next 7 days for testing
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const dueSoonBooks = await BorrowRecord.find({
        status: 'borrowed',
        dueDate: { $lte: nextWeek }
      })
      .populate('user', 'name email')
      .populate('book', 'title author')
      .limit(5); // Limit for testing
      
      console.log(`📚 Sending test notifications for ${dueSoonBooks.length} books`);
      
      for (const record of dueSoonBooks) {
        const daysUntilDue = Math.ceil((record.dueDate - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue >= 0) {
          await emailService.sendDueDateReminder(
            record.user,
            record.book,
            record.dueDate
          );
        } else {
          const overdueDays = Math.abs(daysUntilDue);
          const fine = overdueDays * 5;
          await emailService.sendOverdueNotification(
            record.user,
            record.book,
            overdueDays,
            fine
          );
        }
      }
      
      return { success: true, count: dueSoonBooks.length };
    } catch (error) {
      console.error('❌ Error sending immediate notifications:', error);
      return { success: false, error: error.message };
    }
  },

  // Initialize all schedulers
  init: () => {
    console.log('🚀 Initializing notification schedulers...');
    
    // Schedule daily checks
    notificationScheduler.scheduleDueDateReminders();
    notificationScheduler.scheduleOverdueNotifications();
    
    console.log('✅ Notification schedulers initialized');
    console.log('📅 Due date reminders: Daily at 9:00 AM');
    console.log('⚠️ Overdue notifications: Daily at 10:00 AM');
  }
};

module.exports = notificationScheduler;
