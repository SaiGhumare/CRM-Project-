const express = require('express');
const router = express.Router();
const { listSampleDocs, uploadSampleDoc, deleteSampleDoc } = require('../controllers/sampleDocumentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const uploadSample = require('../middleware/uploadSample');

router.get('/', auth, listSampleDocs);
router.post('/', auth, authorize('admin'), uploadSample.single('file'), uploadSampleDoc);
router.delete('/:filename', auth, authorize('admin'), deleteSampleDoc);

module.exports = router;
