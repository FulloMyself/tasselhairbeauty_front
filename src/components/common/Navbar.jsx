import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onBookNow }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Handle anchor link navigation
  const handleAnchorClick = (e, sectionId) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    if (location.pathname !== '/') {
      // Navigate to home first, then scroll to section
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.querySelector(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBookNow = () => {
    setIsMenuOpen(false);
    onBookNow();
  };

  return (
    <nav>
      <div className="logo">
        <Link to="/" onClick={handleLinkClick}>
          TASSEL<span>Hair & Beauty Studio</span>
        </Link>
      </div>

      <button 
        className={`hamburger ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`nav-links ${isMenuOpen ? 'show' : ''}`}>
        <li><a href="/#hero" onClick={(e) => handleAnchorClick(e, '#hero')}>Home</a></li>
        <li><a href="/#why" onClick={(e) => handleAnchorClick(e, '#why')}>Why Tassel</a></li>
        <li><a href="/#services" onClick={(e) => handleAnchorClick(e, '#services')}>Services</a></li>
        <li><a href="/#specials" onClick={(e) => handleAnchorClick(e, '#specials')}>Specials</a></li>
        <li><a href="/#gallery" onClick={(e) => handleAnchorClick(e, '#gallery')}>Gallery</a></li>
        <li><a href="/#about" onClick={(e) => handleAnchorClick(e, '#about')}>About</a></li>
        <li><a href="/#reviews" onClick={(e) => handleAnchorClick(e, '#reviews')}>Reviews</a></li>
        <li><a href="/#brands" onClick={(e) => handleAnchorClick(e, '#brands')}>Brands</a></li>
        <li><a href="/#location" onClick={(e) => handleAnchorClick(e, '#location')}>Find us</a></li>
        <li><a href="./assets/pricelists/Tassel_Full_Services_PriceList.pdf" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>Prices</a></li>
        {user ? (
          <>
            <li><Link to="/dashboard" onClick={handleLinkClick}>Dashboard</Link></li>
            <li><Link to="/booking" onClick={handleLinkClick}>Book Now</Link></li>
            <li>
              <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" onClick={handleLinkClick}>Login</Link></li>
          </>
        )}
      </ul>

      <button className="nav-btn desktop-book-btn" onClick={handleBookNow}>
        <i className="fas fa-calendar-check"></i> Book now
      </button>
    </nav>
  );
};

export default Navbar;