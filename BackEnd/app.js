const express = require("express");
const mongoose = require("mongoose");
const roomRouter = require("./Routes/RoomRoute");
const bookingRouter = require("./Routes/BookingRoute");
const cors = require("cors");

const app = express();

// Middleware with increased payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Routes
app.use("/Rooms", roomRouter);
app.use("/api/bookings", bookingRouter); // Add this line

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://manager:v6p8Ehb1LkacAXyg@cluster0.qvue5.mongodb.net/")
  .then(() => console.log("Connected to MongoDB"))
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));