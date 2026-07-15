const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    area: { type: String, default: '' },
    city: { type: String, default: 'Nagpur' },
    pincode: { type: String, default: '' }
  },
  preferDelivery: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    default: '',
    maxlength: [200, 'Bio cannot exceed 200 characters']
  },
  currentlyReading: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null
  },
  readingHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  totalBooksRead: {
    type: Number,
    default: 0
  },
  readingChallengeYear: {
    type: Number,
    default: new Date().getFullYear()
  },
  readingChallengeGoal: {
    type: Number,
    default: 0
  },

  // CRM Extended Fields
  lifecycleStage: {
    type: String,
    enum: ['lead', 'active', 'at-risk', 'churned', 'vip'],
    default: 'lead'
  },
  acquisitionSource: {
    type: String,
    default: 'organic'
  },
  assignedOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  lifetimeValue: {
    type: Number,
    default: 0
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
