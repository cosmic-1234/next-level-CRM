const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Segment name is required'],
    trim: true,
    maxlength: 100,
    unique: true
  },
  filterCriteria: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  memberCount: {
    type: Number,
    default: 0
  },
  autoRefresh: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Segment', segmentSchema);
