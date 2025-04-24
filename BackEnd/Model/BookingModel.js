const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomModel',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  guestName: {
    type: String,
    required: true
  },
  guestEmail: {
    type: String,
    required: true
  },
  guestPhone: {
    type: String,
    required: true
  },
  specialRequests: {
    type: String
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "Confirmed",
    enum: ["Confirmed", "Cancelled", "Completed"]
  }
});

module.exports = mongoose.model("Booking", bookingSchema);