const express = require("express");
const mongoose = require("mongoose");
const roomRouter = require("./Routes/RoomRoute");
const bookingRouter = require("./Routes/BookingRoute");
const userRouter = require("./Routes/UserRoute");
const cors = require("cors");
require('dotenv').config();

const app = express();

// Middleware with increased payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Routes
app.use("/Rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/users", userRouter);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .then(() => {
    app.listen(5000);
    console.log("Server running on port 5000");
  })
  .catch((err) => console.log(err));