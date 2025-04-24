import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";

function HomeView() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  const fetchRooms = useCallback(async (signal) => {
    try {
      const { data } = await axios.get("http://localhost:5000/Rooms/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        signal
      });
      const validRooms = data?.Room || [];
      setRooms(validRooms);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleBookNow = (roomId) => {
    navigate(`/Booking/${roomId}`);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchRooms(controller.signal);
    return () => controller.abort();
  }, [fetchRooms]);

  return (
    <div className="room-details-page">
      <Nav />
      <div className="room-details-header">
        <h1>Available Rooms</h1>
      </div>

      <div className="room-cards-container">
        {rooms.map(room => (
          <RoomCard 
            key={room._id} 
            room={room} 
            onBookNow={handleBookNow}
          />
        ))}
      </div>
    </div>
  );
}

const RoomCard = ({ room, onBookNow }) => (
  <div className="room-card">
    <div className="room-image">
      {room.image ? (
        <img 
          src={room.image} 
          alt={`Room ${room.roomNumber}`}
          loading="lazy"
          onError={(e) => (e.target.src = "path_to_default_image.jpg")}
        />
      ) : (
        <div className="no-image">No Image Available</div>
      )}
    </div>
    <div className="room-info">
      <h2>Room {room.roomNumber}</h2>
      <p><strong>Type:</strong> {room.roomType}</p>
      <p><strong>Price:</strong> LKR {room.pricePerNight?.toLocaleString()} /=</p>
      <p><strong>Features:</strong> {room.features}</p>
      <p><strong>Capacity:</strong> {room.capacity}</p>
      <p><strong>Status:</strong> <span className={`status-${room.status?.toLowerCase()}`}>{room.status}</span></p>
      <p><strong>Description:</strong> {room.description}</p>
      
      <button 
        style={{
          backgroundColor: '#1a237e',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          marginTop: '20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: '600',
          width: '50%',
          transition: 'background-color 0.3s',
          letterSpacing: '0.5px'
        }}
        onClick={() => onBookNow(room._id)}
        onMouseOver={(e) => e.target.style.backgroundColor = '#303f9f'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#1a237e'}
      >
        BOOK NOW
      </button>
    </div>
  </div>
);

export default React.memo(HomeView);