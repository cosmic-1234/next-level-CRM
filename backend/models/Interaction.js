const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['call', 'email', 'WhatsApp', 'in-app note', 'visit'],
    required: true
  },
  channel: {
    type: String,
    required: true
  },
  direction: {
    type: String,
    enum: ['in', 'out'],
    default: 'out'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  summary: {
    type: String,
    required: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Interaction', interactionSchema);
