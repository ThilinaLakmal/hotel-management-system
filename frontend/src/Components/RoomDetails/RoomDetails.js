import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import "./RoomDetails.css";

const CACHE_KEY = "cachedRooms";
const API_TIMEOUT = 3000;

function Roomdetails() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  const fetchRooms = useCallback(async (signal) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const { data } = await axios.get("http://localhost:5000/Rooms/", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: API_TIMEOUT,
        signal
      });
      const validRooms = data?.Room || [];
      setRooms(validRooms);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(validRooms));
    } catch (error) {
      if (error.name !== "CanceledError") {
        console.error("Fetch error:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    }
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    
    // Load cached data immediately
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) setRooms(JSON.parse(cachedData));
    
    // Fetch fresh data
    fetchRooms(controller.signal);

    return () => controller.abort();
  }, [fetchRooms]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/Rooms/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setRooms(prev => prev.filter(r => r._id !== id));
      sessionStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete room");
    }
  };

  return (
    <div className="room-details-page">
      <Nav />
      <div className="room-details-header">
        <h1>Available Rooms</h1>
        <button onClick={() => navigate("/AddRooms")} className="add-room-button">
          Add Room
        </button>
      </div>

      <div className="room-cards-container">
        {rooms.map(room => (
          <RoomCard 
            key={room._id} 
            room={room} 
            onEdit={() => navigate(`/UpdateRooms/${room._id}`)}
            onDelete={() => handleDelete(room._id)}
          />
        ))}
      </div>
    </div>
  );
}

const RoomCard = React.memo(({ room, onEdit, onDelete }) => (
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
    </div>
    <div className="room-actions">
      <button onClick={onEdit} className="update-button">Edit</button>
      <button onClick={onDelete} className="delete-button">Delete</button>
    </div>
  </div>
));

export default React.memo(Roomdetails);