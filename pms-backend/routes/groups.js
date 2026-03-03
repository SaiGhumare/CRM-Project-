const express = require('express');
const router = express.Router();
const { createGroup, getAllGroups, getGroupById, getStudentGroup, updateGroup, deleteGroup, addMember, removeMember } = require('../controllers/groupController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.post('/', auth, authorize('admin', 'mentor'), createGroup);
router.get('/', auth, getAllGroups);
router.get('/student/:userId', auth, getStudentGroup);
router.get('/:id', auth, getGroupById);
router.put('/:id', auth, authorize('admin', 'mentor'), updateGroup);
router.delete('/:id', auth, authorize('admin'), deleteGroup);
router.post('/:id/members', auth, authorize('admin', 'mentor'), addMember);
router.delete('/:id/members/:userId', auth, authorize('admin', 'mentor'), removeMember);

module.exports = router;