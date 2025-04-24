const express = require("express");
const router = express.Router();
const { authenticateUser, isManager } = require("../Middleware/authMiddleware");
const Roomcontroller = require("../Controllers/Roomcontroller");

// All users can view rooms
router.get("/", authenticateUser, Roomcontroller.GetAllRooms);

// Only managers can modify rooms
router.post("/", isManager, Roomcontroller.addrooms);
router.get("/:id", authenticateUser, Roomcontroller.getById);
router.put("/:id", isManager, Roomcontroller.updateRooms);
router.delete("/:id", isManager, Roomcontroller.deleterooms);

module.exports = router;