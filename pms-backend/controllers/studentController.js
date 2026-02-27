const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (admin, mentor)
const getAllStudents = async (req, res) => {
  try {
    const { department, search, page = 1, limit = 50 } = req.query;

    const query = { role: 'student' };

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .populate('groupId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: students.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: students,
    });
  } catch (error) {
    console.error('getAllStudents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password')
      .populate('groupId');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('getStudentById error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (admin, mentor)
const updateStudent = async (req, res) => {
  try {
    const { name, email, enrollmentNumber, rollNumber, department, division, className, groupId } = req.body;

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (enrollmentNumber) student.enrollmentNumber = enrollmentNumber;
    if (rollNumber) student.rollNumber = rollNumber;
    if (department) student.department = department;
    if (division) student.division = division;
    if (className) student.className = className;
    if (groupId) student.groupId = groupId;

    await student.save();

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('updateStudent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (admin)
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.deleteOne();

    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    console.error('deleteStudent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
