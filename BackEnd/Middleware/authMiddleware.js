const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  // Accept both manager and guest tokens
  if (token === "manager-auth-token" || token === "guest-auth-token") {
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const isManager = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (token === "manager-auth-token") {
    next();
  } else {
    return res.status(403).json({ message: "Forbidden - Manager access required" });
  }
};

module.exports = { authenticateUser, isManager };