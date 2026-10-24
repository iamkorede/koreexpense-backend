import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = Router();

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || password.length < 6)
      return res.status(400).json({ error: 'email and a password of 6+ chars required' });

    const existing = await db('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = await db('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [
      name || '', email, hash,
    ]);

    const user = { id: result.insertId, email };
    res.status(201).json({ user, token: makeToken(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const rows = await db('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash)))
      return res.status(401).json({ error: 'wrong email or password' });

    res.json({ user: { id: user.id, email: user.email, name: user.name }, token: makeToken(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
