import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onBookNow }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav>
      <div className="logo">
        TASSEL<span>Hair & Beauty Studio</span>
      </div>
      <ul className="nav-links"><li><a href="#hero">Home</a></li>
      <li><a href="#why">Why Tassel</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#specials">Specials</a></li>
      <li><a href="#gallery">Gallery</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#reviews">Reviews</a></li>
      <li><a href="#brands">Brands</a></li>
      <li><a href="#location">Find us</a></li>
      <li><a href="/assets/pricelists/Tassel_Full_Services_PriceList.pdf" target="_blank">Prices</a></li>
        {user ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Logout</button></li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
      <button className="nav-btn" onClick={onBookNow}>
        <i className="fas fa-calendar-check"></i> Book now
      </button>
    </nav>
  );
};

export default Navbar;