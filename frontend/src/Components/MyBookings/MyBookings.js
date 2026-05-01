import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import "./MyBookings.css";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editData, setEditData] = useState({});
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/Login"); return; }
      const response = await axios.get("http://localhost:5000/api/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings || []);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/Login"); return; }
      setError("Failed to load bookings.");
    } finally { setLoading(false); }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking._id);
    setEditData({
      checkInDate: booking.checkInDate.split("T")[0],
      checkOutDate: booking.checkOutDate.split("T")[0],
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      specialRequests: booking.specialRequests || ""
    });
  };

  const handleEditChange = (e) => { setEditData({ ...editData, [e.target.name]: e.target.value }); };

  const handleSaveEdit = async (bookingId) => {
    setActionLoading(true); setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.map(b => b._id === bookingId ? response.data.booking : b));
      setEditingBooking(null);
      setSuccessMessage("Booking updated!"); setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) { setError(err.response?.data?.message || "Failed to update booking"); }
    finally { setActionLoading(false); }
  };

  const handleCancelBooking = async (bookingId) => {
    setActionLoading(true); setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: "Cancelled" } : b));
      setCancelConfirm(null);
      setSuccessMessage("Booking cancelled!"); setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) { setError(err.response?.data?.message || "Failed to cancel booking"); }
    finally { setActionLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
  const calcNights = (a, b) => Math.round(Math.abs((new Date(b) - new Date(a)) / 86400000));
  const getStatusClass = (s) => s === "Confirmed" ? "status-confirmed" : s === "Cancelled" ? "status-cancelled" : "status-completed";
  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return (<div className="mybookings-page"><Nav /><div className="mybookings-loading"><div className="loading-spinner"></div><p>Loading bookings...</p></div></div>);

  return (
    <div className="mybookings-page">
      <Nav />
      <div className="mybookings-hero"><div className="mybookings-hero-overlay"></div><div className="mybookings-hero-content"><h1>My Bookings</h1><p>View and manage your reservations</p></div></div>
      <div className="mybookings-content">
        {successMessage && <div className="mybookings-success"><span>✓</span> {successMessage}</div>}
        {error && <div className="mybookings-error"><span>⚠️</span> {error}</div>}

        <div className="booking-filters">
          {["all","Confirmed","Cancelled","Completed"].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f} ({f === "all" ? bookings.length : bookings.filter(b => b.status === f).length})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="no-bookings"><div className="no-bookings-icon">📋</div><h2>No Bookings Found</h2><p>{filter === "all" ? "You haven't made any reservations yet." : `No ${filter.toLowerCase()} bookings.`}</p><button className="browse-rooms-btn" onClick={() => navigate("/HomeView")}>Browse Rooms</button></div>
        ) : (
          <div className="bookings-list">
            {filtered.map((booking) => (
              <div key={booking._id} className={`booking-card ${getStatusClass(booking.status)}`}>
                {cancelConfirm === booking._id && (
                  <div className="cancel-modal-overlay"><div className="cancel-modal"><h3>Cancel Booking?</h3><p>This action cannot be undone.</p><div className="cancel-modal-actions"><button className="confirm-cancel-btn" onClick={() => handleCancelBooking(booking._id)} disabled={actionLoading}>{actionLoading ? "Cancelling..." : "Yes, Cancel"}</button><button className="keep-booking-btn" onClick={() => setCancelConfirm(null)}>Keep Booking</button></div></div></div>
                )}
                <div className="booking-card-header">
                  <div className="booking-room-info">
                    {booking.roomId?.image && <img src={booking.roomId.image} alt={`Room ${booking.roomId.roomNumber}`} className="booking-thumb" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1566669437685-d5f39244e1e9?w=400&q=80"; }} />}
                    <div><h3>Room {booking.roomId?.roomNumber || "N/A"}</h3><span className="room-type-tag">{booking.roomId?.roomType || "N/A"}</span></div>
                  </div>
                  <span className={`booking-status-badge ${getStatusClass(booking.status)}`}>{booking.status}</span>
                </div>

                {editingBooking === booking._id ? (
                  <div className="booking-edit-form">
                    <div className="edit-form-grid">
                      <div className="edit-form-group"><label>Check-in</label><input type="date" name="checkInDate" value={editData.checkInDate} onChange={handleEditChange} min={new Date().toISOString().split('T')[0]} /></div>
                      <div className="edit-form-group"><label>Check-out</label><input type="date" name="checkOutDate" value={editData.checkOutDate} onChange={handleEditChange} min={editData.checkInDate} /></div>
                      <div className="edit-form-group"><label>Name</label><input type="text" name="guestName" value={editData.guestName} onChange={handleEditChange} /></div>
                      <div className="edit-form-group"><label>Phone</label><input type="tel" name="guestPhone" value={editData.guestPhone} onChange={handleEditChange} /></div>
                    </div>
                    <div className="edit-form-group full-width"><label>Special Requests</label><textarea name="specialRequests" value={editData.specialRequests} onChange={handleEditChange} rows="2" /></div>
                    <div className="edit-actions"><button className="save-edit-btn" onClick={() => handleSaveEdit(booking._id)} disabled={actionLoading}>{actionLoading ? "Saving..." : "Save Changes"}</button><button className="cancel-edit-btn" onClick={() => setEditingBooking(null)}>Cancel</button></div>
                  </div>
                ) : (
                  <>
                    <div className="booking-card-details">
                      <div className="booking-dates">
                        <div className="date-block"><span className="date-label">Check-in</span><span className="date-value">{formatDate(booking.checkInDate)}</span></div>
                        <div className="date-divider"><span className="nights-count">{calcNights(booking.checkInDate, booking.checkOutDate)} night(s)</span><div className="divider-line"></div></div>
                        <div className="date-block"><span className="date-label">Check-out</span><span className="date-value">{formatDate(booking.checkOutDate)}</span></div>
                      </div>
                      <div className="booking-guest-info">
                        <div className="guest-detail"><span className="detail-icon">👤</span><span>{booking.guestName}</span></div>
                        <div className="guest-detail"><span className="detail-icon">✉️</span><span>{booking.guestEmail}</span></div>
                        <div className="guest-detail"><span className="detail-icon">📱</span><span>{booking.guestPhone}</span></div>
                      </div>
                      {booking.specialRequests && <div className="booking-special-requests"><span className="detail-icon">📝</span><span>{booking.specialRequests}</span></div>}
                      <div className="booking-pricing">
                        <span className="price-per-night">LKR {booking.roomId?.pricePerNight?.toLocaleString()} /night</span>
                        <span className="total-price">Total: LKR {(booking.roomId?.pricePerNight * calcNights(booking.checkInDate, booking.checkOutDate))?.toLocaleString()} /=</span>
                      </div>
                    </div>
                    {booking.status === "Confirmed" && (
                      <div className="booking-card-actions">
                        <button className="edit-booking-btn" onClick={() => handleEdit(booking)}>✏️ Edit</button>
                        <button className="cancel-booking-btn" onClick={() => setCancelConfirm(booking._id)}>✕ Cancel</button>
                      </div>
                    )}
                  </>
                )}
                <div className="booking-card-footer"><span className="booked-date">Booked on {formatDate(booking.bookingDate)}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default MyBookings;
