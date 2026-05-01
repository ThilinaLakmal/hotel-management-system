const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../Middleware/authMiddleware");
const { createBooking, getMyBookings, updateBooking, cancelBooking } = require("../Controllers/BookingController");

router.post("/", authenticateUser, createBooking);
router.get("/my-bookings", authenticateUser, getMyBookings);
router.put("/:id", authenticateUser, updateBooking);
router.patch("/:id/cancel", authenticateUser, cancelBooking);

module.exports = router;