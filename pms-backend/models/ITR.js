const mongoose = require('mongoose');

const dailyDetailSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
    min: 0,
    max: 24,
  },
}, { _id: true });

const itrSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify a student'],
  },
  companyName: {
    type: String,
    required: [true, 'Please add company name'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Please add start date'],
  },
  endDate: {
    type: Date,
  },
  dailyDetails: [dailyDetailSchema],
  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing',
  },
  coordinatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  offerLetter: {
    url: String,
    fileName: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  projectReport: {
    url: String,
    fileName: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  certificate: {
    url: String,
    fileName: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ITR', itrSchema);
