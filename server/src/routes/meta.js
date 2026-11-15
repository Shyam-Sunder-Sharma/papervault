const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/meta - branches, semesters, subjects
router.get('/', async (req, res) => {
  try {
    const branchesResult = await query('SELECT id, name, code FROM branches ORDER BY id ASC');
    const semestersResult = await query('SELECT id, number FROM semesters ORDER BY number ASC');
    const subjectsResult = await query(`
      SELECT s.id, s.name, s.code, s.branch_id, s.semester_id, b.code as branch_code, sem.number as semester_number
      FROM subjects s
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN semesters sem ON s.semester_id = sem.id
      ORDER BY sem.number ASC, s.name ASC
    `);

    res.json({
      branches: branchesResult.rows,
      semesters: semestersResult.rows,
      subjects: subjectsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching meta info:', error);
    res.status(500).json({ error: 'Failed to retrieve metadata' });
  }
});

module.exports = router;
