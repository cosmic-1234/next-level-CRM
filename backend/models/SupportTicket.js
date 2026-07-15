const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true
  },
  isInternal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const supportTicketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    enum: ['damaged book', 'late fee dispute', 'delivery issue', 'payment', 'account', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'waiting-on-user', 'resolved', 'closed'],
    default: 'open'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    default: null
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  messages: [ticketMessageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
