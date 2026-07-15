const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  cover: {
    type: String,
    default: ''
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: [
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Fantasy',
      'Science Fiction', 'Biography', 'Self-Help', 'History',
      'Children', 'Young Adult', 'Thriller', 'Literary Fiction',
      'Philosophy', 'Psychology', 'Business', 'Poetry', 'Other'
    ]
  },
  language: {
    type: String,
    default: 'English',
    enum: ['English', 'Hindi', 'Marathi', 'Other']
  },
  isbn: {
    type: String,
    default: ''
  },
  publisher: {
    type: String,
    default: ''
  },
  publishedYear: {
    type: Number
  },
  pages: {
    type: Number
  },
  condition: {
    type: String,
    enum: ['New', 'Good', 'Fair'],
    default: 'Good'
  },
  pricePerWeek: {
    type: Number,
    required: [true, 'Price per week is required'],
    min: [10, 'Minimum price is ₹10'],
    max: [100, 'Maximum price is ₹100']
  },
  totalCopies: {
    type: Number,
    default: 1,
    min: 1
  },
  availableCopies: {
    type: Number,
    default: 1,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalRentals: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bookSchema.virtual('isAvailable').get(function () {
  return this.availableCopies > 0;
});

bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Book', bookSchema);
