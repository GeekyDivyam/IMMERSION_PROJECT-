const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  borrowDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value) {
        return value > this.borrowDate;
      },
      message: 'Due date must be after borrow date'
    }
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed'
  },
  fine: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Fine amount cannot be negative']
    },
    paid: {
      type: Boolean,
      default: false
    },
    paidDate: {
      type: Date,
      default: null
    }
  },
  renewalCount: {
    type: Number,
    default: 0,
    max: [2, 'Maximum 2 renewals allowed']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  returnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
borrowRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-calculate overdue status
  if (this.status === 'borrowed' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  
  next();
});

// Calculate fine for overdue books
borrowRecordSchema.methods.calculateFine = function() {
  if (this.status === 'overdue' || (this.returnDate && this.returnDate > this.dueDate)) {
    const overdueDays = Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
    const finePerDay = 5; // $5 per day
    this.fine.amount = Math.max(0, overdueDays * finePerDay);
  }
  return this.fine.amount;
};

// Index for efficient queries
borrowRecordSchema.index({ user: 1, status: 1 });
borrowRecordSchema.index({ book: 1, status: 1 });
borrowRecordSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
