const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  // For development, use test mode (logs emails instead of sending)
  if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  // For production, use actual email service
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  dueDateReminder: (user, book, dueDate) => ({
    subject: `📚 Reminder: "${book.title}" is due soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">📚 E-Library Reminder</h2>
        <p>Dear ${user.name},</p>
        <p>This is a friendly reminder that your borrowed book is due soon:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #333;">${book.title}</h3>
          <p style="margin: 5px 0; color: #666;">by ${book.author}</p>
          <p style="margin: 10px 0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
        </div>
        
        <p>Please return the book by the due date to avoid any late fees.</p>
        <p>You can also renew the book online if you need more time (up to 2 renewals).</p>
        
        <div style="margin: 30px 0;">
          <a href="http://localhost:3000/my-books" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            View My Books
          </a>
        </div>
        
        <p>Thank you for using our library!</p>
        <p><em>E-Library Management System</em></p>
      </div>
    `
  }),

  overdueNotification: (user, book, overdueDays, fine) => ({
    subject: `⚠️ Overdue: "${book.title}" - Please return immediately`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">⚠️ Overdue Book Notice</h2>
        <p>Dear ${user.name},</p>
        <p>Your borrowed book is now <strong>${overdueDays} day(s) overdue</strong>:</p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #856404;">${book.title}</h3>
          <p style="margin: 5px 0; color: #856404;">by ${book.author}</p>
          <p style="margin: 10px 0;"><strong>Days Overdue:</strong> ${overdueDays}</p>
          <p style="margin: 10px 0;"><strong>Current Fine:</strong> $${fine}</p>
        </div>
        
        <p><strong>Please return this book immediately to avoid additional charges.</strong></p>
        <p>Late fees are $5 per day until the book is returned.</p>
        
        <div style="margin: 30px 0;">
          <a href="http://localhost:3000/my-books" 
             style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            View My Books
          </a>
        </div>
        
        <p>If you have any questions, please contact the library immediately.</p>
        <p><em>E-Library Management System</em></p>
      </div>
    `
  }),

  bookReturned: (user, book, fine = 0) => ({
    subject: `✅ Book Returned: "${book.title}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">✅ Book Successfully Returned</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for returning your book:</p>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #155724;">${book.title}</h3>
          <p style="margin: 5px 0; color: #155724;">by ${book.author}</p>
          <p style="margin: 10px 0;"><strong>Returned:</strong> ${new Date().toLocaleDateString()}</p>
          ${fine > 0 ? `<p style="margin: 10px 0;"><strong>Fine Due:</strong> $${fine}</p>` : ''}
        </div>
        
        ${fine > 0 ? 
          '<p><strong>Please pay the outstanding fine at your next visit.</strong></p>' : 
          '<p>No fines due. Thank you for returning on time!</p>'
        }
        
        <div style="margin: 30px 0;">
          <a href="http://localhost:3000/books" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Browse More Books
          </a>
        </div>
        
        <p>Thank you for using our library!</p>
        <p><em>E-Library Management System</em></p>
      </div>
    `
  }),

  welcomeEmail: (user) => ({
    subject: `🎉 Welcome to E-Library Management System!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">🎉 Welcome to E-Library!</h2>
        <p>Dear ${user.name},</p>
        <p>Welcome to our E-Library Management System! Your account has been successfully created.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #333;">Getting Started</h3>
          <ul style="color: #666; line-height: 1.6;">
            <li>Browse our collection of ${26} books across multiple categories</li>
            <li>Borrow up to 5 books at a time</li>
            <li>Enjoy 14-day borrowing periods with renewal options</li>
            <li>Get email reminders before due dates</li>
            <li>Rate and review books you've read</li>
          </ul>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="http://localhost:3000/books" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Start Browsing Books
          </a>
        </div>
        
        <p>Happy reading!</p>
        <p><em>E-Library Management System</em></p>
      </div>
    `
  })
};

// Email service functions
const emailService = {
  // Send due date reminder (3 days before due)
  sendDueDateReminder: async (user, book, dueDate) => {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.dueDateReminder(user, book, dueDate);
      
      const mailOptions = {
        from: '"E-Library System" <noreply@elibrary.com>',
        to: user.email,
        subject: template.subject,
        html: template.html
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Due date reminder sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending due date reminder:', error);
      return { success: false, error: error.message };
    }
  },

  // Send overdue notification
  sendOverdueNotification: async (user, book, overdueDays, fine) => {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.overdueNotification(user, book, overdueDays, fine);
      
      const mailOptions = {
        from: '"E-Library System" <noreply@elibrary.com>',
        to: user.email,
        subject: template.subject,
        html: template.html
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Overdue notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending overdue notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Send book returned confirmation
  sendBookReturnedConfirmation: async (user, book, fine = 0) => {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.bookReturned(user, book, fine);
      
      const mailOptions = {
        from: '"E-Library System" <noreply@elibrary.com>',
        to: user.email,
        subject: template.subject,
        html: template.html
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Book returned confirmation sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending book returned confirmation:', error);
      return { success: false, error: error.message };
    }
  },

  // Send welcome email
  sendWelcomeEmail: async (user) => {
    try {
      const transporter = createTransporter();
      const template = emailTemplates.welcomeEmail(user);
      
      const mailOptions = {
        from: '"E-Library System" <noreply@elibrary.com>',
        to: user.email,
        subject: template.subject,
        html: template.html
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;
