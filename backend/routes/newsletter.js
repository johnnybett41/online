const express = require('express');
const { db } = require('../db');
const { sendEmail } = require('../utils/mailer');

const router = express.Router();

const NEWSLETTER_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

let newsletterTableReady;

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });
}

function ensureNewsletterTable() {
  if (!newsletterTableReady) {
    newsletterTableReady = run(NEWSLETTER_TABLE_SQL);
  }

  return newsletterTableReady;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/subscribe', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const notificationEmail =
    process.env.NEWSLETTER_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_EMAILS?.split(',')[0]?.trim() ||
    'johnbett414@gmail.com';

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  try {
    await ensureNewsletterTable();

    const insertResult = await run(
      `INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT DO NOTHING`,
      [email]
    );

    if (insertResult.changes === 0) {
      return res.json({
        message: 'You are already subscribed.',
        subscribed: false,
      });
    }

    let notificationSent = true;

    try {
      await sendEmail({
        to: notificationEmail,
        subject: 'New newsletter subscription',
        text: `A new visitor subscribed to the newsletter: ${email}`,
        html: `
          <h2>New newsletter subscription</h2>
          <p>A new visitor subscribed to the ElectroHub newsletter.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Submitted at:</strong> ${new Date().toISOString()}</p>
        `,
      });
    } catch (emailError) {
      notificationSent = false;
      console.warn('Newsletter email notification could not be sent:', emailError.message);
    }

    return res.status(201).json({
      message: notificationSent
        ? 'Subscription successful. You will receive a confirmation soon.'
        : 'Subscription successful. Email notification is unavailable on this deployment.',
      subscribed: true,
    });
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique_violation
      return res.json({
        message: 'You are already subscribed.',
        subscribed: false,
      });
    }

    return res.status(500).json({
      message: 'Failed to subscribe to newsletter',
    });
  }
});

module.exports = router;
