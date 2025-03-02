const jwt = require("jsonwebtoken");

// Middleware to verify access token and role-based authorization
const authenticateUser = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid or expired token" });

      req.user = decoded; // Attach user details to request

      // Role-based authorization check (if roles are provided)
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: You do not have access" });
      }

      next();
    });
  };
};

module.exports = authenticateUser;
