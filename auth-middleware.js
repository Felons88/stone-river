// JWT Authentication Middleware for Admin Panel
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.server' });

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://fzzhzhtyywjgopphvflr.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

const JWT_SECRET = process.env.JWT_SECRET || 'stoneriver-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// Generate JWT token
export function generateToken(userId, email, role = 'admin') {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware to protect admin routes
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    
    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

// Middleware to check if user is admin
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
}

// Admin login endpoint
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }
    
    // Check admin credentials in database
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Verify password (in production, use bcrypt)
    if (admin.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check if account is active
    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account is disabled'
      });
    }
    
    // Generate JWT token
    const token = generateToken(admin.id, admin.email, admin.role);
    
    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);
    
    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
}

// Refresh token endpoint
export async function refreshToken(req, res) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required'
      });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    // Generate new token
    const newToken = generateToken(decoded.userId, decoded.email, decoded.role);
    
    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
}

export default {
  generateToken,
  verifyToken,
  requireAuth,
  requireAdmin,
  adminLogin,
  refreshToken,
};
