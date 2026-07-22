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
  const [showIOSGuide, setShowIOSGuide] = useState(false);

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
    
    // iOS: Show instructions modal
    if (isIOS) {
      setShowIOSGuide(true);
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

      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div className="ios-install-overlay" onClick={() => setShowIOSGuide(false)}>
          <div className="ios-install-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ios-modal-close" onClick={() => setShowIOSGuide(false)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="ios-install-content">
              <div className="ios-install-icon">
                <img src="/assets/icons/web-app-manifest-192x192.png" alt="Tassel Studio" />
              </div>
              <h2>Install Tassel Studio</h2>
              <p>Add our app to your home screen for quick access</p>
              
              <div className="ios-steps">
                <div className="ios-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <p>Tap the <strong>Share</strong> button</p>
                    <div className="step-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="4" width="20" height="16" rx="3" fill="#007AFF"/>
                        <path d="M12 2V15M12 2L8 6M12 2L16 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="ios-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <p>Scroll and tap <strong>Add to Home Screen</strong></p>
                    <div className="step-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="3" width="16" height="18" rx="3" fill="#007AFF"/>
                        <path d="M12 8V16M8 12H16" stroke="white" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="ios-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <p>Tap <strong>Add</strong> in the top right</p>
                    <p className="step-hint">The app will appear on your home screen</p>
                  </div>
                </div>
              </div>
              
              <button className="ios-got-it-btn" onClick={() => setShowIOSGuide(false)}>
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;