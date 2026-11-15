const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { query, supabase } = require('../db');

// POST /api/papers/upload-url - generates signed upload URL for direct client upload to Supabase Storage
router.post('/upload-url', async (req, res) => {
  try {
    const { filename, fileType } = req.body;

    if (!filename || !fileType) {
      return res.status(400).json({ error: 'Filename and fileType are required' });
    }

    if (fileType !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF documents (application/pdf) are allowed' });
    }

    const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const randomSuffix = crypto.randomBytes(6).toString('hex');
    const filePath = `uploads/${Date.now()}-${randomSuffix}-${cleanName}`;

    // Create signed upload URL from Supabase Storage
    const { data, error } = await supabase.storage
      .from('question-papers')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Supabase signed URL error:', error);
      return res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
    }

    // Public URL for viewing / downloading after upload
    const { data: publicData } = supabase.storage
      .from('question-papers')
      .getPublicUrl(filePath);

    res.json({
      signedUrl: data.signedUrl,
      token: data.token,
      filePath: filePath,
      fileUrl: publicData.publicUrl,
    });
  } catch (err) {
    console.error('Error generating upload URL:', err);
    res.status(500).json({ error: 'Internal server error while generating upload URL' });
  }
});

// GET /api/papers - public approved papers with filtering and search
router.get('/', async (req, res) => {
  try {
    const { search, branch_id, semester_id, academic_year } = req.query;

    let sql = `
      SELECT p.*, b.name as branch_name, b.code as branch_code, s.number as semester_number
      FROM papers p
      LEFT JOIN branches b ON p.branch_id = b.id
      LEFT JOIN semesters s ON p.semester_id = s.id
      WHERE p.status = 'approved'
    `;
    const params = [];

    if (branch_id) {
      params.push(branch_id);
      sql += ` AND p.branch_id = $${params.length}`;
    }

    if (semester_id) {
      params.push(semester_id);
      sql += ` AND p.semester_id = $${params.length}`;
    }

    if (academic_year) {
      params.push(academic_year);
      sql += ` AND p.academic_year = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      sql += ` AND (p.subject_name ILIKE $${params.length} OR p.subject_code ILIKE $${params.length})`;
    }

    sql += ' ORDER BY p.academic_year DESC, p.subject_name ASC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({ error: 'Failed to retrieve papers' });
  }
});

// POST /api/papers - submit a new paper (status = 'pending')
router.post('/', async (req, res) => {
  try {
    const {
      branch_id,
      semester_id,
      subject_name,
      subject_code,
      academic_year,
      exam_type,
      file_url,
      file_path,
    } = req.body;

    if (!branch_id || !semester_id || !subject_name || !subject_code || !academic_year || !exam_type || !file_url || !file_path) {
      return res.status(400).json({ error: 'All fields including uploaded PDF are required.' });
    }

    // Check for duplicate approved paper
    const dupCheck = await query(
      `SELECT id FROM papers 
       WHERE LOWER(TRIM(subject_code)) = LOWER(TRIM($1)) 
         AND academic_year = $2 
         AND LOWER(TRIM(exam_type)) = LOWER(TRIM($3)) 
         AND status = 'approved'
       LIMIT 1`,
      [subject_code, academic_year, exam_type]
    );

    if (dupCheck.rows.length > 0) {
      return res.status(409).json({
        error: `An approved question paper for ${subject_code.toUpperCase()} (${exam_type}) in ${academic_year} already exists in PaperVault.`,
      });
    }

    const insertSql = `
      INSERT INTO papers 
        (branch_id, semester_id, subject_name, subject_code, academic_year, exam_type, file_url, file_path, status, submitted_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())
      RETURNING *
    `;

    const result = await query(insertSql, [
      branch_id,
      semester_id,
      subject_name.trim(),
      subject_code.trim().toUpperCase(),
      academic_year.trim(),
      exam_type.trim(),
      file_url.trim(),
      file_path.trim(),
    ]);

    res.status(201).json({
      message: 'Paper submitted successfully! It will appear in PaperVault once reviewed and approved by an admin.',
      paper: result.rows[0],
    });
  } catch (error) {
    console.error('Error submitting paper:', error);
    res.status(500).json({ error: 'Failed to submit paper' });
  }
});

module.exports = router;
