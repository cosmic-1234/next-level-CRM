const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  weeksDuration: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  totalCost: {
    type: Number,
    required: true
  },
  deliveryType: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'pickup'
  },
  deliveryAddress: {
    area: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'returned', 'overdue', 'cancelled'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    default: ''
  },
  userNote: {
    type: String,
    default: ''
  },
  rentedAt: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  returnedAt: {
    type: Date
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

rentalSchema.virtual('daysRemaining').get(function () {
  if (!this.dueDate || this.status === 'returned') return null;
  return Math.ceil((this.dueDate - Date.now()) / (1000 * 60 * 60 * 24));
});

rentalSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'returned') return false;
  return Date.now() > this.dueDate;
});

module.exports = mongoose.model('Rental', rentalSchema);
