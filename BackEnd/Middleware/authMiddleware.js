const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "hotel-management-secret-key-2024";

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // Keep legacy manager token support during transition
  if (token === "manager-auth-token") {
    req.user = { userId: "manager", role: "manager", name: "Manager" };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
  }
};

const isManager = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // Keep legacy manager token support
  if (token === "manager-auth-token") {
    req.user = { userId: "manager", role: "manager", name: "Manager" };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "manager") {
      return res.status(403).json({ message: "Forbidden - Manager access required" });
    }
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
  }
};

module.exports = { authenticateUser, isManager };