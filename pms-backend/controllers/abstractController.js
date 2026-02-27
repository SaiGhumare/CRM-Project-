const Abstract = require('../models/Abstract');

// @desc    Submit an abstract
// @route   POST /api/abstracts
// @access  Private (student)
const submitAbstract = async (req, res) => {
  try {
    const { title, description, groupId } = req.body;

    const abstract = await Abstract.create({
      title,
      description,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      groupId,
      submittedBy: req.user.id,
    });

    const populated = await Abstract.findById(abstract._id)
      .populate('groupId')
      .populate('submittedBy', '-password');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('submitAbstract error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all abstracts
// @route   GET /api/abstracts
// @access  Private
const getAllAbstracts = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const abstracts = await Abstract.find(query)
      .populate('groupId')
      .populate('submittedBy', '-password')
      .populate('reviewedBy', '-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: abstracts.length, data: abstracts });
  } catch (error) {
    console.error('getAllAbstracts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get abstracts by group
// @route   GET /api/abstracts/group/:groupId
// @access  Private
const getAbstractsByGroup = async (req, res) => {
  try {
    const abstracts = await Abstract.find({ groupId: req.params.groupId })
      .populate('groupId')
      .populate('submittedBy', '-password')
      .populate('reviewedBy', '-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: abstracts.length, data: abstracts });
  } catch (error) {
    console.error('getAbstractsByGroup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Review abstract (approve/reject)
// @route   PUT /api/abstracts/:id/review
// @access  Private (admin, mentor)
const reviewAbstract = async (req, res) => {
  try {
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "approved" or "rejected"' });
    }

    const abstract = await Abstract.findById(req.params.id);
    if (!abstract) {
      return res.status(404).json({ message: 'Abstract not found' });
    }

    abstract.status = status;
    abstract.feedback = feedback;
    abstract.reviewedBy = req.user.id;
    abstract.reviewedAt = Date.now();
    await abstract.save();

    const updated = await Abstract.findById(abstract._id)
      .populate('groupId')
      .populate('submittedBy', '-password')
      .populate('reviewedBy', '-password');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('reviewAbstract error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  submitAbstract,
  getAllAbstracts,
  getAbstractsByGroup,
  reviewAbstract,
};
