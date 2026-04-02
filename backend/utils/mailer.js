const nodemailer = require('nodemailer');

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    auth: {
      user,
      pass,
    },
  };
}

function getTransporter() {
  const smtpConfig = getSmtpConfig();
  if (!smtpConfig) {
    return null;
  }

  return nodemailer.createTransport(smtpConfig);
}

async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error('SMTP is not configured');
  }

  const fromName = process.env.MAIL_FROM_NAME || 'ElectroHub';
  const fromAddress = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER;

  if (!fromAddress) {
    throw new Error('MAIL_FROM_ADDRESS is not configured');
  }

  return transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendEmail,
};
