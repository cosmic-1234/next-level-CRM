const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  comments: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    required: true
  },
  followUp: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
