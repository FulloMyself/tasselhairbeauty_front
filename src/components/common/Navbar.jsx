import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onBookNow }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav>
      <div className="logo">
        TASSEL<span>Hair & Beauty Studio</span>
      </div>

      {/* Hamburger Button for Mobile */}
      <button 
        className={`hamburger ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation Links */}
      <ul className={`nav-links ${isMenuOpen ? 'show' : ''}`}>
        <li><a href="/#hero" onClick={handleLinkClick}>Home</a></li>
        <li><a href="/#why" onClick={handleLinkClick}>Why Tassel</a></li>
        <li><a href="/#services" onClick={handleLinkClick}>Services</a></li>
        <li><a href="/#specials" onClick={handleLinkClick}>Specials</a></li>
        <li><a href="/#gallery" onClick={handleLinkClick}>Gallery</a></li>
        <li><a href="/#about" onClick={handleLinkClick}>About</a></li>
        <li><a href="/#reviews" onClick={handleLinkClick}>Reviews</a></li>
        <li><a href="/#brands" onClick={handleLinkClick}>Brands</a></li>
        <li><a href="/#location" onClick={handleLinkClick}>Find us</a></li>
        <li><a href="/assets/pricelists/Tassel_Full_Services_PriceList.pdf" target="_blank" onClick={handleLinkClick}>Prices</a></li>
        {user ? (
          <>
            <li><Link to="/dashboard" onClick={handleLinkClick}>Dashboard</Link></li>
            <li>
              <button 
                onClick={handleLogout} 
                className="nav-logout-btn"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/login" onClick={handleLinkClick}>Login</Link></li>
        )}
      </ul>

      {/* Book Now Button - Desktop Only */}
      <button className="nav-btn desktop-book-btn" onClick={onBookNow}>
        <i className="fas fa-calendar-check"></i> Book now
      </button>
    </nav>
  );
};

export default Navbar;