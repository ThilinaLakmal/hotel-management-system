import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const role = localStorage.getItem('role');

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
              <Link to="#" className="nav-link">Rooms</Link>
              <Link to="#" className="nav-link">Services</Link>
              <Link to="#" className="nav-link">Contact</Link>
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