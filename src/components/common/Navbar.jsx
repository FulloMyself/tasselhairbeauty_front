import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onBookNow }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    setIsMenuOpen(false);
    
    if (!deferredPrompt) {
      alert(
        'To install the app:\n\n' +
        '📱 Android: Tap menu (⋮) → "Install app"\n' +
        '📱 iPhone: Tap Share → "Add to Home Screen"\n' +
        '💻 Desktop: Click install icon in address bar'
      );
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Install prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleAnchorClick = (e, sectionId) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.querySelector(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBookNow = () => {
    setIsMenuOpen(false);
    if (user) {
      onBookNow();
    } else {
      navigate('/register');
    }
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
        
        {/* Install App Button - only shows when installable and not installed */}
        {isInstallable && !isInstalled && (
          <li>
            <button onClick={handleInstallClick} className="nav-install-btn">
              <i className="fas fa-download"></i> Install App
            </button>
          </li>
        )}
        
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
        <i className="fas fa-calendar-check"></i> {user ? 'Book now' : 'Register now'}
      </button>
    </nav>
  );
};

export default Navbar;