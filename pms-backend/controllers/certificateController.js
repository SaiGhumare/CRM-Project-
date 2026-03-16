const Certificate = require('../models/Certificate');
const User = require('../models/User');

// @desc    Upload a certificate
// @route   POST /api/certificates
// @access  Private (student)
const uploadCertificate = async (req, res) => {
  try {
    const { type, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Check limit
    const existingCount = await Certificate.countDocuments({ uploadedBy: req.user.id });
    if (existingCount >= 10) {
      return res.status(400).json({ message: 'You have reached the maximum limit of 10 certificates.' });
    }

    const certData = {
      type,
      category: category || 'project',
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
    };

    // Auto-approve ITR certificates
    if (certData.category === 'itr') {
      certData.status = 'approved';
    }

    const cert = await Certificate.create(certData);

    const populated = await Certificate.findById(cert._id)
      .populate('uploadedBy', '-password');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('uploadCertificate error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private (admin, mentor, itr_coordinator)
const getAllCertificates = async (req, res) => {
  try {
    const { type, status, academicYear, department, category } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;

    // Filter by academic year, department, and/or mentor through student
    const studentQuery = { role: 'student' };
    let filterByStudent = false;

    if (academicYear) { studentQuery.academicYear = academicYear; filterByStudent = true; }
    if (department) { studentQuery.department = department; filterByStudent = true; }
    
    // Mentor role: only see certificates from students in their assigned groups
    if (req.user && req.user.role === 'mentor') {
      const StudentGroup = require('../models/StudentGroup');
      const assignedGroups = await StudentGroup.find({ mentorId: req.user.id }).select('_id');
      studentQuery.groupId = { $in: assignedGroups.map(g => g._id) };
      filterByStudent = true;
    }

    if (filterByStudent) {
      const students = await User.find(studentQuery).select('_id');
      query.uploadedBy = { $in: students.map(s => s._id) };
    }

    const certs = await Certificate.find(query)
      .populate('uploadedBy', '-password')
      .populate('verifiedBy', '-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    console.error('getAllCertificates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my certificates
// @route   GET /api/certificates/me
// @access  Private (student)
const getMyCertificates = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { uploadedBy: req.user.id };
    
    if (category) {
      query.category = category;
    }

    const certs = await Certificate.find(query)
      .populate('verifiedBy', '-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    console.error('getMyCertificates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Review a certificate (Approve / Needs Correction)
// @route   PUT /api/certificates/:id/review
// @access  Private (admin, mentor)
const reviewCertificate = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    if (!['approved', 'needs_correction'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    cert.status = status;
    cert.feedback = feedback;
    cert.verifiedBy = req.user.id;
    await cert.save();

    const updated = await Certificate.findById(cert._id)
      .populate('uploadedBy', '-password')
      .populate('verifiedBy', '-password');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('reviewCertificate error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private (admin, student who uploaded)
const deleteCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (req.user.role !== 'admin' && cert.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this certificate' });
    }

    await cert.deleteOne();
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    console.error('deleteCertificate error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  uploadCertificate,
  getAllCertificates,
  getMyCertificates,
  reviewCertificate,
  deleteCertificate,
};
