const express = require('express');
const router = express.Router();
const { createNotice, uploadNotice, getAllNotices, sendNotice, deleteNotice } = require('../controllers/noticeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.post('/', auth, authorize('admin'), createNotice);
router.post('/upload', auth, authorize('admin'), upload.single('file'), uploadNotice);
router.get('/', auth, getAllNotices);
router.put('/:id/send', auth, authorize('admin'), sendNotice);
router.delete('/:id', auth, authorize('admin'), deleteNotice);

module.exports = router;
