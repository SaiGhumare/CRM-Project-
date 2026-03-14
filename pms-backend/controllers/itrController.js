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

    // ITR coordinators can see all ITR records (no strict coordinatorId filter
    // needed since there is only one coordinator managing all students)

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

    const pipeline = [
      // 1. Join with Users collection (student)
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      // 2. Unwind the joined array to make elements flat (keep only valid student joins)
      { $unwind: '$student' },
      
      // 3. Filter using the joined student fields
      {
        $match: {
          'student.role': 'student',
          ...(academicYear ? { 'student.academicYear': academicYear } : {}),
          ...(department ? { 'student.department': department } : {})
        }
      },
      
      // 4. Optionally join coordinator details
      {
        $lookup: {
          from: 'users',
          localField: 'coordinatorId',
          foreignField: '_id',
          as: 'coordinatorId'
        }
      },
      {
        $unwind: { path: '$coordinatorId', preserveNullAndEmptyArrays: true }
      },

      // 5. Group by student to structure the response format: { student, itrRecords: [...] }
      {
        $group: {
          _id: '$student._id',
          student: { $first: '$student' },
          itrRecords: { $push: '$$ROOT' }
        }
      },

      // 6. Cleanup sensitive fields like passwords and avoid circular nesting
      {
        $project: {
          '_id': 0,
          'student.password': 0,
          'itrRecords.student': 0, // removed duplicate student object
          'itrRecords.coordinatorId.password': 0
        }
      },
      
      // 7. Sort by student name
      {
        $sort: { 'student.name': 1 }
      }
    ];

    const students = await ITR.aggregate(pipeline);

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    console.error('getITRStudents aggregation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload an ITR Document (Offer Letter, Report, Certificate)
// @route   POST /api/itr/:id/document
// @access  Private (student, itr_coordinator)
const uploadITRDocument = async (req, res) => {
  try {
    const { documentType } = req.body; // 'offerLetter', 'projectReport', or 'certificate'

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const validDocumentTypes = ['offerLetter', 'projectReport', 'certificate'];
    if (!validDocumentTypes.includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type. Must be offerLetter, projectReport, or certificate.' });
    }

    const itr = await ITR.findById(req.params.id);
    if (!itr) {
      return res.status(404).json({ message: 'ITR record not found' });
    }

    // Auth check: student or coordinator
    if (req.user.role === 'student' && itr.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this ITR record' });
    }

    itr[documentType] = {
      url: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      status: 'pending' // Reset status on re-upload
    };

    await itr.save();

    const updatedITR = await ITR.findById(itr._id)
      .populate('studentId', '-password')
      .populate('coordinatorId', '-password');

    res.status(200).json({ success: true, data: updatedITR });
  } catch (error) {
    console.error('uploadITRDocument error:', error);
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
  uploadITRDocument,
};
