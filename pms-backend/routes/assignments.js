const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  deleteAssignment,
  submitAssignment,
  getMySubmissions,
  getAllSubmissions,
  reviewSubmission,
  deleteSubmission,
} = require('../controllers/assignmentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// Assignments (posted by ITR Coordinator)
router.post('/', auth, authorize('itr_coordinator', 'admin'), upload.single('file'), createAssignment);
router.get('/', auth, getAssignments);
router.delete('/:id', auth, authorize('itr_coordinator', 'admin'), deleteAssignment);

// Submissions (uploaded by students)
router.post('/:id/submit', auth, authorize('student'), upload.single('file'), submitAssignment);
router.get('/submissions/me', auth, authorize('student'), getMySubmissions);
router.get('/submissions', auth, authorize('itr_coordinator', 'admin'), getAllSubmissions);
router.put('/submissions/:id/review', auth, authorize('itr_coordinator', 'admin'), reviewSubmission);
router.delete('/submissions/:id', auth, authorize('student', 'admin'), deleteSubmission);

module.exports = router;
