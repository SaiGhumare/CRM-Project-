const fs = require('fs');
const path = require('path');

const SAMPLES_DIR = path.join(__dirname, '..', 'uploads', 'samples');

// Helper: derive a human-readable "type" label from a filename
const getTypeFromFilename = (filename) => {
  const lower = filename.toLowerCase();
  if (lower.includes('ppt') || lower.includes('presentation')) return 'PPT Stage One';
  if (lower.includes('sponsor')) return 'Sponsorship Letter';
  if (lower.includes('cert')) return 'Project Competition Certificate';
  if (lower.includes('weekly') || lower.includes('diary') || lower.includes('assesment') || lower.includes('assessment')) return 'Weekly Diary Format';
  if (lower.includes('abstract')) return 'Abstract';
  return 'Other';
};

// @desc    List all sample documents
// @route   GET /api/sample-documents
// @access  Private
const listSampleDocs = (req, res) => {
  try {
    if (!fs.existsSync(SAMPLES_DIR)) {
      return res.json({ success: true, data: [] });
    }

    const files = fs.readdirSync(SAMPLES_DIR).filter((f) => {
      const stat = fs.statSync(path.join(SAMPLES_DIR, f));
      return stat.isFile();
    });

    const data = files.map((filename) => {
      const stat = fs.statSync(path.join(SAMPLES_DIR, filename));
      return {
        id: filename, // use filename as unique id
        fileName: filename,
        fileUrl: `/uploads/samples/${encodeURIComponent(filename)}`,
        type: getTypeFromFilename(filename),
        uploadedAt: stat.mtime.toISOString().split('T')[0],
        uploadedBy: 'Admin',
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('listSampleDocs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload a sample document
// @route   POST /api/sample-documents
// @access  Private (admin)
const uploadSampleDoc = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const filename = req.file.filename;
    const stat = fs.statSync(path.join(SAMPLES_DIR, filename));

    const doc = {
      id: filename,
      fileName: filename,
      fileUrl: `/uploads/samples/${encodeURIComponent(filename)}`,
      type: req.body.type || getTypeFromFilename(filename),
      uploadedAt: stat.mtime.toISOString().split('T')[0],
      uploadedBy: req.user ? req.user.name || 'Admin' : 'Admin',
    };

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error('uploadSampleDoc error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a sample document
// @route   DELETE /api/sample-documents/:filename
// @access  Private (admin)
const deleteSampleDoc = (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    // Prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(SAMPLES_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: `${safeName} deleted` });
  } catch (error) {
    console.error('deleteSampleDoc error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { listSampleDocs, uploadSampleDoc, deleteSampleDoc };
