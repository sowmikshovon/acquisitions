import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  try {
    // Extract token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication token is required',
      });
    }

    // Verify token
    const decoded = jwttoken.verify(token);
    req.user = decoded;

    logger.info(`User authenticated: ${decoded.email} (ID: ${decoded.id})`);
    next();
  } catch (error) {
    logger.warn('Token verification failed', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return res.status(403).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid or expired',
    });
  }
};

export const requireRole = allowedRoles => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
      });

      return res.status(403).json({
        error: 'Access denied',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};
