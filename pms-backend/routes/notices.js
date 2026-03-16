const express = require('express');
const router = express.Router();
const { getTargetingData, createNotice, uploadNotice, getAllNotices, sendNotice, deleteNotice } = require('../controllers/noticeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.get('/targeting-data', auth, authorize('admin', 'itr_coordinator'), getTargetingData);
router.post('/', auth, authorize('admin', 'itr_coordinator'), createNotice);
router.post('/upload', auth, authorize('admin', 'itr_coordinator'), upload.single('file'), uploadNotice);
router.get('/', auth, getAllNotices);
router.put('/:id/send', auth, authorize('admin', 'itr_coordinator'), sendNotice);
router.delete('/:id', auth, authorize('admin', 'itr_coordinator'), deleteNotice);

module.exports = router;
