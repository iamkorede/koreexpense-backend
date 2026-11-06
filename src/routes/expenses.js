import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth); // every expense route needs a valid token

// GET /api/expenses  (newest first, optionally filtered by date range and category)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (startDate && !datePattern.test(startDate))
      return res.status(400).json({ error: 'startDate must use YYYY-MM-DD format' });
    if (endDate && !datePattern.test(endDate))
      return res.status(400).json({ error: 'endDate must use YYYY-MM-DD format' });
    if (startDate && endDate && startDate > endDate)
      return res.status(400).json({ error: 'startDate must be on or before endDate' });
    if (category !== undefined && (typeof category !== 'string' || !category.trim()))
      return res.status(400).json({ error: 'category must be a non-empty string' });

    const conditions = ['user_id = ?'];
    const params = [req.user.id];
    if (startDate) {
      conditions.push('date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('date <= ?');
      params.push(endDate);
    }
    if (category !== undefined) {
      conditions.push('category = ?');
      params.push(category.trim());
    }

    const rows = await db(
      `SELECT id, description, amount, category, date, created_at
       FROM expenses WHERE ${conditions.join(' AND ')} ORDER BY date DESC, id DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/summary  (total, avg, highest, top categories)
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.id;

    const [totals] = await db(
      `SELECT COALESCE(SUM(amount),0) AS total,
              COUNT(*) AS count,
              COALESCE(AVG(amount),0) AS average,
              COALESCE(MAX(amount),0) AS highest
       FROM expenses WHERE user_id = ?`,
      [userId]
    );

    const topCategories = await db(
      `SELECT category,
              SUM(amount) AS total,
              ROUND(100 * SUM(amount) / (SELECT SUM(amount) FROM expenses WHERE user_id = ?), 1) AS percentage
       FROM expenses WHERE user_id = ?
       GROUP BY category
       ORDER BY total DESC`,
      [userId, userId]
    );

    res.json({
      total: Number(totals.total),
      count: totals.count,
      average: Number(totals.average),
      highest: Number(totals.highest),
      topCategories,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    if (!description?.trim() || !amount)
      return res.status(400).json({ error: 'description and amount are required' });

    const result = await db(
      'INSERT INTO expenses (user_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, description.trim(), amount, category || 'Other', date || new Date().toISOString().split('T')[0]]
    );

    const [created] = await db('SELECT id, description, amount, category, date FROM expenses WHERE id = ?', [result.insertId]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await db('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'expense not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
