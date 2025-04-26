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
      setError("Please fill in all required fields");
      return false;
    }

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn < today) {
      setError("Check-in date cannot be in the past");
      return false;
    }

    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in date");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate phone number (allows international format)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(guestPhone)) {
      setError("Please enter a valid phone number");
      return false;
    }

    // Validate name (at least 3 characters, letters and spaces only)
    if (guestName.trim().length < 3 || !/^[a-zA-Z\s]*$/.test(guestName)) {
      setError("Please enter a valid name (minimum 3 characters, letters only)");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Calculate total amount
      const numberOfDays = calculateNights(bookingDetails.checkInDate, bookingDetails.checkOutDate);
      const totalAmount = room.pricePerNight * numberOfDays;

      const bookingPayload = {
        roomId: roomId,  // Changed back to roomId as expected by backend
        checkInDate: bookingDetails.checkInDate,
        checkOutDate: bookingDetails.checkOutDate,
        guestName: bookingDetails.guestName,
        guestEmail: bookingDetails.guestEmail,
        guestPhone: bookingDetails.guestPhone,
        specialRequests: bookingDetails.specialRequests || ""
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.post(
        "http://localhost:5000/api/bookings",
        bookingPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        // Update the booking data for summary display
        setBookingData({
          ...bookingDetails,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          totalAmount: totalAmount,
          numberOfNights: numberOfDays,
          checkIn: bookingDetails.checkInDate,
          checkOut: bookingDetails.checkOutDate,
          bookingId: response.data.booking._id // Store the booking ID
        });
        setBookingSuccess(true);
      }
    } catch (error) {
      console.error("Booking error:", error);
      let errorMessage = "Failed to complete booking. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === "Authentication token not found") {
        errorMessage = "Please log in to complete your booking.";
        navigate("/login");
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

  if (bookingSuccess && bookingData) {
    return (
      <div className="booking-page">
        <Nav />
        <div className="booking-confirmation">
          <div className="confirmation-header">
            <h2>Booking Confirmed!</h2>
            <p>Thank you for choosing Nature's Lake View</p>
          </div>
          
          <div className="booking-summary">
            <h3>Booking Details</h3>
            <div className="summary-section">
              <div className="detail-row">
                <span className="detail-label">Room Number:</span>
                <span className="detail-value">{room.roomNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Room Type:</span>
                <span className="detail-value">{room.roomType}</span>
              </div>
            </div>

            <div className="summary-section">
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
            </div>

            <div className="summary-section">
              <div className="detail-row">
                <span className="detail-label">Check In:</span>
                <span className="detail-value">
                  {new Date(bookingData.checkIn).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Check Out:</span>
                <span className="detail-value">
                  {new Date(bookingData.checkOut).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Number of Nights:</span>
                <span className="detail-value">{bookingData.numberOfNights}</span>
              </div>
            </div>

            <div className="summary-section payment-details">
              <div className="detail-row">
                <span className="detail-label">Price Per Night:</span>
                <span className="detail-value">LKR {room.pricePerNight?.toLocaleString()} /=</span>
              </div>
              <div className="detail-row total-amount">
                <span className="detail-label">Total Amount:</span>
                <span className="detail-value">LKR {bookingData.totalAmount?.toLocaleString()} /=</span>
              </div>
            </div>

            {bookingData.specialRequests && (
              <div className="summary-section">
                <h3>Special Requests</h3>
                <p>{bookingData.specialRequests}</p>
              </div>
            )}
          </div>

          <div className="confirmation-actions">
            <button 
              onClick={() => window.print()}
              className="print-button"
            >
              Print Confirmation
            </button>
            <button 
              onClick={() => navigate('/HomeView')}
              className="home-button"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Nav />
      <div className="booking-container">
        <h1>Book Room {room.roomNumber}</h1>
        
        {error && <div className="error-message">{error}</div>}

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
      </div>
    </div>
  );
}

export default Booking;