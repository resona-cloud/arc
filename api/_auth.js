// Shared API key auth helper — not exposed as a route (underscore prefix)
const { createHmac, timingSafeEqual } = require('crypto');

const ARC_KEY = process.env.ARC_API_KEY || '';

/**
 * Returns true if the request carries a valid x-arc-key header.
 * Uses HMAC-SHA256 to normalize key lengths before timingSafeEqual.
 */
function checkApiKey(req) {
  const provided = (req.headers['x-arc-key'] || '').trim();
  if (!provided || !ARC_KEY) return false;
  const a = createHmac('sha256', 'arc').update(provided).digest();
  const b = createHmac('sha256', 'arc').update(ARC_KEY).digest();
  try { return timingSafeEqual(a, b); } catch { return false; }
}

module.exports = { checkApiKey };
