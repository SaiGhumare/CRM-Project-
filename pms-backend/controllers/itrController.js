const ITR = require('../models/ITR');
const User = require('../models/User');

// @desc    Create an ITR record
// @route   POST /api/itr
// @access  Private (student)
const createITR = async (req, res) => {
  try {
    const { companyName, startDate, endDate, coordinatorId } = req.body;

    const itr = await ITR.create({
      studentId: req.user.id,
      companyName,
      startDate,
      endDate,
      coordinatorId,
    });

    const populated = await ITR.findById(itr._id)
      .populate('studentId', '-password')
      .populate('coordinatorId', '-password');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('createITR error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all ITR records
// @route   GET /api/itr
// @access  Private (admin, itr_coordinator)
const getAllITR = async (req, res) => {
  try {
    const { status, academicYear, department } = req.query;
    const query = {};
    if (status) query.status = status;

    // Filter by academic year and/or department through student
    if (academicYear || department) {
      const studentQuery = { role: 'student' };
      if (academicYear) studentQuery.academicYear = academicYear;
      if (department) studentQuery.department = department;
      const students = await User.find(studentQuery).select('_id');
      query.studentId = { $in: students.map(s => s._id) };
    }

    const records = await ITR.find(query)
      .populate('studentId', '-password')
      .populate('coordinatorId', '-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    console.error('getAllITR error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my ITR record
// @route   GET /api/itr/me
// @access  Private (student)
const getMyITR = async (req, res) => {
  try {
    const records = await ITR.find({ studentId: req.user.id })
      .populate('coordinatorId', '-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    console.error('getMyITR error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update ITR record
// @route   PUT /api/itr/:id
// @access  Private (student, itr_coordinator)
const updateITR = async (req, res) => {
  try {
    const { companyName, startDate, endDate, status } = req.body;

    const itr = await ITR.findById(req.params.id);
    if (!itr) {
      return res.status(404).json({ message: 'ITR record not found' });
    }

    // Only the student or coordinator can update
    if (req.user.role === 'student' && itr.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (companyName) itr.companyName = companyName;
    if (startDate) itr.startDate = startDate;
    if (endDate) itr.endDate = endDate;
    if (status) itr.status = status;

    await itr.save();

    const updated = await ITR.findById(itr._id)
      .populate('studentId', '-password')
      .populate('coordinatorId', '-password');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('updateITR error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add daily detail to ITR
// @route   POST /api/itr/:id/daily
// @access  Private (student)
const addDailyDetail = async (req, res) => {
  try {
    const { date, description, hours } = req.body;

    const itr = await ITR.findById(req.params.id);
    if (!itr) {
      return res.status(404).json({ message: 'ITR record not found' });
    }

    if (itr.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    itr.dailyDetails.push({ date, description, hours });
    await itr.save();

    const updated = await ITR.findById(itr._id)
      .populate('studentId', '-password')
      .populate('coordinatorId', '-password');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('addDailyDetail error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get ITR students list
// @route   GET /api/itr/students
// @access  Private (itr_coordinator, admin)
const getITRStudents = async (req, res) => {
  try {
    const { academicYear, department } = req.query;
    const itrQuery = {};

    // Filter by academic year and/or department through student
    if (academicYear || department) {
      const studentQuery = { role: 'student' };
      if (academicYear) studentQuery.academicYear = academicYear;
      if (department) studentQuery.department = department;
      const students = await User.find(studentQuery).select('_id');
      itrQuery.studentId = { $in: students.map(s => s._id) };
    }

    // Get all ITR records and group by student
    const records = await ITR.find(itrQuery)
      .populate('studentId', '-password')
      .populate('coordinatorId', '-password')
      .sort({ createdAt: -1 });

    // Get unique students from ITR records
    console.log("ITR query:", itrQuery); console.log("Found records:", records.length); const studentMap = {};
    records.forEach(record => {
      if (record.studentId) {
        const sid = record.studentId._id.toString();
        if (!studentMap[sid]) {
          studentMap[sid] = {
            student: record.studentId,
            itrRecords: [],
          };
        }
        studentMap[sid].itrRecords.push(record);
      }
    });

    const students = Object.values(studentMap);

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    console.error('getITRStudents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createITR,
  getAllITR,
  getMyITR,
  updateITR,
  addDailyDetail,
  getITRStudents,
};
