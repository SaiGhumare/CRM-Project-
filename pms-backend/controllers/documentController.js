const Document = require('../models/Document');
const StudentGroup = require('../models/StudentGroup');
const mongoose = require('mongoose');

// @desc    Upload a document
// @route   POST /api/documents
// @access  Private (student)
const uploadDocument = async (req, res) => {
  try {
    const { type, groupId, stage } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const doc = await Document.create({
      type,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      groupId,
      stage: stage || 1,
    });

    const populated = await Document.findById(doc._id)
      .populate('uploadedBy', '-password')
      .populate('groupId');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('uploadDocument error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
const getAllDocuments = async (req, res) => {
  try {
    const { type, stage, groupId, status, academicYear, department } = req.query;
    const query = {};

    if (type) query.type = type;
    if (stage) query.stage = parseInt(stage);
    // Only filter by groupId if it's a valid MongoDB ObjectId
    if (groupId && mongoose.Types.ObjectId.isValid(groupId)) query.groupId = groupId;
    if (status) query.status = status;

    // Filter by academic year, department, and/or mentor through group
    const groupQuery = {};
    let filterByGroup = false;

    if (academicYear) { groupQuery.academicYear = academicYear; filterByGroup = true; }
    if (department) { groupQuery.department = department; filterByGroup = true; }
    
    // Mentor role can only see documents from their assigned groups
    if (req.user && req.user.role === 'mentor') {
      groupQuery.mentorId = req.user.id;
      filterByGroup = true;
    }

    if (filterByGroup) {
      const groups = await StudentGroup.find(groupQuery).select('_id');
      query.groupId = { $in: groups.map(g => g._id) };
    }

    const docs = await Document.find(query)
      .populate('uploadedBy', '-password')
      .populate('groupId')
      .populate('reviewedBy', '-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    console.error('getAllDocuments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get documents by group
// @route   GET /api/documents/group/:groupId
// @access  Private
const getDocumentsByGroup = async (req, res) => {
  try {
    const docs = await Document.find({ groupId: req.params.groupId })
      .populate('uploadedBy', '-password')
      .populate('reviewedBy', '-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    console.error('getDocumentsByGroup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Review document (approve/reject/needs_correction)
// @route   PUT /api/documents/:id/review
// @access  Private (admin, mentor)
const reviewDocument = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const validStatuses = ['approved', 'needs_correction', 'verified'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    doc.status = status;
    doc.feedback = feedback;
    doc.reviewedBy = req.user.id;
    doc.reviewedAt = Date.now();
    await doc.save();

    const updated = await Document.findById(doc._id)
      .populate('uploadedBy', '-password')
      .populate('groupId')
      .populate('reviewedBy', '-password');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('reviewDocument error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (admin, student who uploaded)
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only admin or the uploader can delete
    if (req.user.role !== 'admin' && doc.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    await doc.deleteOne();
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocumentsByGroup,
  reviewDocument,
  deleteDocument,
};
