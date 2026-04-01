const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashedPassword], function(err) {
      if (err) {
        console.error('Database error:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          if (err.message.includes('username')) {
            return res.status(400).json({ message: 'Username already exists' });
          } else if (err.message.includes('email')) {
            return res.status(400).json({ message: 'Email already exists' });
          }
        }
        return res.status(500).json({ message: 'Registration failed. Please try again.' });
      }

      // Get the created user
      db.get(`SELECT id, username, email FROM users WHERE id = ?`, [this.lastID], (err, user) => {
        if (err) {
          console.error('Error fetching created user:', err);
          return res.status(500).json({ message: 'User created but failed to retrieve data' });
        }
        res.status(201).json({
          message: 'User created successfully',
          user: user
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    console.log('Database query result:', err, user);
    if (err || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password comparison:', validPassword);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

module.exports = router;
