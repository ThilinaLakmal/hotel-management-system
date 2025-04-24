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

    // Create new booking
    const newBooking = new Booking({
      roomId,
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

module.exports = {
  createBooking
};