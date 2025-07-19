const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Rating must be a whole number'
    }
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [1000, 'Review cannot exceed 1000 characters'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    minlength: [5, 'Review title must be at least 5 characters long'],
    maxlength: [100, 'Review title cannot exceed 100 characters'],
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve reviews, can be changed to false for moderation
  },
  isHelpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: {
      type: Boolean,
      default: true
    }
  }],
  helpfulCount: {
    type: Number,
    default: 0
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'offensive', 'fake', 'other'],
      required: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isReported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ book: 1, isApproved: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  if (this.isHelpful.length === 0) return 0;
  const helpfulVotes = this.isHelpful.filter(vote => vote.helpful).length;
  return Math.round((helpfulVotes / this.isHelpful.length) * 100);
});

// Update helpful count before saving
reviewSchema.pre('save', function(next) {
  if (this.isModified('isHelpful')) {
    this.helpfulCount = this.isHelpful.filter(vote => vote.helpful).length;
  }
  next();
});

// Static method to calculate average rating for a book
reviewSchema.statics.calculateAverageRating = async function(bookId) {
  const result = await this.aggregate([
    {
      $match: {
        book: new mongoose.Types.ObjectId(bookId),
        isApproved: true
      }
    },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length > 0) {
    const stats = result[0];
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    return {
      averageRating: Math.round(stats.averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: stats.totalReviews,
      ratingDistribution: distribution
    };
  }

  return {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };
};

module.exports = mongoose.model('Review', reviewSchema);
