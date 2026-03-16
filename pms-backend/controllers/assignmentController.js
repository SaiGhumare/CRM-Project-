const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');

// @desc    Create an assignment (ITR Coordinator)
// @route   POST /api/assignments
// @access  Private (itr_coordinator)
const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an assignment PDF file' });
    }
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const assignment = await Assignment.create({
      title,
      description: description || '',
      dueDate: dueDate || null,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      createdBy: req.user.id,
    });

    const populated = await Assignment.findById(assignment._id).populate('createdBy', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('createAssignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private (all authenticated)
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    console.error('getAssignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private (itr_coordinator)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    await assignment.deleteOne();
    // Also delete all submissions for this assignment
    await AssignmentSubmission.deleteMany({ assignmentId: req.params.id });
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    console.error('deleteAssignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Submit a completed assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (student)
const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload your submission file' });
    }

    // Check if student already has a submission
    const existing = await AssignmentSubmission.findOne({
      assignmentId: req.params.id,
      uploadedBy: req.user.id,
    });

    if (existing) {
      return res.status(400).json({
        message: 'You already have a submission for this assignment. Delete it first to re-submit.',
      });
    }

    const submission = await AssignmentSubmission.create({
      assignmentId: req.params.id,
      uploadedBy: req.user.id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
    });

    const populated = await AssignmentSubmission.findById(submission._id)
      .populate('uploadedBy', 'name enrollmentNumber')
      .populate('assignmentId', 'title');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('submitAssignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my submissions (student)
// @route   GET /api/assignments/submissions/me
// @access  Private (student)
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ uploadedBy: req.user.id })
      .populate('assignmentId', 'title description dueDate')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: submissions });
  } catch (error) {
    console.error('getMySubmissions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all submissions (itr_coordinator)
// @route   GET /api/assignments/submissions
// @access  Private (itr_coordinator, admin)
const getAllSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.query;
    const query = assignmentId ? { assignmentId } : {};

    const submissions = await AssignmentSubmission.find(query)
      .populate('uploadedBy', 'name enrollmentNumber department')
      .populate('assignmentId', 'title')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    console.error('getAllSubmissions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Review a submission
// @route   PUT /api/assignments/submissions/:id/review
// @access  Private (itr_coordinator, admin)
const reviewSubmission = async (req, res) => {
  try {
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    if (status === 'rejected' && !feedback?.trim()) {
      return res.status(400).json({ message: 'Feedback is required when rejecting a submission' });
    }

    const submission = await AssignmentSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.status = status;
    submission.feedback = feedback || '';
    submission.reviewedBy = req.user.id;
    await submission.save();

    const updated = await AssignmentSubmission.findById(submission._id)
      .populate('uploadedBy', 'name enrollmentNumber')
      .populate('assignmentId', 'title')
      .populate('reviewedBy', 'name');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('reviewSubmission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete own submission (student)
// @route   DELETE /api/assignments/submissions/:id
// @access  Private (student)
const deleteSubmission = async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    if (submission.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this submission' });
    }
    await submission.deleteOne();
    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    console.error('deleteSubmission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  deleteAssignment,
  submitAssignment,
  getMySubmissions,
  getAllSubmissions,
  reviewSubmission,
  deleteSubmission,
};
