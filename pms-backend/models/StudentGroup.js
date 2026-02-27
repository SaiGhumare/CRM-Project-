const mongoose = require('mongoose');

const studentGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a group name'],
    trim: true,
  },
  projectTitle: {
    type: String,
    trim: true,
  },
  projectGuide: {
    type: String,
    trim: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  academicYear: {
    type: String,
    required: [true, 'Please add an academic year'],
    trim: true,
  },
  department: {
    type: String,
    enum: ['CO', 'IT', 'EE', 'CE', 'ME'],
    required: [true, 'Please specify a department'],
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudentGroup', studentGroupSchema);
