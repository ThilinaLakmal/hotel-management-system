import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import "./Booking.css";

function Booking() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: "",
    checkOutDate: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/Rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setRoom(data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        setError("Failed to load room details. Please try again.");
        console.error("Room details error:", error);
      }
    };

    fetchRoomDetails();
  }, [roomId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateNights = (checkIn, checkOut) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(checkIn);
    const secondDate = new Date(checkOut);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  };

  const validateForm = () => {
    const { checkInDate, checkOutDate, guestName, guestEmail, guestPhone } = bookingDetails;
    
    if (!checkInDate || !checkOutDate || !guestName || !guestEmail || !guestPhone) {
      setError("All fields are required");
      return false;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError("Check-out date must be after check-in date");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(guestPhone)) {
      setError("Please enter a valid phone number");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/bookings",
        {
          roomId,
          ...bookingDetails
        },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Calculate number of nights
      const nights = calculateNights(bookingDetails.checkInDate, bookingDetails.checkOutDate);
      
      // Set booking success data
      setBookingData({
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        guestName: bookingDetails.guestName,
        guestEmail: bookingDetails.guestEmail,
        guestPhone: bookingDetails.guestPhone,
        checkInDate: bookingDetails.checkInDate,
        checkOutDate: bookingDetails.checkOutDate,
        nights: nights,
        specialRequests: bookingDetails.specialRequests
      });
      
      setBookingSuccess(true);
    } catch (error) {
      let errorMessage = "Booking failed. Please try again.";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Session expired. Please login again.";
          localStorage.removeItem("token");
          navigate("/login");
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "No response from server. Please check your connection.";
      } else {
        console.error("Request setup error:", error.message);
        errorMessage = "Request error. Please try again.";
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOkClick = () => {
    setBookingSuccess(false);
    navigate("/HomeView");
  };

  if (!room) {
    return (
      <div className="loading-container">
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Nav />
      <div className="booking-container">
        <h1>Book Room {room.roomNumber}</h1>
        
        {error && <div className="error-message">{error}</div>}

        {bookingSuccess ? (
          <div className="booking-confirmation">
            <div className="confirmation-header">
              <h2>Thank you for booking this room</h2>
              <h3>Welcome to Nature's Lake View</h3>
            </div>
            
            <div className="confirmation-details">
              <h4>Booking Summary</h4>
              
              <div className="detail-row">
                <span className="detail-label">Room Number:</span>
                <span className="detail-value">{bookingData.roomNumber}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Room Type:</span>
                <span className="detail-value">{bookingData.roomType}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Guest Name:</span>
                <span className="detail-value">{bookingData.guestName}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{bookingData.guestEmail}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{bookingData.guestPhone}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Check-in Date:</span>
                <span className="detail-value">
                  {new Date(bookingData.checkInDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Check-out Date:</span>
                <span className="detail-value">
                  {new Date(bookingData.checkOutDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Total Nights:</span>
                <span className="detail-value">{bookingData.nights}</span>
              </div>
              
              {bookingData.specialRequests && (
                <div className="detail-row">
                  <span className="detail-label">Special Requests:</span>
                  <span className="detail-value">{bookingData.specialRequests}</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleOkClick}
              className="confirmation-ok-button"
            >
              OK
            </button>
          </div>
        ) : (
          <div className="booking-content">
            <div className="room-info-section">
              <div className="room-image-container">
                {room.image ? (
                  <img 
                    src={room.image} 
                    alt={`Room ${room.roomNumber}`}
                    className="booking-room-image"
                    onError={(e) => (e.target.src = "/default-room.jpg")}
                  />
                ) : (
                  <div className="no-image">No Image Available</div>
                )}
              </div>
              <div className="room-details">
                <h2>Room Details</h2>
                <p><strong>Type:</strong> {room.roomType}</p>
                <p><strong>Price:</strong> LKR {room.pricePerNight?.toLocaleString()} per night</p>
                <p><strong>Capacity:</strong> {room.capacity}</p>
                <p><strong>Features:</strong> {room.features}</p>
                <p><strong>Description:</strong> {room.description}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
              <h2>Booking Information</h2>
              
              <div className="form-group">
                <label>Check-in Date:</label>
                <input
                  type="date"
                  name="checkInDate"
                  value={bookingDetails.checkInDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Check-out Date:</label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={bookingDetails.checkOutDate}
                  onChange={handleInputChange}
                  required
                  min={bookingDetails.checkInDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Your Full Name:</label>
                <input
                  type="text"
                  name="guestName"
                  value={bookingDetails.guestName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="guestEmail"
                  value={bookingDetails.guestEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="tel"
                  name="guestPhone"
                  value={bookingDetails.guestPhone}
                  onChange={handleInputChange}
                  required
                  placeholder="+94 77 123 4567"
                  pattern="[+0-9\s]{10,15}"
                />
              </div>

              <div className="form-group">
                <label>Special Requests:</label>
                <textarea
                  name="specialRequests"
                  value={bookingDetails.specialRequests}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any special requirements or notes..."
                />
              </div>

              <button 
                type="submit" 
                className="submit-booking-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Booking;