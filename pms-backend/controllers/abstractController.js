const Abstract = require('../models/Abstract');
const StudentGroup = require('../models/StudentGroup');

// @desc    Submit an abstract
// @route   POST /api/abstracts
// @access  Private (student)
const submitAbstract = async (req, res) => {
  try {
    const { title, description, groupId } = req.body;

    // Check if group already has 3 abstracts
    const abstractCount = await Abstract.countDocuments({ groupId });
    if (abstractCount >= 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum limit of 3 abstracts reached for this group.' 
      });
    }

    // Check if group already has an approved abstract
    const approvedExists = await Abstract.findOne({ groupId, status: 'approved' });
    if (approvedExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Your group already has an approved abstract. No more submissions allowed.' 
      });
    }

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

    // Filter by academic year, department, and/or mentor through group
    const groupQuery = {};
    let filterByGroup = false;

    if (academicYear) { groupQuery.academicYear = academicYear; filterByGroup = true; }
    if (department) { groupQuery.department = department; filterByGroup = true; }
    
    // Mentor role can only see abstracts from their assigned groups
    if (req.user && req.user.role === 'mentor') {
      groupQuery.mentorId = req.user.id;
      filterByGroup = true;
    }

    if (filterByGroup) {
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

    // If approved, handle side effects
    if (status === 'approved') {
      // 1. Automatically reject all other pending/rejected abstracts for this group
      await Abstract.updateMany(
        { 
          groupId: abstract.groupId, 
          _id: { $ne: abstract._id } 
        },
        { 
          status: 'rejected', 
          feedback: 'This group already has an approved abstract.',
          reviewedBy: req.user.id,
          reviewedAt: Date.now()
        }
      );

      // 2. Set the group's project title to this abstract's title
      // 3. Increase progress by 10% (only on first approval)
      const alreadyApprovedCount = await Abstract.countDocuments({
        groupId: abstract.groupId,
        status: 'approved',
        _id: { $ne: abstract._id },
      });

      await StudentGroup.findByIdAndUpdate(abstract.groupId, {
        $set: { projectTitle: abstract.title },
        ...(alreadyApprovedCount === 0 ? { $inc: { overallProgress: 10 } } : {})
      });
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
