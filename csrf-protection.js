// CSRF Protection Middleware
import crypto from 'crypto';

const tokens = new Map();
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

// Generate CSRF token
export function generateCsrfToken() {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, Date.now());
  
  // Clean up expired tokens
  cleanupExpiredTokens();
  
  return token;
}

// Verify CSRF token
export function verifyCsrfToken(token) {
  if (!token) return false;
  
  const timestamp = tokens.get(token);
  if (!timestamp) return false;
  
  // Check if token is expired
  if (Date.now() - timestamp > TOKEN_EXPIRY) {
    tokens.delete(token);
    return false;
  }
  
  return true;
}

// Clean up expired tokens
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, timestamp] of tokens.entries()) {
    if (now - timestamp > TOKEN_EXPIRY) {
      tokens.delete(token);
    }
  }
}

// Middleware to require CSRF token
export function requireCsrfToken(req, res, next) {
  const token = req.headers['x-csrf-token'];
  
  if (!verifyCsrfToken(token)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or missing CSRF token'
    });
  }
  
  next();
}

// Endpoint to get CSRF token
export function getCsrfToken(req, res) {
  const token = generateCsrfToken();
  res.json({
    success: true,
    token
  });
}

export default {
  generateCsrfToken,
  verifyCsrfToken,
  requireCsrfToken,
  getCsrfToken,
};
