const Certificate = require('../models/Certificate');
const User = require('../models/User');

// @desc    Upload a certificate
// @route   POST /api/certificates
// @access  Private (student)
const uploadCertificate = async (req, res) => {
  try {
    const { type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const cert = await Certificate.create({
      type,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
    });

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
// @access  Private (admin, mentor)
const getAllCertificates = async (req, res) => {
  try {
    const { type, verified, academicYear, department } = req.query;
    const query = {};

    if (type) query.type = type;
    if (verified !== undefined) query.verified = verified === 'true';

    // Filter by academic year and/or department through student
    if (academicYear || department) {
      const studentQuery = { role: 'student' };
      if (academicYear) studentQuery.academicYear = academicYear;
      if (department) studentQuery.department = department;
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
    const certs = await Certificate.find({ uploadedBy: req.user.id })
      .populate('verifiedBy', '-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    console.error('getMyCertificates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify a certificate
// @route   PUT /api/certificates/:id/verify
// @access  Private (admin, mentor)
const verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    cert.verified = true;
    cert.verifiedBy = req.user.id;
    await cert.save();

    const updated = await Certificate.findById(cert._id)
      .populate('uploadedBy', '-password')
      .populate('verifiedBy', '-password');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('verifyCertificate error:', error);
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
  verifyCertificate,
  deleteCertificate,
};
