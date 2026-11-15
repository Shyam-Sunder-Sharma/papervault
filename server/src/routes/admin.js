const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query, supabase } = require('../db');
const { verifyAdmin } = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await query('SELECT * FROM admins WHERE username = $1 LIMIT 1', [username.trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    sameSite: 'lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/admin/me - verify session status
router.get('/me', verifyAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

// GET /api/admin/stats - statistics & recent items
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [papersCountRes, suggestionsCountRes, recentPapersRes, recentSuggestionsRes] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
          COUNT(*) FILTER (WHERE status = 'unpublished') as unpublished_count,
          COUNT(*) as total_count
        FROM papers
      `),
      query(`
        SELECT 
          COUNT(*) as total_count,
          COUNT(*) FILTER (WHERE status = 'new') as new_count,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count
        FROM suggestions
        WHERE status != 'resolved'
      `),
      query(`
        SELECT p.*, b.name as branch_name, b.code as branch_code, s.number as semester_number
        FROM papers p
        LEFT JOIN branches b ON p.branch_id = b.id
        LEFT JOIN semesters s ON p.semester_id = s.id
        ORDER BY p.submitted_at DESC
        LIMIT 5
      `),
      query(`
        SELECT * FROM suggestions
        WHERE status != 'resolved'
        ORDER BY created_at DESC
        LIMIT 5
      `),
    ]);

    res.json({
      papers: papersCountRes.rows[0],
      suggestions: suggestionsCountRes.rows[0],
      recentPapers: recentPapersRes.rows,
      recentSuggestions: recentSuggestionsRes.rows,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// GET /api/admin/papers - list all papers, filterable by status
router.get('/papers', verifyAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT p.*, b.name as branch_name, b.code as branch_code, s.number as semester_number
      FROM papers p
      LEFT JOIN branches b ON p.branch_id = b.id
      LEFT JOIN semesters s ON p.semester_id = s.id
    `;
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`p.status = $${params.length}`);
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      conditions.push(`(p.subject_name ILIKE $${params.length} OR p.subject_code ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY p.submitted_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin papers:', error);
    res.status(500).json({ error: 'Failed to retrieve papers' });
  }
});

// PATCH /api/admin/papers/:id - edit metadata or update status
router.patch('/papers/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      subject_name,
      subject_code,
      academic_year,
      exam_type,
      branch_id,
      semester_id,
    } = req.body;

    // Fetch existing
    const existing = await query('SELECT * FROM papers WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const current = existing.rows[0];
    const newStatus = status !== undefined ? status : current.status;
    const newSubjectName = subject_name !== undefined ? subject_name.trim() : current.subject_name;
    const newSubjectCode = subject_code !== undefined ? subject_code.trim().toUpperCase() : current.subject_code;
    const newAcademicYear = academic_year !== undefined ? academic_year.trim() : current.academic_year;
    const newExamType = exam_type !== undefined ? exam_type.trim() : current.exam_type;
    const newBranchId = branch_id !== undefined ? branch_id : current.branch_id;
    const newSemesterId = semester_id !== undefined ? semester_id : current.semester_id;

    const validStatuses = ['pending', 'approved', 'rejected', 'unpublished'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updateSql = `
      UPDATE papers
      SET 
        status = $1,
        subject_name = $2,
        subject_code = $3,
        academic_year = $4,
        exam_type = $5,
        branch_id = $6,
        semester_id = $7,
        reviewed_at = CASE WHEN $1 != 'pending' THEN NOW() ELSE reviewed_at END
      WHERE id = $8
      RETURNING *
    `;

    const result = await query(updateSql, [
      newStatus,
      newSubjectName,
      newSubjectCode,
      newAcademicYear,
      newExamType,
      newBranchId,
      newSemesterId,
      id,
    ]);

    res.json({
      message: 'Paper updated successfully',
      paper: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating paper:', error);
    res.status(500).json({ error: 'Failed to update paper' });
  }
});

// DELETE /api/admin/papers/:id - delete from DB and Supabase Storage
router.delete('/papers/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM papers WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const paper = existing.rows[0];

    // Attempt to remove file from Supabase Storage if path exists
    if (paper.file_path) {
      try {
        const { error: storageError } = await supabase.storage
          .from('question-papers')
          .remove([paper.file_path]);

        if (storageError) {
          console.warn('Notice: Failed to delete file from Supabase storage:', storageError.message);
        }
      } catch (storageErr) {
        console.warn('Storage delete exception:', storageErr);
      }
    }

    await query('DELETE FROM papers WHERE id = $1', [id]);

    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Error deleting paper:', error);
    res.status(500).json({ error: 'Failed to delete paper' });
  }
});

// GET /api/admin/suggestions - list feedback (auto-excludes resolved items)
router.get('/suggestions', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = "SELECT * FROM suggestions WHERE status != 'resolved'";
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND status = $1`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin suggestions:', error);
    res.status(500).json({ error: 'Failed to retrieve suggestions' });
  }
});

// PATCH /api/admin/suggestions/:id - update status (resolved auto-deletes / clears suggestion)
router.patch('/suggestions/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'in_progress', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Automatically remove/delete suggestion when marked as resolved
    if (status === 'resolved') {
      const delResult = await query('DELETE FROM suggestions WHERE id = $1 RETURNING *', [id]);
      if (delResult.rows.length === 0) {
        return res.status(404).json({ error: 'Suggestion not found' });
      }
      return res.json({
        message: 'Suggestion marked as resolved and automatically removed from the dashboard.',
        deleted: true,
        id,
      });
    }

    const result = await query(
      'UPDATE suggestions SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    res.json({
      message: 'Suggestion updated successfully',
      suggestion: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating suggestion:', error);
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
});

// DELETE /api/admin/suggestions/:id - manually delete suggestion
router.delete('/suggestions/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM suggestions WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json({ message: 'Suggestion deleted successfully', id });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
});

module.exports = router;
