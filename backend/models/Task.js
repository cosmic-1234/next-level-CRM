const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket',
    default: null
  },
  hub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hub',
    default: null
  },
  reminder: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
