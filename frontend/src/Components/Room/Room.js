
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddRooms.css";
import Nav from "../Nav/Nav"; // Import the Nav component

function AddRoom() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    roomNumber: "",
    roomType: "",
    pricePerNight: "",
    features: "",
    capacity: "",
    status: "",
    description: "",
    imageUrl: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); 
      const response = await axios.post(
        "http://localhost:5000/Rooms/",
        {
          roomNumber: String(inputs.roomNumber),
          roomType: String(inputs.roomType),
          pricePerNight: Number(inputs.pricePerNight),
          features: String(inputs.features),
          capacity: String(inputs.capacity),
          status: String(inputs.status),
          description: String(inputs.description),
          imageUrl: String(inputs.imageUrl),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      alert("Room added successfully!"); 
      navigate("/Roomdetails"); 
    } catch (error) {
      if (error.response && error.response.data.message) {
        alert(error.response.data.message); 
      } else {
        alert("An error occurred. Please try again."); 
      }
    }
  };

  return (
    <div className="page-container">
      <Nav />
      <div className="add-room-container">
        <h1>Add a new room</h1>
        <form className="add-room-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Number</label>
            <input
              type="text"
              name="roomNumber"
              onChange={handleChange}
              value={inputs.roomNumber}
              required
            />
          </div>

          <div className="form-group">
            <label>Room Type</label>
            <input
              type="text"
              name="roomType"
              onChange={handleChange}
              value={inputs.roomType}
              required
            />
          </div>

          <div className="form-group">
            <label>Price Per Night</label>
            <input
              type="number"
              name="pricePerNight"
              onChange={handleChange}
              value={inputs.pricePerNight}
              required
            />
          </div>

          <div className="form-group">
            <label>Features</label>
            <input
              type="text"
              name="features"
              onChange={handleChange}
              value={inputs.features}
              required
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="text"
              name="capacity"
              onChange={handleChange}
              value={inputs.capacity}
              required
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <input
              type="text"
              name="status"
              onChange={handleChange}
              value={inputs.status}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              onChange={handleChange}
              value={inputs.description}
              required
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              name="imageUrl"
              onChange={handleChange}
              value={inputs.imageUrl}
              required
            />
          </div>

          <button type="submit" className="submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default AddRoom;