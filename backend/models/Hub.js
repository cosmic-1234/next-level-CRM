const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive']
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: false });

const hubSchema = new mongoose.Schema({
  hostUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    enum: [
      'Dharampeth', 'Sitabuldi', 'Gandhibagh', 'Sadar', 'Civil Lines',
      'Ramdaspeth', 'Bajaj Nagar', 'Manewada', 'Wardha Road',
      'Amravati Road', 'Hingna', 'Katol Road', 'Other'
    ]
  },
  address: {
    type: String,
    required: [true, 'Full address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters'],
    default: ''
  },

  // CRM Extended Fields
  performanceStats: {
    rentalsRouted: {
      type: Number,
      default: 0
    },
    activeRenters: {
      type: Number,
      default: 0
    }
  },
  statusHistory: [statusHistorySchema],
  agreementNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hub', hubSchema);
