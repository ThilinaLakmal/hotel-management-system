const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../Middleware/authMiddleware");
const { createBooking } = require("../Controllers/BookingController");

router.post("/", authenticateUser, createBooking);

module.exports = router;