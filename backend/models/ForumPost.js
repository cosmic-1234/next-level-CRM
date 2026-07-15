const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true,
    maxlength: 500
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  body: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Post cannot exceed 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null
  },
  category: {
    type: String,
    enum: ['Discussion', 'Recommendation', 'Review', 'Question', 'General'],
    default: 'Discussion'
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

forumPostSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

forumPostSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

forumPostSchema.index({ title: 'text', body: 'text', tags: 'text' });

module.exports = mongoose.model('ForumPost', forumPostSchema);
