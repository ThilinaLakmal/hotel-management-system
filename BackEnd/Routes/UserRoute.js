const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../Middleware/authMiddleware");
const { register, login, getProfile, updateProfile } = require("../Controllers/UserController");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", authenticateUser, getProfile);
router.put("/profile", authenticateUser, updateProfile);

module.exports = router;
