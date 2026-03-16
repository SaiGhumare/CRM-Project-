const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'report',
      'synopsis',
      'ppt',
      'ppt_stage_one',
      'ppt_final',
      'black_book',
      'weekly_diary',
      'sponsorship_letter',
      'final_report',
      'first_project_report',
      'itr_report',
      'offer_letter',
      'github_link',
    ],
    required: [true, 'Please specify document type'],
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
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentGroup',
    required: [true, 'Please specify a group'],
  },
  stage: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
  },
  status: {
    type: String,
    enum: ['not_submitted', 'pending', 'approved', 'needs_correction', 'verified', 'verifying'],
    default: 'pending',
  },
  feedback: {
    type: String,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);
