/**
 * Role-based access control middleware.
 * Usage: authorize('admin', 'mentor') — allows only those roles.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

module.exports = authorize;
