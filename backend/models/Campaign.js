const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: 100
  },
  channel: {
    type: String,
    enum: ['email', 'SMS', 'WhatsApp', 'push'],
    required: true
  },
  targetSegment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segment',
    required: true
  },
  template: {
    subject: { type: String, default: '' },
    body: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date
  },
  sentDate: {
    type: Date
  },
  stats: {
    sent: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    converted: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
