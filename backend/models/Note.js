const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, 'Note body is required'],
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
