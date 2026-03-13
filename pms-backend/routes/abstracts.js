const express = require('express');
const router = express.Router();
const { submitAbstract, getAllAbstracts, getAbstractsByGroup, reviewAbstract, deleteAbstract } = require('../controllers/abstractController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.post('/', auth, authorize('student'), upload.single('file'), submitAbstract);
router.get('/', auth, getAllAbstracts);
router.get('/group/:groupId', auth, getAbstractsByGroup);
router.put('/:id/review', auth, authorize('admin', 'mentor'), reviewAbstract);
router.delete('/:id', auth, deleteAbstract);

module.exports = router;
