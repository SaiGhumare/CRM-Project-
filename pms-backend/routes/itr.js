const express = require('express');
const router = express.Router();
const {
  createITR,
  getAllITR,
  getMyITR,
  updateITR,
  addDailyDetail,
  getITRStudents,
  uploadITRDocument
} = require('../controllers/itrController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.post('/', auth, authorize('student'), createITR);
router.get('/', auth, authorize('admin', 'itr_coordinator', 'mentor'), getAllITR);
router.get('/me', auth, getMyITR);
router.get('/students', auth, authorize('admin', 'itr_coordinator', 'mentor'), getITRStudents);
router.put('/:id', auth, updateITR);
router.post('/:id/daily', auth, authorize('student'), addDailyDetail);
router.post('/:id/document', auth, authorize('student', 'itr_coordinator'), upload.single('file'), uploadITRDocument);

module.exports = router;
