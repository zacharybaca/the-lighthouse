import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized — no session token found.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always source orgId and role from the verified JWT payload
    req.user = {
      id: decoded.id,
      orgId: decoded.orgId,
      role: decoded.role,
      userType: decoded.userType,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized — invalid or expired token.' });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden — you do not have permission to perform this action.',
      });
    }
    next();
  };
};
