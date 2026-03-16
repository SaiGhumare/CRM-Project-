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
      stage: stage ? parseInt(stage) : 1,
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

// @desc    Upload a link (e.g., GitHub Link for Stage 3)
// @route   POST /api/documents/link
// @access  Private (student)
const uploadLink = async (req, res) => {
  try {
    const { type, groupId, stage, link } = req.body;

    if (!link) {
      return res.status(400).json({ message: 'Please provide a valid link' });
    }

    const doc = await Document.create({
      type,
      fileName: link, // Reusing fileName to store the display text or url
      fileUrl: link,  // Storing the actual URL here
      uploadedBy: req.user.id,
      groupId,
      stage: stage ? parseInt(stage) : 3,
    });

    const populated = await Document.findById(doc._id)
      .populate('uploadedBy', '-password')
      .populate('groupId');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('uploadLink error:', error);
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
      .sort({ stage: 1, createdAt: -1 });

    res.json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    console.error('getDocumentsByGroup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getSingleDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('uploadedBy', '-password')
      .populate('reviewedBy', '-password');
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error('getSingleDocument error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Document types per stage — used for progress calculation
const STAGE_1_TYPES = new Set(['synopsis', 'ppt_stage_one', 'first_project_report', 'weekly_diary']);
const STAGE_2_TYPES = new Set(['ppt_final', 'final_report', 'black_book', 'sponsorship_letter']);
const STAGE_3_TYPES = new Set(['github_link']);

// Recalculate and persist group progress after a review action
const recalculateGroupProgress = async (groupId) => {
  const docs = await Document.find({ groupId });

  const approvedStage1Types = new Set(
    docs
      .filter(d => d.stage === 1 && d.status === 'approved' && STAGE_1_TYPES.has(d.type))
      .map(d => d.type)
  );

  const approvedStage2Types = new Set(
    docs
      .filter(d => d.stage === 2 && d.status === 'approved' && STAGE_2_TYPES.has(d.type))
      .map(d => d.type)
  );

  const approvedStage3Types = new Set(
    docs
      .filter(d => d.stage === 3 && d.status === 'approved' && STAGE_3_TYPES.has(d.type))
      .map(d => d.type)
  );

  const stage1Complete = approvedStage1Types.size >= STAGE_1_TYPES.size;
  // For stage 2, weekly_diary is not a required document for completion, it's an ongoing submission.
  // So, we remove 'weekly_diary' from STAGE_2_TYPES for completion check.
  const stage2CompletionTypes = new Set([...STAGE_2_TYPES].filter(type => type !== 'weekly_diary'));
  const stage2Complete = approvedStage2Types.size >= stage2CompletionTypes.size;
  const stage3Complete = approvedStage3Types.size >= STAGE_3_TYPES.size;

  const group = await StudentGroup.findById(groupId);
  if (!group) return;

  let newProgress = group.overallProgress;
  if (stage3Complete) {
    newProgress = 100; // 100% when Stage 3 (GitHub link) is approved
  } else if (stage2Complete) {
    newProgress = Math.max(group.overallProgress, 99); // 99% for stage 2 completion
  } else if (stage1Complete) {
    newProgress = Math.max(group.overallProgress, 50); // 50% for stage 1 completion
  }

  if (newProgress !== group.overallProgress) {
    group.overallProgress = newProgress;
    await group.save();
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
    doc.feedback = feedback || '';
    doc.reviewedBy = req.user.id;
    doc.reviewedAt = Date.now();
    await doc.save();

    // Recalculate group progress after each review
    await recalculateGroupProgress(doc.groupId);

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
// @access  Private (admin, any group member)
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Admins can always delete
    if (req.user.role === 'admin') {
      await doc.deleteOne();
      return res.json({ success: true, message: 'Document deleted' });
    }

    // For students, allow any member of the same group to delete
    if (req.user.role === 'student') {
      const group = await StudentGroup.findById(doc.groupId);
      if (group && group.members.map(m => m.toString()).includes(req.user.id)) {
        await doc.deleteOne();
        return res.json({ success: true, message: 'Document deleted' });
      }
    }

    return res.status(403).json({ message: 'Not authorized to delete this document' });
  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  uploadDocument,
  uploadLink,
  getAllDocuments,
  getDocumentsByGroup,
  getSingleDocument,
  reviewDocument,
  deleteDocument,
};
