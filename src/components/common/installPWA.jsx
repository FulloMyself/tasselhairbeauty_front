import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Capture the install prompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      setIsInstallable(true);
      // Show the banner after a delay
      setTimeout(() => setShowBanner(true), 3000);
    };

    // Check if app was successfully installed
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully!');
      setIsInstalled(true);
      setIsInstallable(false);
      setShowBanner(false);
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
    if (!deferredPrompt) {
      // Fallback for browsers that don't support the install prompt
      alert(
        'To install the app:\n\n' +
        '📱 Android: Tap the menu (⋮) → "Install app" or "Add to Home Screen"\n\n' +
        '📱 iPhone/iPad: Tap the Share button → "Add to Home Screen"\n\n' +
        '💻 Desktop: Click the install icon in the address bar'
      );
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      // Clear the prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowBanner(false);
    } catch (error) {
      console.error('Install failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  // Don't show anything if already installed
  if (isInstalled) return null;

  return (
    <>
      {/* Floating Install Banner */}
      {showBanner && (
        <div className="install-banner">
          <div className="install-banner-content">
            <div className="install-icon">
              <img src="/assets/icons/web-app-manifest-192x192.png" alt="Tassel Studio" />
            </div>
            <div className="install-text">
              <h4>Install Tassel Studio App</h4>
              <p>Quick access to bookings & shop</p>
            </div>
            <button className="install-btn" onClick={handleInstallClick}>
              Install
            </button>
            <button className="dismiss-btn" onClick={handleDismiss}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Persistent Install Button (small, floating) */}
      {isInstallable && !showBanner && (
        <button 
          className="install-fab" 
          onClick={handleInstallClick}
          title="Install App"
        >
          <i className="fas fa-download"></i>
        </button>
      )}
    </>
  );
};

export default InstallPWA;