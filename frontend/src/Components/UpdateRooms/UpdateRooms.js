import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdateRooms.css";
import Nav from "../Nav/Nav";

function UpdateRooms() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState({
    roomNumber: "",
    roomType: "",
    pricePerNight: "",
    features: "",
    capacity: "",
    status: "",
    description: "",
    image: "",
    imagePreview: ""
  });

  // Fetch room data to populate form
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/Rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const roomData = response.data;
        
        setRoom({
          ...roomData,
          imagePreview: roomData.image // Set the image preview from stored image
        });
      } catch (error) {
        alert("Error loading room data: " + error.message);
        navigate("/Roomdetails");
      }
    };
    fetchRoomData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoom(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoom(prev => ({
          ...prev,
          image: reader.result,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // Prepare data for submission
      const updatedRoom = {
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: Number(room.pricePerNight),
        features: room.features,
        capacity: room.capacity,
        status: room.status,
        description: room.description,
        image: room.image
      };
      
      await axios.put(`http://localhost:5000/Rooms/${id}`, updatedRoom, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Room updated successfully!");
      navigate("/Roomdetails");
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="page-container">
      <Nav />
      <div className="update-room-container">
        <h1>Update Room</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Number</label>
            <input
              type="text"
              name="roomNumber"
              value={room.roomNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Room Type</label>
            <select
              name="roomType"
              value={room.roomType}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
              <option value="Deluxe">Deluxe</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price Per Night</label>
            <input
              type="number"
              name="pricePerNight"
              value={room.pricePerNight}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Features</label>
            <input
              type="text"
              name="features"
              value={room.features}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              name="capacity"
              value={room.capacity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={room.status}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={room.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Room Image</label>
            <input
              type="file"
              name="roomImage"
              onChange={handleImageChange}
              accept="image/*"
            />
            {room.imagePreview && (
              <div className="image-preview">
                <img src={room.imagePreview} alt="Room preview" style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }} />
              </div>
            )}
          </div>

          <button type="submit" className="submit-button">
            Update Room
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateRooms;