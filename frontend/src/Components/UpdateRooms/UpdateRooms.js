import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdateRooms.css";
import Nav from "../Nav/Nav";

function UpdateRooms() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
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
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/Login");
          return;
        }

        const response = await axios.get(`http://localhost:5000/Rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const roomData = response.data;
        setRoom({
          ...roomData,
          imagePreview: roomData.image
        });
      } catch (error) {
        console.error("Error loading room data:", error);
        setError(error.response?.data?.message || "Failed to load room data");
        if (error.response?.status === 401) {
          navigate("/Login");
        }
      } finally {
        setIsLoading(false);
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }
      
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

  const validateForm = () => {
    if (!room.roomNumber.trim()) return "Room number is required";
    if (!room.roomType) return "Room type is required";
    if (!room.pricePerNight || room.pricePerNight <= 0) return "Valid price is required";
    if (!room.features.trim()) return "Features are required";
    if (!room.capacity || room.capacity <= 0) return "Valid capacity is required";
    if (!room.status) return "Status is required";
    if (!room.description.trim()) return "Description is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      
      const updatedRoom = {
        roomNumber: room.roomNumber.trim(),
        roomType: room.roomType,
        pricePerNight: Number(room.pricePerNight),
        features: room.features.trim(),
        capacity: Number(room.capacity),
        status: room.status,
        description: room.description.trim(),
        image: room.image
      };
      
      await axios.put(`http://localhost:5000/Rooms/${id}`, updatedRoom, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Room updated successfully!");
      navigate("/Roomdetails");
    } catch (error) {
      console.error("Error updating room:", error);
      setError(error.response?.data?.message || "Failed to update room");
      if (error.response?.status === 401) {
        navigate("/Login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Nav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading room data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Nav />
      <div className="update-room-container">
        <h1>Update Room</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Number</label>
            <input
              type="text"
              name="roomNumber"
              value={room.roomNumber}
              onChange={handleChange}
              required
              placeholder="Enter room number"
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
            <label>Price Per Night (LKR)</label>
            <input
              type="number"
              name="pricePerNight"
              value={room.pricePerNight}
              onChange={handleChange}
              min="0"
              required
              placeholder="Enter price per night"
            />
          </div>

          <div className="form-group">
            <label>Features (comma separated)</label>
            <input
              type="text"
              name="features"
              value={room.features}
              onChange={handleChange}
              required
              placeholder="e.g., WiFi, AC, TV, Mini Bar"
            />
          </div>

          <div className="form-group">
            <label>Capacity (persons)</label>
            <input
              type="number"
              name="capacity"
              value={room.capacity}
              onChange={handleChange}
              min="1"
              required
              placeholder="Enter room capacity"
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
              placeholder="Enter room description"
              rows="4"
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
                <img 
                  src={room.imagePreview} 
                  alt="Room preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }} 
                />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Room'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateRooms;