const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    match: [/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/, 'Please enter a valid ISBN']
  },
  publisher: {
    type: String,
    required: [true, 'Publisher is required'],
    trim: true,
    maxlength: [100, 'Publisher name cannot be more than 100 characters']
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: [-3000, 'Published year must be a valid year'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Fiction',
      'Non-Fiction',
      'Science',
      'Technology',
      'History',
      'Biography',
      'Education',
      'Literature',
      'Business',
      'Health',
      'Arts',
      'Religion',
      'Philosophy',
      'Other'
    ]
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies is required'],
    min: [1, 'Total copies must be at least 1']
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies is required'],
    min: [0, 'Available copies cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.totalCopies;
      },
      message: 'Available copies cannot exceed total copies'
    }
  },
  language: {
    type: String,
    default: 'English',
    maxlength: [50, 'Language cannot be more than 50 characters']
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  coverImage: {
    type: String,
    default: ''
  },
  location: {
    shelf: {
      type: String,
      required: [true, 'Shelf location is required']
    },
    section: {
      type: String,
      required: [true, 'Section is required']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
bookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search functionality
bookSchema.index({
  title: 'text',
  author: 'text',
  isbn: 'text',
  publisher: 'text',
  category: 'text'
});

module.exports = mongoose.model('Book', bookSchema);
