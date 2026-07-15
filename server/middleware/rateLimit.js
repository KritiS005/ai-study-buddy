const clients = new Map();

export const aiRateLimit = ({ windowMs = 60_000, max = 20 } = {}) => (req, res, next) => {
  const key = req.user?.uid || req.ip;
  const now = Date.now();
  const record = clients.get(key) || { count: 0, resetAt: now + windowMs };

  if (now >= record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  record.count += 1;
  clients.set(key, record);
  res.set('RateLimit-Limit', String(max));
  res.set('RateLimit-Remaining', String(Math.max(0, max - record.count)));

  if (record.count > max) {
    return res.status(429).json({ success: false, error: 'Too many AI requests. Please try again shortly.' });
  }

  return next();
};
