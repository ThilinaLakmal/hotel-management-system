import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingSummary.css';

const BookingSummary = ({ bookingData }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="booking-summary">
      <div className="summary-container">
        <h2>Booking Confirmation</h2>
        <div className="confirmation-message">
          <i className="fas fa-check-circle"></i>
          <p>Your booking has been confirmed!</p>
        </div>

        <div className="summary-details">
          <div className="summary-section">
            <h3>Room Details</h3>
            <p><strong>Room Number:</strong> {bookingData.roomNumber}</p>
            <p><strong>Room Type:</strong> {bookingData.roomType}</p>
          </div>

          <div className="summary-section">
            <h3>Guest Information</h3>
            <p><strong>Name:</strong> {bookingData.guestName}</p>
            <p><strong>Email:</strong> {bookingData.guestEmail}</p>
            <p><strong>Phone:</strong> {bookingData.guestPhone}</p>
          </div>

          <div className="summary-section">
            <h3>Stay Details</h3>
            <p><strong>Check-in:</strong> {formatDate(bookingData.checkIn)}</p>
            <p><strong>Check-out:</strong> {formatDate(bookingData.checkOut)}</p>
            <p><strong>Number of Nights:</strong> {bookingData.numberOfNights}</p>
          </div>

          <div className="summary-section payment-details">
            <h3>Payment Details</h3>
            <p><strong>Total Amount:</strong> 
              <span className="total-amount">
                LKR {bookingData.totalAmount?.toLocaleString()} /=
              </span>
            </p>
          </div>

          {bookingData.specialRequests && (
            <div className="summary-section">
              <h3>Special Requests</h3>
              <p>{bookingData.specialRequests}</p>
            </div>
          )}
        </div>

        <div className="summary-actions">
          <button 
            className="print-button"
            onClick={() => window.print()}
          >
            Print Confirmation
          </button>
          <button 
            className="home-button"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary; 