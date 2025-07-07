const express = require('express');
const multer = require('multer');
const pool = require('../db');
const router = express.Router();

// ✅ Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
    }
  }
});

// Upload route
router.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const { originalname, mimetype, buffer } = file;
    const result = await pool.query(
      'INSERT INTO files (filename, mimetype, filedata) VALUES ($1, $2, $3) RETURNING *',
      [originalname, mimetype, buffer]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all files
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, filename, mimetype, uploaded_at FROM files ORDER BY uploaded_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download file by ID
router.get('/download/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM files WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'File not found' });

    const file = result.rows[0];
    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
    });
    res.send(file.filedata);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View file in browser
router.get('/view/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT filename, mimetype, filedata FROM files WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return res.status(404).send('File not found');

    const file = result.rows[0];
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
    res.send(file.filedata); // raw buffer
  } catch (err) {
    console.error('View error:', err);
    res.status(500).send('Error retrieving file');
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM files WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
