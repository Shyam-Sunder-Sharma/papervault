const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace(/^Bearer\s+/, '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No session found.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
}

module.exports = { verifyAdmin };
