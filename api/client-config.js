const rlMap = new Map();

function rateLimit(ip) {
  const now = Date.now();
  for (const [k, v] of rlMap) { if (now > v.reset) rlMap.delete(k); }
  const entry = rlMap.get(ip);
  if (!entry || now > entry.reset) { rlMap.set(ip, { count: 1, reset: now + 60000 }); return false; }
  entry.count++;
  return entry.count > 60;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimit(ip)) return res.status(429).json({ error: 'Too many requests' });

  return res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    apiKey: process.env.ARC_API_KEY || ''
  });
};
