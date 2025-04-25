import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddRooms.css";
import Nav from "../Nav/Nav";
import Footer from '../Footer/Footer';

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
    image: "",
    imagePreview: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle image upload with validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setInputs(prev => ({
        ...prev,
        image: reader.result,
        imagePreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token"); 
      
      // Validate image
      if (!inputs.image) {
        alert("Please upload an image");
        setIsSubmitting(false);
        return;
      }
      
      // Validate price is positive number
      if (inputs.pricePerNight <= 0) {
        alert("Price per night must be a positive number");
        setIsSubmitting(false);
        return;
      }

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
          image: inputs.image,
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
      let errorMessage = "An error occurred. Please try again.";
      
      if (error.response) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized - Please login again";
        } else if (error.response.status === 400) {
          errorMessage = "Bad request - Please check your inputs";
        }
      }
      
      alert(errorMessage); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="manager-layout">
      <Nav />
      <div className="page-container">
        <div className="add-room-container">
          <h1>Add New Room</h1>
          <form className="add-room-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Room Number</label>
              <input
                type="text"
                name="roomNumber"
                onChange={handleChange}
                value={inputs.roomNumber}
                required
                pattern="[A-Za-z0-9]+"
                title="Alphanumeric characters only"
              />
            </div>

            <div className="form-group">
              <label>Room Type</label>
              <select
                name="roomType"
                onChange={handleChange}
                value={inputs.roomType}
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
                onChange={handleChange}
                value={inputs.pricePerNight}
                required
                min="1"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Features (comma separated)</label>
              <input
                type="text"
                name="features"
                onChange={handleChange}
                value={inputs.features}
                required
                placeholder="e.g., WiFi, TV, AC"
              />
            </div>

            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                onChange={handleChange}
                value={inputs.capacity}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                onChange={handleChange}
                value={inputs.status}
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
                onChange={handleChange}
                value={inputs.description}
                required
                minLength="1"
                maxLength="500"
              />
            </div>

            <div className="form-group">
              <label>Room Image (max 5MB)</label>
              <input
                type="file"
                name="roomImage"
                onChange={handleImageChange}
                accept="image/*"
                required
              />
              {inputs.imagePreview && (
                <div className="image-preview">
                  <img src={inputs.imagePreview} alt="Room preview" style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }} />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AddRoom;