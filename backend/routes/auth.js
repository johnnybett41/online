const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const { db } = require('../db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });

const makeUsernameSlug = (value) => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^([0-9]+)/, '');

  return normalized || 'googleuser';
};

const ensureUniqueUsername = async (baseUsername) => {
  let candidate = baseUsername;
  let suffix = 0;

  while (await dbGet('SELECT id FROM users WHERE username = $1', [candidate])) {
    suffix += 1;
    candidate = `${baseUsername}${suffix}`;
  }

  return candidate;
};

const verifyGoogleCredential = async (credential) => {
  const { data } = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
    params: { id_token: credential },
    timeout: 10000,
  });

  if (GOOGLE_CLIENT_ID && data.aud !== GOOGLE_CLIENT_ID) {
    throw new Error('Google account is not configured for this app');
  }

  if (!['accounts.google.com', 'https://accounts.google.com'].includes(data.iss)) {
    throw new Error('Invalid Google token issuer');
  }

  if (String(data.email_verified) !== 'true') {
    throw new Error('Google email is not verified');
  }

  return data;
};

const signSession = (user) => ({
  token: jwt.sign({ id: user.id, email: user.email }, SECRET_KEY),
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
  },
});

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

    db.run(`INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email`,
      [username, email, hashedPassword], function(err) {
      if (err) {
        console.error('Database error:', err);
        if (err.code === '23505') { // PostgreSQL unique_violation code
          if (err.constraint?.includes('username')) {
            return res.status(400).json({ message: 'Username already exists' });
          } else if (err.constraint?.includes('email')) {
            return res.status(400).json({ message: 'Email already exists' });
          }
          return res.status(400).json({ message: 'This record already exists' });
        }
        return res.status(500).json({ message: 'Registration failed. Please try again.' });
      }

      // User was created successfully with RETURNING clause
      const user = this.rows?.[0];
      if (user) {
        res.status(201).json({
          message: 'User created successfully',
          user: user
        });
      } else {
        res.status(500).json({ message: 'User created but failed to retrieve data' });
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password, rememberMe } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  db.get(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [normalizedEmail], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: rememberMe ? '30d' : '7d' }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    const googleProfile = await verifyGoogleCredential(credential);
    const email = googleProfile.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Google account email is missing' });
    }

    let user = await dbGet('SELECT id, username, email FROM users WHERE email = $1', [email]);

    if (!user) {
      const nameSource = googleProfile.name || email.split('@')[0] || 'Google User';
      const baseUsername = makeUsernameSlug(nameSource);
      const username = await ensureUniqueUsername(baseUsername);
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

      const insertResult = await dbRun(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, randomPassword]
      );

      user = insertResult.rows?.[0] || { id: insertResult.lastID, username, email };
    }

    return res.json(signSession(user));
  } catch (error) {
    console.error('Google sign-in error:', error);
    return res.status(401).json({
      message: error.response?.data?.error_description || error.message || 'Google sign-in failed',
    });
  }
});

module.exports = router;
