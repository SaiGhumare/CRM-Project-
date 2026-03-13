const StudentGroup = require('../models/StudentGroup');
const User = require('../models/User');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private (admin, mentor)
const createGroup = async (req, res) => {
  try {
    const { name, projectTitle, projectGuide, members, mentorId, academicYear, department } = req.body;

    const group = await StudentGroup.create({
      name,
      projectTitle,
      projectGuide,
      members,
      mentorId,
      academicYear,
      department,
    });

    // Update groupId for each member
    if (members && members.length > 0) {
      await User.updateMany(
        { _id: { $in: members } },
        { groupId: group._id }
      );
    }

    const populatedGroup = await StudentGroup.findById(group._id)
      .populate('members', '-password')
      .populate('mentorId', '-password');

    res.status(201).json({ success: true, data: populatedGroup });
  } catch (error) {
    console.error('createGroup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
const getAllGroups = async (req, res) => {
  try {
    const { department, academicYear, search } = req.query;
    const query = {};

    if (department) query.department = department;
    if (academicYear) query.academicYear = academicYear;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } },
      ];
    }

    // Mentor role can only see their assigned groups
    if (req.user && req.user.role === 'mentor') {
      query.mentorId = req.user.id;
    }

    const groups = await StudentGroup.find(query)
      .populate('members', '-password')
      .populate('mentorId', '-password')
      .sort({ name: 1 });

    res.json({ success: true, count: groups.length, data: groups });
  } catch (error) {
    console.error('getAllGroups error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student's group
// @route   GET /api/groups/student/:userId
// @access  Private
const getStudentGroup = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user || !user.groupId) {
      return res.status(404).json({ message: 'Student is not assigned to any group' });
    }

    const group = await StudentGroup.findById(user.groupId)
      .populate('members', '-password')
      .populate('mentorId', '-password');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ success: true, group });
  } catch (error) {
    console.error('getStudentGroup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
  try {
    const group = await StudentGroup.findById(req.params.id)
      .populate('members', '-password')
      .populate('mentorId', '-password');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    console.error('getGroupById error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (admin, mentor)
const updateGroup = async (req, res) => {
  try {
    const { name, projectTitle, projectGuide, mentorId, academicYear, department, overallProgress } = req.body;

    const group = await StudentGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (name) group.name = name;
    if (projectTitle) group.projectTitle = projectTitle;
    if (projectGuide) group.projectGuide = projectGuide;
    if (mentorId) group.mentorId = mentorId;
    if (academicYear) group.academicYear = academicYear;
    if (department) group.department = department;
    if (overallProgress !== undefined) group.overallProgress = overallProgress;

    await group.save();

    const updatedGroup = await StudentGroup.findById(group._id)
      .populate('members', '-password')
      .populate('mentorId', '-password');

    res.json({ success: true, data: updatedGroup });
  } catch (error) {
    console.error('updateGroup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (admin)
const deleteGroup = async (req, res) => {
  try {
    const group = await StudentGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Remove groupId from all members
    await User.updateMany(
      { _id: { $in: group.members } },
      { $unset: { groupId: '' } }
    );

    await group.deleteOne();
    res.json({ success: true, message: 'Group deleted' });
  } catch (error) {
    console.error('deleteGroup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private (admin, mentor)
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await StudentGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }

    group.members.push(userId);
    await group.save();

    // Update user's groupId
    await User.findByIdAndUpdate(userId, { groupId: group._id });

    const updatedGroup = await StudentGroup.findById(group._id)
      .populate('members', '-password')
      .populate('mentorId', '-password');

    res.json({ success: true, data: updatedGroup });
  } catch (error) {
    console.error('addMember error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private (admin, mentor)
const removeMember = async (req, res) => {
  try {
    const group = await StudentGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.members = group.members.filter(m => m.toString() !== req.params.userId);
    await group.save();

    // Remove groupId from user
    await User.findByIdAndUpdate(req.params.userId, { $unset: { groupId: '' } });

    const updatedGroup = await StudentGroup.findById(group._id)
      .populate('members', '-password')
      .populate('mentorId', '-password');

    res.json({ success: true, data: updatedGroup });
  } catch (error) {
    console.error('removeMember error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  getStudentGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
};
