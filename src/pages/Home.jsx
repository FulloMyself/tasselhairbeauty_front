import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Home = () => {
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSpecialSlide, setCurrentSpecialSlide] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeMediaFilter, setActiveMediaFilter] = useState('all');
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxContent, setLightboxContent] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const basePath = '/tasselhairbeauty_front';


  // Team members data
  const teamMembers = [
    { id: 1, name: "Sandra", role: "Staff - Nails Department", specialization: "Nail Tech", image: "./assets/images/team/sandra.jpeg", bio: "Sandra is a skilled nail technician with a passion for creating beautiful and unique nail designs.", quote: "Beautiful nails are the perfect finishing touch to any look.", instagram: "https://www.instagram.com/tasselhairandbeautystudio_/", whatsapp: "https://wa.me/27729605153" },
    { id: 2, name: "Nomonde", role: "Staff - Beauty and Skincare Department", specialization: "Beauty Therapist", image: "./assets/images/team/nomonde.jpeg", bio: "Nomonde brings precision and artistry to every treatment.", quote: "Healthy skin is beautiful skin.", instagram: "https://www.instagram.com/tasselhairandbeautystudio_/", whatsapp: "https://wa.me/27729605153" },
    { id: 3, name: "Natasha", role: "Staff - Hair and Kiddies Department", specialization: "Kiddies Hair Stylist", image: "./assets/images/team/natasha.jpeg", bio: "Natasha's creative styling and gentle approach have made her a favorite among young clients.", quote: "Every child deserves to feel special.", instagram: "https://www.instagram.com/tasselhairandbeautystudio_/", whatsapp: "https://wa.me/27729605153" },
    { id: 4, name: "Cynthia", role: "Staff - Hair and Kiddies Department", specialization: "Kiddies Hair Stylist", image: "./assets/images/team/cynthia.jpeg", bio: "Cynthia specializes in creating magical hairstyles for children.", quote: "Beautiful hair expresses personality.", instagram: "https://www.instagram.com/tasselhairandbeautystudio_/", whatsapp: "https://wa.me/27729605153" },
    { id: 5, name: "Tiny", role: "Staff - Hair and Kiddies Department", specialization: "Kiddies Hair Stylist", image: "./assets/images/team/tiny.jpeg", bio: "Tiny's gentle approach makes kids feel comfortable.", quote: "Every child's hair is unique.", instagram: "https://www.instagram.com/tasselhairandbeautystudio_/", whatsapp: "https://wa.me/27729605153" },
    { id: 6, name: "Thando", role: "Staff - Hair and Kiddies Department", specialization: "Kiddies Hair Stylist", image: "./assets/images/team/thando.jpeg", bio: "Thando loves creating fun styles for kids.", quote: "Happy kids, happy parents.", instagram: "https://www.instagram.com/tasselhairandbeautystudio_/", whatsapp: "https://wa.me/27729605153" },
    { id: 7, name: "Keisha", role: "Staff - Receptionist and Hair Department", specialization: "Hair Stylist, Receptionist", image: "./assets/images/team/keisha.jpeg", bio: "The friendly face behind your bookings.", quote: "Your smile is our greatest reward.", instagram: "https://www.instagram.com/tasselhairandbeautystudio_/", whatsapp: "https://wa.me/27729605153" },
    { id: 8, name: "Cheslyn", role: "Staff - Hair Department", specialization: "Barber", image: "./assets/images/team/cheslyn.jpeg", bio: "Cheslyn specializes in precision cuts for men and children.", quote: "A great haircut changes everything.", instagram: "https://www.instagram.com/tasselhairandbeautystudio_/", whatsapp: "https://wa.me/27729605153" }
  ];

  // Gallery items
  const galleryItems = [
    { type: 'photo', category: 'kids', src: './assets/images/compressed_CuteBabyBraids.jpeg}', caption: 'Kiddies Braiding' },
    { type: 'photo', category: 'studio', src: './assets/images/compressed_KiddiesStation.jpeg}', caption: 'Kiddies Station' },
    { type: 'video', category: 'barber', src: './assets/videos/MensCutAndWash.mp4}', poster: '/assets/images/MensHairCut.png', caption: 'Men\'s Haircut Session' },
    { type: 'photo', category: 'hair', src: './assets/images/compressed_AdultHair.jpeg}', caption: 'Professional Styling' },
    { type: 'photo', category: 'kids', src: './assets/images/KiddiesHairstyleSession.jpeg}', caption: 'Kiddies Hairstyle Session' },
    { type: 'video', category: 'welcome', src: './assets/videos/Welcome.mp4}', poster: '/assets/images/compressed_Receptionist.jpeg', caption: 'Welcome To Tassel' },
    { type: 'photo', category: 'kids', src: './assets/images/CuteBabyTasselLogo.jpeg}', caption: 'Happy Kids, Beautiful Experiences' },
    { type: 'video', category: 'nails', src: './assets/videos/Tassel.mp4}', poster: '/assets/images/compressed_TasselNailBar.jpeg', caption: 'Book With Us' },
    { type: 'photo', category: 'studio', src: './assets/images/compressed_Seat.jpeg}', caption: 'Relaxation Lounge' },
    { type: 'video', category: 'barber', src: './assets/videos/BarbarSection.mp4}', poster: '/assets/images/MensHairstyle.png', caption: 'Barber Section' },
    { type: 'video', category: 'welcome', src: './assets/videos/Books.mp4}', poster: '/assets/images/KiddiesCorner.jpeg', caption: 'Kiddies Corner' }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % 3), 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance specials carousel
  useEffect(() => {
    const interval = setInterval(() => setCurrentSpecialSlide((prev) => (prev + 1) % 4), 5000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for fade animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2, rootMargin: '20px' });

    const fadeElements = document.querySelectorAll('.fade');
    fadeElements.forEach(el => observer.observe(el));

    return () => fadeElements.forEach(el => observer.unobserve(el));
  }, []);

  // Nav shrink on scroll
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        nav.style.padding = window.scrollY > 50 ? '12px 40px' : '20px 40px';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target && target.getAttribute('href') !== '#') {
        e.preventDefault();
        const targetId = target.getAttribute('href');
        const element = document.querySelector(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 3);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  const nextSpecialSlide = () => setCurrentSpecialSlide((prev) => (prev + 1) % 4);
  const prevSpecialSlide = () => setCurrentSpecialSlide((prev) => (prev - 1 + 4) % 4);

  const openBooking = () => setShowBookingModal(true);
  const closeBooking = () => setShowBookingModal(false);
  const openReview = () => setShowReviewModal(true);
  const closeReview = () => setShowReviewModal(false);

  const openLightbox = (item) => {
    setLightboxContent(item);
    setShowLightbox(true);
  };
  const closeLightbox = () => {
    setShowLightbox(false);
    setLightboxContent(null);
  };

  const openTeamModal = (member) => {
    setSelectedTeamMember(member);
    setShowTeamModal(true);
  };
  const closeTeamModal = () => {
    setShowTeamModal(false);
    setSelectedTeamMember(null);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('fullName');
    const phone = formData.get('phoneNumber');
    const service = formData.get('serviceCategory');
    const date = formData.get('preferredDate');
    const time = formData.get('preferredTime');

    const message = `*NEW BOOKING REQUEST - TASSEL STUDIO*%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Service:* ${service}%0A*Date:* ${date}%0A*Time:* ${time}%0A%0A_Please confirm this booking._`;
    window.open(`https://wa.me/27729605153?text=${message}`, '_blank');
    closeBooking();
  };

  return (
    <div className="app">
      <Navbar onBookNow={openBooking} />

      <main>
        {/* HERO CAROUSEL */}
        <section id="hero" className="hero-carousel">
          <div className="carousel-container">
            <div className={`carousel-slide ${currentSlide === 0 ? 'active' : ''}`}>
              <img src="./assets/images/compressed_TasselNailBar.jpeg" alt="Luxury nail bar" className="carousel-image" />
              <div className="carousel-overlay"></div>
              <div className="carousel-content">
                <p className="hero-tag">Glenvista · Johannesburg South</p>
                <h1>Where <em>Kiddies Hair</em> meets <br />Luxury Family Beauty</h1>
                <p className="hero-sub">Premium Hair, Nails, Barber & Beauty — designed for families.</p>
                <div className="btn-group">
                  <button className="btn-primary" onClick={openBooking}><i className="fas fa-calendar-check"></i> Book Appointment</button>
                  <a href="https://maps.google.com/?q=101+Bellairs+Drive+Glenvista+Johannesburg" className="btn-outline" target="_blank" rel="noopener noreferrer"><i className="fas fa-location-dot"></i> Get Directions</a>
                </div>
              </div>
            </div>
            <div className={`carousel-slide ${currentSlide === 1 ? 'active' : ''}`}>
              <img src="./assets/images/compressed_FullTeam.jpeg" alt="Tassel Team" className="carousel-image" />
              <div className="carousel-overlay"></div>
              <div className="carousel-content">
                <p className="hero-tag">Top Class Team</p>
                <h1>Hairstylists, <br /><em>Beauty Experts</em></h1>
                <p className="hero-sub">Beauty for the whole family — a wholistic approach to family time.</p>
                <div className="btn-group">
                  <a href="./assets/pricelists/Tassel_Barber_Price_List.pdf" className="btn-primary" target="_blank" rel="noopener noreferrer"><i className="fas fa-cut"></i> View Barber Prices</a>
                  <button className="btn-outline" onClick={openBooking}><i className="fas fa-scissors"></i> Book Barber Slot</button>
                </div>
              </div>
            </div>
            <div className={`carousel-slide ${currentSlide === 2 ? 'active' : ''}`}>
              <img src="./assets/images/compressed_KiddiesStation.jpeg" alt="Kiddies Station" className="carousel-image" />
              <div className="carousel-overlay"></div>
              <div className="carousel-content">
                <p className="hero-tag">One-Stop Family Beauty</p>
                <h1>Parents & Kids <br /><em>Pampered Together</em></h1>
                <p className="hero-sub">Hair, barber, nails & beauty services for the whole family.</p>
                <div className="btn-group">
                  <button className="btn-primary" onClick={openBooking}><i className="fas fa-calendar-check"></i> Book Family Visit</button>
                  <a href="#services" className="btn-outline"><i className="fas fa-spa"></i> Explore Services</a>
                </div>
              </div>
            </div>
            <button className="carousel-control prev" onClick={prevSlide}><i className="fas fa-chevron-left"></i></button>
            <button className="carousel-control next" onClick={nextSlide}><i className="fas fa-chevron-right"></i></button>
            <div className="carousel-indicators">
              <span className={`indicator ${currentSlide === 0 ? 'active' : ''}`} onClick={() => setCurrentSlide(0)}></span>
              <span className={`indicator ${currentSlide === 1 ? 'active' : ''}`} onClick={() => setCurrentSlide(1)}></span>
              <span className={`indicator ${currentSlide === 2 ? 'active' : ''}`} onClick={() => setCurrentSlide(2)}></span>
            </div>
          </div>
        </section>

        {/* INTRO STRIP */}
        <div className="intro-strip">
          <p>A calm, professional studio offering <span>kiddies hair specialists</span>, <span>barber services</span>, adult hair, nails, skin and beauty — all in <span>one beautiful space.</span></p>
        </div>

        {/* WHY TASSEL */}
        <section id="why" className="section-wrap">
          <div className="container">
            <p className="label fade">Our difference</p>
            <h2 className="fade">Why Tassel is different</h2>
            <div className="pillars">
              <div className="pillar fade"><img src="./assets/images/KiddiesHairstyleSession.jpeg" alt="Child's hair styled" className="pillar-img" /><h3 className="pillar-title">Kiddies Hair Specialists</h3><p className="pillar-desc">Gentle, professional styling designed for children — in a warm, welcoming space.</p></div>
              <div className="pillar fade"><img src="./assets/images/MensHairCut.png" alt="Professional barber services" className="pillar-img" /><h3 className="pillar-title">Premium Barber Services</h3><p className="pillar-desc">Sharp fades, beard trims & modern cuts for boys and men. Walk-ins welcome.</p></div>
              <div className="pillar fade"><img src="./assets/images/compressed_ProductVariety.jpeg" alt="Products from Tassel" className="pillar-img" /><h3 className="pillar-title">One‑Stop Convenience</h3><p className="pillar-desc">Hair, barber & beauty services for the whole family — no more running around.</p></div>
              <div className="pillar fade"><img src="./assets/images/compressed_Seat.jpeg" alt="Luxury salon interior" className="pillar-img" /><h3 className="pillar-title">Luxury Experience</h3><p className="pillar-desc">A calm, clean, professional environment curated for a premium feel.</p></div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section-wrap" style={{ background: 'var(--soft)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
              <div><p className="label fade">What we offer</p><h2 className="fade" style={{ marginBottom: 0 }}>Our services</h2></div>
              <a href="./assets/pricelists/Tassel_Full_Services_PriceList.pdf" className="btn-primary" target="_blank" rel="noopener noreferrer" download><i className="fas fa-file-pdf"></i> View All Prices</a>
            </div>
            <div className="services-grid">
              <a href="./assets/pricelists/Tassel_Kiddies_Hair_PriceList.pdf" className="service-card fade" target="_blank" rel="noopener noreferrer" download><img src="/assets/images/compressed_KiddiesCuteHairstyle.jpeg" alt="Child getting hair done" className="service-img" /><h3 className="service-name">Kiddies Hair</h3><span className="service-link">Download Price List <i className="fas fa-download"></i></span></a>
              <a href="./assets/pricelists/Tassel_Barber_Price_List.pdf" className="service-card fade" target="_blank" rel="noopener noreferrer" download><img src="/assets/images/BarbarSection.jpeg" alt="Barber services" className="service-img" /><h3 className="service-name">Barber</h3><span className="service-link">Download Price List <i className="fas fa-download"></i></span></a>
              <a href="./assets/pricelists/Tassel_Adult_Hair_Pricelist.pdf" className="service-card fade" target="_blank" rel="noopener noreferrer" download><img src="/assets/images/compressed_AdultHair.jpeg" alt="Woman's hair styled" className="service-img" /><h3 className="service-name">Adult Hair</h3><span className="service-link">Download Price List <i className="fas fa-download"></i></span></a>
              <a href="./assets/pricelists/Tassel_Full_Services_PriceList.pdf" className="service-card fade" target="_blank" rel="noopener noreferrer" download><img src="/assets/images/compressed_TasselNails.jpg" alt="Tassel Luxury Beauty Studio" className="service-img" /><h3 className="service-name">Nails</h3><span className="service-link">Download Price List <i className="fas fa-download"></i></span></a>
              <a href="./assets/pricelists/Tassel_Services_PriceList.pdf" className="service-card fade" target="_blank" rel="noopener noreferrer" download><img src="/assets/images/TasselProducts.jpeg" alt="Facial treatment" className="service-img" /><h3 className="service-name">Skin & Beauty</h3><span className="service-link">Download Price List <i className="fas fa-download"></i></span></a>
            </div>
          </div>
        </section>

        {/* BARBER SECTION */}
        <section id="barber" className="section-wrap barber-section">
          <div className="container">
            <div className="barber-grid">
              <div className="barber-content">
                <p className="label fade">Premium Barber Services</p>
                <h2 className="fade">Sharp Styles.<br /><em>Confidence Boost.</em></h2>
                <div className="fade barber-features">
                  <div className="feature-item"><span className="feature-icon"><i className="fas fa-cut"></i></span><div><h4>Precision Haircuts</h4><p>Fades, tapers, scissor cuts & modern styles for all ages.</p></div></div>
                  <div className="feature-item"><span className="feature-icon"><i className="fas fa-user"></i></span><div><h4>Selfcare</h4><p>Hot towel shaves, beard trims & shaping.</p></div></div>
                  <div className="feature-item"><span className="feature-icon"><i className="fas fa-child"></i></span><div><h4>Kiddies Barber</h4><p>Gentle cuts for little gentlemen — patient & professional.</p></div></div>
                </div>
                <div className="btn-group fade">
                  <a href="./assets/pricelists/Tassel_Barber_Price_List.pdf" className="btn-primary" target="_blank" rel="noopener noreferrer"><i className="fas fa-cut"></i> View Barber Prices</a>
                  <button className="btn-outline" onClick={openBooking}><i className="fas fa-scissors"></i> Book Now</button>
                </div>
              </div>
              <div className="barber-image fade"><img src="./assets/images/BarbarSection.jpeg" alt="Barber Section at Tassel Studio" className="barber-img" /></div>
            </div>
          </div>
        </section>

        {/* SPECIALS SECTION */}
        <section id="specials" className="section-wrap specials-section">
          <div className="container">
            <p className="label fade">Limited Time Offers</p>
            <h2 className="fade">Current Specials</h2>
            <div className="specials-carousel-container">
              <div className="specials-carousel">
                <div className={`special-slide ${currentSpecialSlide === 0 ? 'active' : ''}`}><div className="special-card featured"><img src="./assets/specials/OpeningSpecials.jpeg" alt="FREE Kiddies Party Pack" className="special-poster" /><div className="special-badge"><i className="fas fa-fire"></i> HOT DEAL</div><div className="special-overlay"><h3>FREE Kiddies Party Pack</h3><p>With any kiddies haircut or styling service</p><div className="special-valid">Valid until: 30 April 2026</div><button className="btn-special" onClick={openBooking}><i className="fas fa-arrow-right"></i> Claim Now</button></div></div></div>
                <div className={`special-slide ${currentSpecialSlide === 1 ? 'active' : ''}`}><div className="special-card"><img src="./assets/specials/MidweekGlow.jpeg" alt="Midweek Glow" className="special-poster" /><div className="special-overlay"><h3>Midweek Glow</h3><p>With any beauty service</p><div className="special-valid">Limited time offer</div><button className="btn-special" onClick={openBooking}><i className="fas fa-arrow-right"></i> Book Now</button></div></div></div>
                <div className={`special-slide ${currentSpecialSlide === 2 ? 'active' : ''}`}><div className="special-card"><img src="./assets/specials/WaxyWednesdays.jpeg" alt="Waxy Wednesdays" className="special-poster" /><div className="special-overlay"><h3>Waxy Wednesdays</h3><p>With any beauty service</p><div className="special-valid">Limited time offer</div><button className="btn-special" onClick={openBooking}><i className="fas fa-arrow-right"></i> Book Now</button></div></div></div>
                <div className={`special-slide ${currentSpecialSlide === 3 ? 'active' : ''}`}><div className="special-card"><img src="./assets/specials/DadxMiniSpecial.jpeg" alt="Daddy & Mini" className="special-poster" /><div className="special-overlay"><h3>Daddy & Mini Special</h3><p>With any beauty service</p><div className="special-valid">Limited time offer</div><button className="btn-special" onClick={openBooking}><i className="fas fa-arrow-right"></i> Book Now</button></div></div></div>
                <div className={`special-slide ${currentSpecialSlide === 4 ? 'active' : ''}`}><div className="special-card"><img src="./assets/specials/Mother's Day_page-0001.jpg" alt="Mother's Day Sale" className="special-poster" /><div className="special-overlay"><h3>Mother's Day Sale</h3><p>With any beauty service</p><div className="special-valid">Limited time offer</div><button className="btn-special" onClick={openBooking}><i className="fas fa-arrow-right"></i> Book Now</button></div></div></div>
                <div className={`special-slide ${currentSpecialSlide === 5 ? 'active' : ''}`}><div className="special-card"><img src="./assets/specials/Mother's Day_page-0002.jpg" alt="Mother's Day Giveaway" className="special-poster" /><div className="special-overlay"><h3>Mother's Day Giveaway</h3><p>With any beauty service</p><div className="special-valid">Limited time offer</div><button className="btn-special" onClick={openBooking}><i className="fas fa-arrow-right"></i> Book Now</button></div></div></div>
                <button className="specials-nav prev" onClick={prevSpecialSlide}><i className="fas fa-chevron-left"></i></button>
                <button className="specials-nav next" onClick={nextSpecialSlide}><i className="fas fa-chevron-right"></i></button>
              </div>
              <div className="specials-indicators">
                <span className={`specials-dot ${currentSpecialSlide === 0 ? 'active' : ''}`} onClick={() => setCurrentSpecialSlide(0)}></span>
                <span className={`specials-dot ${currentSpecialSlide === 1 ? 'active' : ''}`} onClick={() => setCurrentSpecialSlide(1)}></span>
                <span className={`specials-dot ${currentSpecialSlide === 2 ? 'active' : ''}`} onClick={() => setCurrentSpecialSlide(2)}></span>
                <span className={`specials-dot ${currentSpecialSlide === 3 ? 'active' : ''}`} onClick={() => setCurrentSpecialSlide(3)}></span>
                <span className={`specials-dot ${currentSpecialSlide === 4 ? 'active' : ''}`} onClick={() => setCurrentSpecialSlide(4)}></span>
                <span className={`specials-dot ${currentSpecialSlide === 5 ? 'active' : ''}`} onClick={() => setCurrentSpecialSlide(5)}></span>
              </div>
              <div className="past-specials">
                <div className="past-header"><p className="label">Previously Featured</p><h3>Fan Favorites</h3></div>
                <div className="past-grid">
                  <div className="past-card"><p>Summer Glow Package</p><small>Jan - Feb 2026</small></div>
                  <div className="past-card"><p>Holiday Hair Special</p><small>Dec 2025</small></div>
                  <div className="past-card"><p>Valentine's Couple Deal</p><small>Feb 2026</small></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section id="gallery" className="section-wrap" style={{ background: 'var(--cream)' }}>
          <div className="container">
            <p className="label fade">Our Studio in Action</p>
            <h2 className="fade">Moments at Tassel</h2>
            <div className="media-toggle fade">
              <button className={`media-btn ${activeMediaFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveMediaFilter('all')}>All Media</button>
              <button className={`media-btn ${activeMediaFilter === 'photo' ? 'active' : ''}`} onClick={() => setActiveMediaFilter('photo')}><i className="fas fa-image"></i> Photos</button>
              <button className={`media-btn ${activeMediaFilter === 'video' ? 'active' : ''}`} onClick={() => setActiveMediaFilter('video')}><i className="fas fa-video"></i> Videos</button>
            </div>
            <div className="gallery-filter fade">
              <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
              <button className={`filter-btn ${activeFilter === 'kids' ? 'active' : ''}`} onClick={() => setActiveFilter('kids')}><i className="fas fa-child"></i> Kiddies</button>
              <button className={`filter-btn ${activeFilter === 'barber' ? 'active' : ''}`} onClick={() => setActiveFilter('barber')}><i className="fas fa-cut"></i> Barber</button>
              <button className={`filter-btn ${activeFilter === 'hair' ? 'active' : ''}`} onClick={() => setActiveFilter('hair')}><i className="fas fa-hand-sparkles"></i> Hair</button>
              <button className={`filter-btn ${activeFilter === 'nails' ? 'active' : ''}`} onClick={() => setActiveFilter('nails')}><i className="fas fa-hand-peace"></i> Nails</button>
              <button className={`filter-btn ${activeFilter === 'studio' ? 'active' : ''}`} onClick={() => setActiveFilter('studio')}><i className="fas fa-couch"></i> Studio</button>
            </div>
            <div className="gallery-grid">
              {galleryItems.map((item, index) => {
                if ((activeFilter !== 'all' && item.category !== activeFilter) || (activeMediaFilter !== 'all' && item.type !== activeMediaFilter)) return null;
                return (
                  <div key={index} className={`gallery-item ${item.type === 'video' ? 'video-item' : ''} fade`} onClick={() => openLightbox(item)}>
                    {item.type === 'video' ? (
                      <><video className="gallery-video" poster={item.poster} loop muted playsInline autoPlay><source src={item.src} type="video/mp4" /></video><div className="video-play-icon"><i className="fas fa-play"></i></div></>
                    ) : (
                      <img src={item.src} alt={item.caption} loading="lazy" />
                    )}
                    <div className="gallery-overlay"><span>{item.caption}</span></div>
                  </div>
                );
              })}
            </div>
            {showLightbox && lightboxContent && (
              <div className="lightbox show" onClick={closeLightbox}>
                <span className="lightbox-close" onClick={closeLightbox}><i className="fas fa-times"></i></span>
                <div className="lightbox-content-container" onClick={(e) => e.stopPropagation()}>
                  {lightboxContent.type === 'video' ? <video className="lightbox-video" controls autoPlay><source src={lightboxContent.src} type="video/mp4" /></video> : <img className="lightbox-img" src={lightboxContent.src} alt={lightboxContent.caption} />}
                </div>
                <div className="lightbox-caption">{lightboxContent.caption}</div>
              </div>
            )}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="section-wrap">
          <div className="container">
            <div className="about-grid">
              <div className="about-img fade"><img src="./assets/images/compressed_FullTeam.jpeg" alt="Tassel Team" loading="lazy" /><p className="img-caption">calm · professional · family</p></div>
              <div>
                <p className="label fade">Our story</p>
                <h2 className="fade">Built for families.<br />Designed for beauty.</h2>
                <div className="fade about-text">
                  <p>Tassel Hair & Beauty Studio was created to offer something different — a calm, professional space where families feel welcome and cared for.</p>
                  <p style={{ margin: '1.8rem 0' }}>Our foundation is kiddies hair expertise, paired with professional barber services, adult hair and beauty treatments, making Tassel a one-stop destination for parents who value quality and convenience.</p>
                  <p>From gentle kiddies styling to sharp barber cuts, nails, skin and beauty treatments, every detail is designed to deliver a premium experience built on care, comfort and excellence.</p>
                </div>
                <button className="btn-primary" onClick={openBooking}><i className="fas fa-calendar-check"></i> Book Your Visit</button>
              </div>
            </div>
          </div>
        </section>

        {/* MEET THE TEAM SECTION */}
        <section id="team" className="section-wrap">
          <div className="container">
            <div className="team-header">
              <p className="label fade">Meet Our Experts</p>
              <h2 className="fade">The Faces Behind Tassel</h2>
              <p className="team-intro fade">Passionate professionals dedicated to making you and your family look and feel amazing.</p>
            </div>
            <div className="team-grid">
              {teamMembers.map(member => (
                <div key={member.id} className="team-card fade" onClick={() => openTeamModal(member)}>
                  <div className="team-image-wrapper"><img src={member.image} alt={member.name} className="team-image" loading="lazy" /></div>
                  <div className="team-info"><h3>{member.name}</h3><p className="team-role">{member.role}</p><p className="team-specialization">{member.specialization}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BRANDS SECTION */}
        <section id="brands" className="section-wrap brands-section">
          <div className="container">
            <p className="label fade">Trusted Partnerships</p>
            <h2 className="fade">Brands We Love & Trust</h2>
            <p className="brands-intro fade">At Tassel, we partner with premium brands that align with our commitment to quality, safety, and exceptional results for your family.</p>
            <div className="brands-grid">
              <div className="brand-card fade"><div className="brand-logo-wrapper"><img src="./assets/brands/Tassel.svg" alt="Tassel" className="brand-logo" /></div><h3>Tassel Studio</h3><p>Our signature brand — excellence in every service</p></div>
              <div className="brand-card fade"><div className="brand-logo-wrapper"><img src="./assets/brands/Esse.svg" alt="Esse Skincare" className="brand-logo" /></div><h3>Esse Skincare</h3><p>Probiotic skincare for healthy, radiant skin</p></div>
              <div className="brand-card fade"><div className="brand-logo-wrapper"><img src="./assets/brands/ResaK.svg" alt="Resa-K" className="brand-logo" /></div><h3>Resa-K</h3><p>Advanced keratin & hair restoration treatments</p></div>
              <div className="brand-card fade"><div className="brand-logo-wrapper"><img src="./assets/brands/Popsicle.svg" alt="Popsicle Nails" className="brand-logo" /></div><h3>Popsicle Professional Nails</h3><p>Premium nail care & cuticle nourishment</p></div>
            </div>
            <div className="brands-note fade"><p>+ Many more professional products selected with care for your family's wellness</p></div>
          </div>
        </section>

        {/* REVIEWS SECTION */}
        <section id="reviews" className="section-wrap reviews-section">
          <div className="container">
            <p className="label fade">Client Love</p>
            <h2 className="fade">What Our Families Say</h2>
            <p className="reviews-intro fade">Real feedback from our wonderful clients</p>
            <div className="reviews-grid">
              <div className="review-card google-featured fade">
                <div className="review-header"><div className="reviewer-info"><div className="reviewer-avatar"><i className="fas fa-star"></i></div><div className="reviewer-details"><h4>Google Review</h4><div className="review-rating"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div></div></div><div className="review-source"><span className="google-badge"><i className="fab fa-google"></i> Google</span></div></div>
                <div className="review-content"><p className="review-text">"Loved the ambiance, the ladies welcomed us with a smile. The massage took my problems away. Overall an amazing experience, I'm definitely coming back."</p></div>
                <div className="review-footer"><span className="review-date"><i className="far fa-calendar-alt"></i> ~11 months ago</span><span className="review-service"><i className="fas fa-hand-sparkles"></i> Pedicure, Massage, Facial</span></div>
              </div>
              <div className="review-card featured-review fade">
                <div className="review-header"><div className="reviewer-info"><div className="reviewer-avatar">K</div><div className="reviewer-details"><h4>Kayise's Mom</h4><div className="review-rating"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div></div></div><div className="review-source"><span className="whatsapp-badge"><i className="fab fa-whatsapp"></i> WhatsApp</span></div></div>
                <div className="review-content"><p className="review-text">"Thank you so much for your hospitality and professionalism. I will 100% recommend Tassel. Definitely found a home for my daughter's hair."</p></div>
                <div className="review-footer"><span className="review-date"><i className="far fa-calendar-alt"></i> March 2026</span><span className="review-service"><i className="fas fa-child"></i> Kiddies Hair</span><span className="review-badge"><i className="fas fa-star"></i> Featured Review</span></div>
              </div>
              <div className="review-card fade">
                <div className="review-header"><div className="reviewer-info"><div className="reviewer-avatar">P</div><div className="reviewer-details"><h4>Palesa Mogale</h4><div className="review-rating"><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span></div></div></div><div className="review-source"><span className="whatsapp-badge"><i className="fab fa-whatsapp"></i> WhatsApp</span></div></div>
                <div className="review-content"><p className="review-text">"The absolute best service ever! Your studio is absolutely gorgeous. No tears at all. Totally love it!"</p></div>
                <div className="review-footer"><span className="review-date"><i className="far fa-calendar-alt"></i> March 2026</span><span className="review-service"><i className="fas fa-child"></i> Kiddies Hair</span></div>
              </div>
            </div>
            <div className="reviews-footer fade">
              <div className="rating-summary"><div className="average-rating"><span className="rating-number">5.0</span><div className="rating-stars"><span>★★★★★</span></div><span className="rating-count">based on client reviews</span></div></div>
              <div className="review-actions">
                <button className="btn-review whatsapp-review" onClick={openReview}><i className="fab fa-whatsapp"></i> Leave a WhatsApp Review</button>
                <a href="https://www.google.com/search?q=Tassel+Hair+and+Beauty+Studio+Reviews" className="btn-review google-review" target="_blank" rel="noopener noreferrer"><i className="fab fa-google"></i> Leave a Google Review</a>
              </div>
              <p className="review-note">Your feedback helps us grow and serve you better!</p>
            </div>
          </div>
        </section>

        {/* LOCATION SECTION */}
        <section id="location" className="location-section">
          <div className="container location-grid">
            <div>
              <p className="label location-label fade">Find us</p>
              <h2 className="location-title fade">Visit Tassel in<br />Glenvista</h2>
              <div className="loc-detail fade">
                <div className="loc-item"><span className="loc-icon"><i className="fas fa-location-dot"></i></span><div className="loc-text"><strong>Address</strong><p>101 Bellairs Drive, Glenvista<br />Johannesburg South</p></div></div>
                <div className="loc-item"><span className="loc-icon"><i className="fab fa-whatsapp"></i></span><div className="loc-text"><strong>WhatsApp bookings</strong><p>072 960 5153</p></div></div>
                <div className="loc-item"><span className="loc-icon"><i className="fas fa-walking"></i></span><div className="loc-text"><strong>Walk‑ins</strong><p>Welcome — subject to availability</p></div></div>
              </div>
              <div className="fade" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="https://wa.me/27729605153" className="btn-gold" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i> WhatsApp Us</a>
                <a href="https://maps.google.com/?q=101+Bellairs+Drive+Glenvista+Johannesburg" className="btn-ghost-light" target="_blank" rel="noopener noreferrer"><i className="fas fa-map-marker-alt"></i> Google Maps</a>
              </div>
            </div>
            <div className="map-box fade">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.123!2d27.9987!3d-26.3247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e950c4a5f5e15ab%3A0x1234567890abcdef!2s101%20Bellairs%20Dr%2C%20Glenvista%2C%20Johannesburg%20South!5e0!3m2!1sen!2sza!4v1710000000000" allowFullScreen="" loading="lazy" style={{ border: 0, width: '100%', height: '100%' }} title="Tassel Location"></iframe>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* FLOATING BOOK BUTTON */}
      <button className="float-book" onClick={openBooking}><i className="fas fa-calendar-check"></i> Book now</button>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="booking-modal show" onClick={closeBooking}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="booking-modal-close" onClick={closeBooking}><i className="fas fa-times"></i></span>
            <div className="booking-modal-header"><h2>Book Your Appointment</h2><p>Fill in your details and we'll confirm your booking via WhatsApp</p></div>
            <form className="booking-form" onSubmit={handleBookingSubmit}>
              <div className="form-group"><label htmlFor="serviceCategory"><i className="fas fa-tag"></i> Select Service Category *</label><select id="serviceCategory" name="serviceCategory" required><option value="">Choose a service category</option><option value="Kiddies Hair">Kiddies Hair</option><option value="Barber Services">Barber Services</option><option value="Adult Hair">Adult Hair</option><option value="Nails">Nails</option><option value="Skin & Beauty">Skin & Beauty</option></select></div>
              <div className="form-row"><div className="form-group"><label htmlFor="fullName"><i className="fas fa-user"></i> Full Name *</label><input type="text" id="fullName" name="fullName" placeholder="Enter your full name" required /></div><div className="form-group"><label htmlFor="phoneNumber"><i className="fas fa-phone"></i> Phone Number *</label><input type="tel" id="phoneNumber" name="phoneNumber" placeholder="072 960 5153" required /></div></div>
              <div className="form-row"><div className="form-group"><label htmlFor="preferredDate"><i className="fas fa-calendar"></i> Preferred Date *</label><input type="date" id="preferredDate" name="preferredDate" required /></div><div className="form-group"><label htmlFor="preferredTime"><i className="fas fa-clock"></i> Preferred Time *</label><select id="preferredTime" name="preferredTime" required><option value="">Select time slot</option><option value="09:00">09:00 AM</option><option value="10:00">10:00 AM</option><option value="11:00">11:00 AM</option><option value="12:00">12:00 PM</option><option value="13:00">01:00 PM</option><option value="14:00">02:00 PM</option><option value="15:00">03:00 PM</option><option value="16:00">04:00 PM</option><option value="17:00">05:00 PM</option></select></div></div>
              <div className="form-group"><label htmlFor="specialRequests"><i className="fas fa-pen"></i> Special Requests or Notes</label><textarea id="specialRequests" name="specialRequests" rows="3" placeholder="Any special requests, allergies, or additional information..."></textarea></div>
              <div className="form-buttons"><button type="button" className="btn-cancel" onClick={closeBooking}><i className="fas fa-times"></i> Cancel</button><button type="submit" className="btn-submit"><i className="fab fa-whatsapp"></i> Send Booking Request</button></div>
            </form>
            <div className="booking-note"><p><i className="fas fa-info-circle"></i> You'll be redirected to WhatsApp to confirm your booking.</p></div>
          </div>
        </div>
      )}

      {/* TEAM MODAL */}
      {showTeamModal && selectedTeamMember && (
        <div className="team-modal show" onClick={closeTeamModal}>
          <div className="team-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="team-modal-close" onClick={closeTeamModal}><i className="fas fa-times"></i></span>
            <div className="team-modal-inner">
              <div className="team-modal-image"><img src={selectedTeamMember.image} alt={selectedTeamMember.name} /></div>
              <div className="team-modal-info">
                <h3>{selectedTeamMember.name}</h3>
                <p className="modal-role">{selectedTeamMember.role}</p>
                <p className="modal-specialization">{selectedTeamMember.specialization}</p>
                <p className="modal-bio">{selectedTeamMember.bio}</p>
                <p className="modal-quote">"{selectedTeamMember.quote}"</p>
                <div className="modal-social">
                  <a href={selectedTeamMember.instagram} target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-instagram"></i> Instagram</a>
                  <a href={selectedTeamMember.whatsapp} target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-whatsapp"></i> WhatsApp</a>
                  <button className="btn-primary" onClick={openBooking}><i className="fas fa-calendar-check"></i> Book Appointment</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;