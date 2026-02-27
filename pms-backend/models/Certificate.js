const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['itr_certificate', 'published_paper', 'project_competition', 'udemy_course'],
    required: [true, 'Please specify certificate type'],
  },
  fileName: {
    type: String,
    required: [true, 'Please add a file name'],
    trim: true,
  },
  fileUrl: {
    type: String,
    required: [true, 'Please add a file URL'],
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Certificate', certificateSchema);
