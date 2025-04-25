import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Nav/Nav';
import Footer from '../Footer/Footer';
import './RoomDetails.css';

function RoomDetails() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        
        if (!token || role !== "manager") {
          navigate("/Login");
          return;
        }

        const { data } = await axios.get("http://localhost:5000/Rooms/", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data?.Room) {
          setRooms(data.Room);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setError("Failed to load rooms");
        if (error.response?.status === 401) {
          navigate("/Login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [navigate]);

  const handleAddRoom = () => {
    navigate('/AddRoom');
  };

  const handleEditRoom = (roomId) => {
    navigate(`/UpdateRooms/${roomId}`);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/Rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove room from state
      setRooms(rooms.filter(room => room._id !== roomId));
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room");
    }
  };

  if (loading) {
    return (
      <div className="room-details-page">
        <Nav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading rooms...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-details-page">
        <Nav />
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="room-details-page">
      <Nav />
      <div className="room-details-container">
        <div className="room-details-header">
          <div className="header-content">
            <h1 data-text="Room Management">Room Management</h1>
            <p>Efficiently manage and organize hotel rooms</p>
          </div>
        </div>

        <div className="rooms-grid">
          {rooms.map(room => (
            <div key={room._id} className="room-card">
              <div className="room-image">
                {room.image ? (
                  <img 
                    src={room.image} 
                    alt={`Room ${room.roomNumber}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1566669437685-d5f39244e1e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80";
                    }}
                  />
                ) : (
                  <div className="no-image">No Image Available</div>
                )}
              </div>

              <div className="room-info">
                <div className="room-header">
                  <h2>Room {room.roomNumber}</h2>
                  <div className="room-price">
                    LKR {room.pricePerNight?.toLocaleString()} /=
                  </div>
                </div>

                <div className="room-details-grid">
                  <p><strong>Type:</strong> {room.roomType}</p>
                  <p><strong>Features:</strong> {room.features}</p>
                  <p><strong>Capacity:</strong> {room.capacity}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-${room.status?.toLowerCase()}`}>
                      {room.status}
                    </span>
                  </p>
                </div>

                <p className="room-description">
                  <strong>Description:</strong> {room.description}
                </p>

                <div className="room-actions">
                  <button 
                    onClick={() => handleEditRoom(room._id)}
                    className="edit-button"
                  >
                    Edit Room
                  </button>
                  <button 
                    onClick={() => handleDeleteRoom(room._id)}
                    className="delete-button"
                  >
                    Delete Room
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RoomDetails;