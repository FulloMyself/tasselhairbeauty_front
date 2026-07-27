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
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTooltip, setShowIOSTooltip] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed (works for both platforms)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // iOS doesn't support beforeinstallprompt
    if (isIOSDevice) {
      setIsInstallable(true); // Always show install option for iOS
      return;
    }

    // Android/Desktop: Capture the install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowIOSTooltip(false);
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

    // iOS: Show tooltip pointing to Share button
    if (isIOS) {
      setShowIOSTooltip(true);
      // Auto-dismiss after 6 seconds
      setTimeout(() => setShowIOSTooltip(false), 6000);
      return;
    }

    // Android/Desktop: Use native prompt
    if (!deferredPrompt) {
      alert(
        'To install the app:\n\n' +
        '📱 Android: Tap menu (⋮) → "Install app"\n' +
        '💻 Desktop: Click the install icon in the address bar'
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
    <>
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

          {/* Install App Button - shows for both iOS and Android */}
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

      {/* iOS Install Tooltip - Simple overlay pointing to Share button */}
      {showIOSTooltip && (
        <div className="ios-install-overlay" onClick={() => setShowIOSTooltip(false)}>
          <div className="ios-tooltip">
            <div className="ios-tooltip-arrow"></div>
            <div className="ios-tooltip-content">
              <div className="ios-tooltip-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" fill="#007AFF" />
                  <path d="M12 2V15M12 2L8 6M12 2L16 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div className="ios-tooltip-text">
                <strong>Tap the Share button</strong>
                <span>then "Add to Home Screen"</span>
              </div>
            </div>
            <button className="ios-tooltip-close" onClick={() => setShowIOSTooltip(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;