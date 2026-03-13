const Abstract = require('../models/Abstract');
const StudentGroup = require('../models/StudentGroup');

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
    const { status, academicYear, department } = req.query;
    const query = {};
    if (status) query.status = status;

    // Filter by academic year and/or department through group
    if (academicYear || department) {
      const groupQuery = {};
      if (academicYear) groupQuery.academicYear = academicYear;
      if (department) groupQuery.department = department;
      const groups = await StudentGroup.find(groupQuery).select('_id');
      query.groupId = { $in: groups.map(g => g._id) };
    }

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

    // If approved, bump group progress (only on the first approved abstract for this group)
    if (status === 'approved') {
      const alreadyApproved = await Abstract.countDocuments({
        groupId: abstract.groupId,
        status: 'approved',
        _id: { $ne: abstract._id },
      });
      if (alreadyApproved === 0) {
        // First abstract approval — increase progress by 20%
        await StudentGroup.findByIdAndUpdate(abstract.groupId, {
          $inc: { overallProgress: 20 },
        });
      }
    }

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

// @desc    Delete an abstract
// @route   DELETE /api/abstracts/:id
// @access  Private (admin, student who uploaded)
const deleteAbstract = async (req, res) => {
  try {
    const abstract = await Abstract.findById(req.params.id);
    if (!abstract) {
      return res.status(404).json({ message: 'Abstract not found' });
    }

    // Only admin or the uploader can delete
    if (req.user.role !== 'admin' && abstract.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this abstract' });
    }

    await abstract.deleteOne();
    res.json({ success: true, message: 'Abstract deleted' });
  } catch (error) {
    console.error('deleteAbstract error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  submitAbstract,
  getAllAbstracts,
  getAbstractsByGroup,
  reviewAbstract,
  deleteAbstract,
};
