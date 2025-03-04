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
      if (err) return res.status(401).json({ message: "Invalid or expired token" });

      console.log("Decoded Token:", decoded); // ✅ Debug log

      req.user = decoded; // Attach user details to request

      // Role-based authorization check
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        console.log(`Access denied. Required role: ${roles}, User role: ${req.user.role}`);
        return res.status(403).json({ message: "Forbidden: You do not have access" });
      }

      next();
    });
  };
};

module.exports = authenticateUser;
