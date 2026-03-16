const express = require('express');
const router = express.Router();
const { uploadDocument, uploadLink, getAllDocuments, getDocumentsByGroup, reviewDocument, deleteDocument } = require('../controllers/documentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.post('/', auth, authorize('student'), upload.single('file'), uploadDocument);
router.post('/link', auth, authorize('student'), uploadLink);
router.get('/', auth, getAllDocuments);
router.get('/group/:groupId', auth, getDocumentsByGroup);
router.put('/:id/review', auth, authorize('admin', 'mentor'), reviewDocument);
router.delete('/:id', auth, deleteDocument);

module.exports = router;
