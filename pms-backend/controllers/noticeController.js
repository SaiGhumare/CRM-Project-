const Notice = require('../models/Notice');

// @desc    Create a notice (manual entry)
// @route   POST /api/notices
// @access  Private (admin)
const createNotice = async (req, res) => {
  try {
    const { title, purpose, startDate, dueDate } = req.body;

    const notice = await Notice.create({
      title,
      purpose,
      startDate,
      dueDate,
      type: 'manual',
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    console.error('createNotice error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload a notice file
// @route   POST /api/notices/upload
// @access  Private (admin)
const uploadNotice = async (req, res) => {
  try {
    const { title, purpose, startDate, dueDate } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const notice = await Notice.create({
      title: title || req.file.originalname,
      purpose: purpose || 'See attached file',
      startDate,
      dueDate,
      type: 'file',
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    console.error('uploadNotice error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('createdBy', '-password')
      .populate('targetGuides', '-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    console.error('getAllNotices error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send a notice (mark as sent to students/guides)
// @route   PUT /api/notices/:id/send
// @access  Private (admin)
const sendNotice = async (req, res) => {
  try {
    const { sendToStudents, sendToGuides, targetGroups, targetGuides } = req.body;

    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (sendToStudents !== undefined) notice.sentToStudents = sendToStudents;
    if (sendToGuides !== undefined) notice.sentToGuides = sendToGuides;
    if (targetGroups) notice.targetGroups = targetGroups;
    if (targetGuides) notice.targetGuides = targetGuides;

    await notice.save();

    const updated = await Notice.findById(notice._id)
      .populate('createdBy', '-password')
      .populate('targetGuides', '-password');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('sendNotice error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (admin)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await notice.deleteOne();
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    console.error('deleteNotice error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createNotice,
  uploadNotice,
  getAllNotices,
  sendNotice,
  deleteNotice,
};
