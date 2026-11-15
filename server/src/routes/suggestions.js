const express = require('express');
const router = express.Router();
const { query } = require('../db');

// POST /api/suggestions - public student suggestions / feedback
router.post('/', async (req, res) => {
  try {
    const { category, message } = req.body;

    if (!category || !message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Category and a non-empty message are required.' });
    }

    const validCategories = ['General Feedback', 'Missing Paper Request', 'Bug Report', 'Content Correction', 'Other'];
    const chosenCategory = validCategories.includes(category) ? category : 'General Feedback';

    const insertSql = `
      INSERT INTO suggestions (category, message, status, created_at)
      VALUES ($1, $2, 'new', NOW())
      RETURNING *
    `;

    const result = await query(insertSql, [chosenCategory, message.trim()]);

    res.status(201).json({
      message: 'Thank you! Your feedback has been received.',
      suggestion: result.rows[0],
    });
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    res.status(500).json({ error: 'Failed to submit suggestion' });
  }
});

module.exports = router;
