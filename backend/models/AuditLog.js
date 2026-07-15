const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['User', 'Rental', 'SupportTicket', 'Task', 'Campaign', 'Segment', 'Hub']
  },
  beforeValues: {
    type: mongoose.Schema.Types.Mixed
  },
  afterValues: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
