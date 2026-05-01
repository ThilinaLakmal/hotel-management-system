const Booking = require("../Model/BookingModel");
const Room = require("../Model/RoomModel");

const createBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, guestName, guestEmail, guestPhone, specialRequests } = req.body;

    // Validate required fields
    if (!roomId || !checkInDate || !checkOutDate || !guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if room is available
    if (room.status !== "Available") {
      return res.status(400).json({ message: "Room is not available for booking" });
    }

    // Create new booking with userId from authenticated user
    const newBooking = new Booking({
      roomId,
      userId: req.user.userId,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      guestName,
      guestEmail,
      guestPhone,
      specialRequests: specialRequests || ""
    });

    await newBooking.save();

    // Update room status to Occupied
    room.status = "Occupied";
    await room.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ 
      message: "Failed to create booking",
      error: error.message 
    });
  }
};

// Get all bookings for the authenticated user
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .populate('roomId')
      .sort({ bookingDate: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

// Update a booking (only the booking owner can update)
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate, guestName, guestPhone, specialRequests } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check ownership
    if (booking.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own bookings" });
    }

    // Only allow editing confirmed bookings
    if (booking.status !== "Confirmed") {
      return res.status(400).json({ message: "Only confirmed bookings can be edited" });
    }

    // Update fields
    if (checkInDate) booking.checkInDate = new Date(checkInDate);
    if (checkOutDate) booking.checkOutDate = new Date(checkOutDate);
    if (guestName) booking.guestName = guestName;
    if (guestPhone) booking.guestPhone = guestPhone;
    if (specialRequests !== undefined) booking.specialRequests = specialRequests;

    await booking.save();

    // Re-populate room info
    const updatedBooking = await Booking.findById(id).populate('roomId');

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ message: "Failed to update booking", error: error.message });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check ownership
    if (booking.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "You can only cancel your own bookings" });
    }

    // Only allow cancelling confirmed bookings
    if (booking.status !== "Confirmed") {
      return res.status(400).json({ message: "Only confirmed bookings can be cancelled" });
    }

    // Update booking status
    booking.status = "Cancelled";
    await booking.save();

    // Update room status back to Available
    const room = await Room.findById(booking.roomId);
    if (room) {
      room.status = "Available";
      await room.save();
    }

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Failed to cancel booking", error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  updateBooking,
  cancelBooking
};