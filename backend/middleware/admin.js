function getAdminEmails() {
  const rawEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';

  return rawEmails
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function requireAdmin(req, res, next) {
  const adminEmails = getAdminEmails();
  const userEmail = req.user?.email?.trim().toLowerCase();

  if (!userEmail) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (adminEmails.length === 0) {
    return res.status(403).json({ message: 'Admin access is not configured' });
  }

  if (!adminEmails.includes(userEmail)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
}

module.exports = { requireAdmin };
