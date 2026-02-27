const express = require('express');
const router = express.Router();
const { getAllMentors, getMentorGroups, assignMentorToGroup } = require('../controllers/mentorController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.get('/', auth, getAllMentors);
router.get('/:id/groups', auth, getMentorGroups);
router.put('/assign', auth, authorize('admin'), assignMentorToGroup);

module.exports = router;
