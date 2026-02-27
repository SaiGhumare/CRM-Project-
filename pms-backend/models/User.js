const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'mentor', 'student', 'itr_coordinator'],
    required: [true, 'Please specify a role'],
  },
  enrollmentNumber: {
    type: String,
    trim: true,
  },
  rollNumber: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    enum: ['CO', 'IT', 'EE', 'CE', 'ME'],
  },
  division: {
    type: String,
    trim: true,
  },
  className: {
    type: String,
    trim: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentGroup',
  },
  avatarUrl: {
    type: String,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', userSchema);
