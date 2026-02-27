const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  purpose: {
    type: String,
    required: [true, 'Please add the purpose'],
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  type: {
    type: String,
    enum: ['manual', 'file'],
    default: 'manual',
  },
  fileName: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String,
  },
  sentToStudents: {
    type: Boolean,
    default: false,
  },
  sentToGuides: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetGroups: [{
    type: String,
  }],
  targetGuides: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notice', noticeSchema);
