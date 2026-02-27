const express = require('express');
const router = express.Router();
const { getAllStudents, getStudentById, updateStudent, deleteStudent } = require('../controllers/studentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.get('/', auth, authorize('admin', 'mentor'), getAllStudents);
router.get('/:id', auth, getStudentById);
router.put('/:id', auth, authorize('admin', 'mentor'), updateStudent);
router.delete('/:id', auth, authorize('admin'), deleteStudent);

module.exports = router;
