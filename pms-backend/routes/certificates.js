const express = require('express');
const router = express.Router();
const { uploadCertificate, getAllCertificates, getMyCertificates, verifyCertificate, deleteCertificate } = require('../controllers/certificateController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.post('/', auth, authorize('student'), upload.single('file'), uploadCertificate);
router.get('/', auth, authorize('admin', 'mentor'), getAllCertificates);
router.get('/me', auth, getMyCertificates);
router.put('/:id/verify', auth, authorize('admin', 'mentor'), verifyCertificate);
router.delete('/:id', auth, deleteCertificate);

module.exports = router;
