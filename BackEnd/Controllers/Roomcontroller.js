const Room = require("../Model/RoomModel");

// Fetch all rooms
const GetAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found" });
    }
    return res.status(200).json({ Room: rooms }); 
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add a new room
const addrooms = async (req, res, next) => {
  const { roomNumber, roomType, pricePerNight, features, capacity, status, description, image } = req.body;

  try {
    // Validate required fields
    if (!roomNumber || !roomType || !pricePerNight || !features || !capacity || !status || !description || !image) {
      return res.status(400).json({ message: "All fields are required, including an image" });
    }

    // Create and save the new room with image
    const newRoom = new Room({ 
      roomNumber, 
      roomType, 
      pricePerNight, 
      features, 
      capacity, 
      status, 
      description, 
      image 
    });
    
    await newRoom.save();
    return res.status(201).json(newRoom);
  } catch (error) {
    console.error("Detailed error:", error);
    return res.status(500).json({ 
      message: "Failed to add room",
      error: error.message,
      validationErrors: error.errors // Include validation errors if any
    });
  }
};

// Get room by ID
const getById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    return res.status(200).json(room);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update room by ID
const updateRooms = async (req, res, next) => {
  const id = req.params.id;
  const { roomNumber, roomType, pricePerNight, features, capacity, status, description, image } = req.body;

  try {
    // Check for required fields
    if (!roomNumber || !roomType || !pricePerNight || !features || !capacity || !status || !description) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Prepare update object
    const updateData = { 
      roomNumber, 
      roomType, 
      pricePerNight, 
      features, 
      capacity, 
      status, 
      description 
    };

    // Only update image if a new one is provided
    if (image) {
      updateData.image = image;
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    return res.status(200).json(updatedRoom);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to update room" });
  }
};

// Delete room by ID
const deleterooms = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    
    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    res.status(200).json({ 
      message: "Room deleted successfully",
      deletedId: deletedRoom._id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to delete room",
      error: error.message 
    });
  }
};

// Export the functions
exports.GetAllRooms = GetAllRooms;
exports.addrooms = addrooms;
exports.getById = getById;
exports.updateRooms = updateRooms;
exports.deleterooms = deleterooms;
