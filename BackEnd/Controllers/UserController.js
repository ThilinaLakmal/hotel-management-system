const User = require("../Model/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "hotel-management-secret-key-2024";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Validate name length
    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || "",
      role: "guest"
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        profilePicture: newUser.profilePicture,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed. Please try again.", error: error.message });
  }
};

// Login with email and password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check for manager login (keep legacy manager credentials)
    if (email === "manager" && password === "manager123") {
      const token = jwt.sign(
        { userId: "manager", email: "manager@hotel.com", role: "manager", name: "Manager" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: "manager",
          name: "Manager",
          email: "manager@hotel.com",
          role: "manager"
        }
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user has a password (Google users won't)
    if (!user.password) {
      return res.status(401).json({ message: "This account uses Google Sign-In. Please sign in with Google." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed. Please try again.", error: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    // Manager profile (hardcoded)
    if (req.user.userId === "manager") {
      return res.status(200).json({
        user: {
          id: "manager",
          name: "Manager",
          email: "manager@hotel.com",
          role: "manager",
          createdAt: new Date()
        }
      });
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;

    if (req.user.userId === "manager") {
      return res.status(403).json({ message: "Manager profile cannot be updated" });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
