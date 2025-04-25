import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import "./HomeView.css";

const CACHE_KEY = "cachedRooms";
const API_TIMEOUT = 3000;

// Mock data for testing with better quality images
const mockRooms = [
  {
    _id: "1",
    roomNumber: "101",
    roomType: "Deluxe Suite",
    pricePerNight: 25000,
    features: "King bed, Ocean view, Balcony",
    capacity: "2 Adults",
    status: "Available",
    description: "Spacious suite with stunning ocean views and modern amenities",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    _id: "2",
    roomNumber: "102",
    roomType: "Executive Suite",
    pricePerNight: 35000,
    features: "King bed, City view, Jacuzzi",
    capacity: "2 Adults",
    status: "Available",
    description: "Luxurious suite with panoramic city views and premium amenities",
    image: "https://images.unsplash.com/photo-1566669437685-d5f39244e1e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    _id: "3",
    roomNumber: "103",
    roomType: "Presidential Suite",
    pricePerNight: 50000,
    features: "King bed, Panoramic view, Private pool",
    capacity: "2 Adults",
    status: "Available",
    description: "Ultimate luxury with breathtaking views and exclusive amenities",
    image: "https://images.unsplash.com/photo-1566669437685-d5f39244e1e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  }
];

function HomeView() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const prefetchedRooms = useRef(new Set());

  const backgroundImages = [
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        // Add 'previous' class to current slide
        const currentElement = document.querySelector(`.slide.active`);
        if (currentElement) {
          currentElement.classList.add('previous');
        }
        
        // Calculate next slide
        const nextSlide = (prevSlide + 1) % backgroundImages.length;
        
        // Remove 'previous' class after transition
        setTimeout(() => {
          if (currentElement) {
            currentElement.classList.remove('previous');
          }
        }, 2500); // Increased to 2.5s to match slower transition
        
        return nextSlide;
      });
    }, 6000); // Increased to 6s for slower slideshow

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const fetchRooms = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      
      if (!token || role !== "guest") {
        navigate("/Login");
        return;
      }

      try {
        const { data } = await axios.get("http://localhost:5000/Rooms/", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: API_TIMEOUT,
          signal
        });

        const validRooms = data?.Room || [];
        setRooms(validRooms);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(validRooms));
      } catch (apiError) {
        console.error("API Error:", apiError);
        // Try to get cached data if API fails
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          setRooms(JSON.parse(cachedData));
        } else {
          setError("Failed to load rooms. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/Login");
      } else {
        setError("Failed to load rooms. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    
    // Load cached data immediately
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) {
      setRooms(JSON.parse(cachedData));
      setLoading(false);
    }
    
    // Fetch fresh data
    fetchRooms(controller.signal);

    return () => controller.abort();
  }, [fetchRooms]);

  // Optimized navigation handler - even faster version
  const handleBookNow = useCallback((roomId) => {
    // Immediately navigate without any data storage
    navigate(`/Booking/${roomId}`, { 
      replace: true,
      state: { 
        roomId,
        timestamp: Date.now() // Add timestamp to prevent caching issues
      }
    });
  }, [navigate]);

  // Simplified but complete RoomCard component
  const RoomCard = React.memo(({ room, onBookNow }) => (
    <div className="room-card">
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
          <h2 className="room-title">Room {room.roomNumber}</h2>
          <div className="room-price">
            LKR {room.pricePerNight?.toLocaleString()} /=
          </div>
        </div>
        
        <div className="room-features">
          <p><strong>Type:</strong> {room.roomType}</p>
          <p><strong>Features:</strong> {room.features}</p>
          <p><strong>Capacity:</strong> {room.capacity}</p>
          <p><strong>Status:</strong> 
            <span className={`status-${room.status?.toLowerCase()}`}>
              {room.status}
            </span>
          </p>
        </div>
        
        <p className="room-description"><strong>Description:</strong> {room.description}</p>
        
        {room.status?.toLowerCase() === 'available' && (
          <button 
            onClick={() => onBookNow(room._id)}
            className="book-now-button"
          >
            BOOK NOW
          </button>
        )}
      </div>
    </div>
  ));

  return (
    <div className="room-details-page">
      <Nav />
      <div className="room-details-header">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="header-content">
          <h1 className="luxury-title">LUXURY ROOMS & SUITES</h1>
          <p>Experience unparalleled comfort and elegance</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading rooms...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      ) : rooms.length === 0 ? (
        <div className="no-rooms-container">
          <p>No rooms available at the moment.</p>
        </div>
      ) : (
        <div className="room-cards-container">
          {rooms.map(room => (
            <RoomCard 
              key={room._id} 
              room={room} 
              onBookNow={handleBookNow}
            />
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
}

// Optimize component with React.memo and proper dependencies
export default React.memo(HomeView, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});