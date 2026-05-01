import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    window.location.href = '/Login';
  };

  return (
    <nav className={`nav-panel ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="logo">
          <span className="hotel-name">NATURE'S LAKE VIEW</span>
        </div>
        
        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          {role === 'guest' && (
            <>
              <Link to="/HomeView" className="nav-link">Home</Link>
              <Link to="/MyBookings" className="nav-link">My Bookings</Link>
              <Link to="/Profile" className="nav-link">Profile</Link>
            </>
          )}
          
          {role === 'manager' && (
            <>
              <Link to="/RoomDetails" className="nav-link">Rooms</Link>
              <Link to="/AddRooms" className="nav-link">Add Room</Link>
            </>
          )}
        </div>
        
        <div className="nav-actions">
          {userName && role === 'guest' && (
            <span className="nav-user-name">
              <span className="user-avatar-small">{userName.charAt(0).toUpperCase()}</span>
              {userName}
            </span>
          )}
          <button className="nav-button" onClick={handleLogout}>
            Logout
          </button>
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;