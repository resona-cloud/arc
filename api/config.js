// /api/config — bootstrap API key for client-side fetch interceptor
// No auth required on this endpoint — it IS the auth bootstrap
// Rate limited: 30 req/IP/min

const rateLimitMap = new Map();

function rateLimit(ip) {
  const now = Date.now();
  // Clean expired entries on each call to prevent unbounded growth
  for (const [k, v] of rateLimitMap) {
    if (now > v.reset) rateLimitMap.delete(k);
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60000 });
    return false;
  }
  entry.count++;
  if (entry.count > 30) return true;
  return false;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'self');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  return res.status(200).json({ apiKey: process.env.ARC_API_KEY || '' });
};
