const User = require('../models/User');
const StudentGroup = require('../models/StudentGroup');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Private
const getAllMentors = async (req, res) => {
  try {
    const { department } = req.query;
    const query = { role: 'mentor' };

    if (department) query.department = department;

    const mentors = await User.find(query).select('-password');

    res.json({ success: true, count: mentors.length, data: mentors });
  } catch (error) {
    console.error('getAllMentors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get groups assigned to a mentor
// @route   GET /api/mentors/:id/groups
// @access  Private
const getMentorGroups = async (req, res) => {
  try {
    const groups = await StudentGroup.find({ mentorId: req.params.id })
      .populate('members', '-password')
      .populate('mentorId', '-password')
      .sort({ name: 1 });

    res.json({ success: true, count: groups.length, data: groups });
  } catch (error) {
    console.error('getMentorGroups error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Assign mentor to a group
// @route   PUT /api/mentors/assign
// @access  Private (admin)
const assignMentorToGroup = async (req, res) => {
  try {
    const { mentorId, groupId } = req.body;

    // Verify mentor exists and has mentor role
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    const group = await StudentGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.mentorId = mentorId;
    group.projectGuide = mentor.name;
    await group.save();

    const updated = await StudentGroup.findById(group._id)
      .populate('members', '-password')
      .populate('mentorId', '-password');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('assignMentorToGroup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllMentors,
  getMentorGroups,
  assignMentorToGroup,
};
