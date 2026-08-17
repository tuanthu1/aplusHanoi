import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import '../index.css'; 
import { SiZalo } from 'react-icons/si';
import { FaFacebook, FaInstagram, FaPhoneAlt, FaTiktok } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-group-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            {t('nav_booking')}
          </Link>
          <Link to="/events" className={`nav-item ${location.pathname === '/events  ' ? 'active' : ''}`}>
            {t('nav_events')}
          </Link>
        </div>
        <div className="nav-group-logo">
          <Link to="/" className="nav-logo-link">
            <img src={logo} alt="Aplus Logo" className="logo-img" />
          </Link>
        </div>
        <div className="nav-group-contact">
          <a href="tel:0877114444" className="contact-icon phone" title="Gọi điện" style={{ display: 'flex', alignItems: 'center', gap: '5px', }}>
            <FaPhoneAlt className="social-icon" /> 0877114444
          </a>
          
          <a href="https://zalo.me/0877114444" target="_blank" rel="noreferrer" className="btn-social zalo">
              <SiZalo className="social-icon" />
          </a>
          <a href="https://www.facebook.com/profile.php?id=100092699245258" target="_blank" rel="noreferrer" className="btn-social fb">
             <FaFacebook className="social-icon" />
          </a>
          <a href="https://www.instagram.com/aplushanoi78?igsh=YmV2aWk1cmxheGc3" target="_blank" rel="noreferrer" className="btn-social ig">
             <FaInstagram className="social-icon" />
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="btn-social tiktok">
             <FaTiktok className="social-icon" />
          </a>
          <div className="btn-language" onClick={toggleLanguage}  title="Language">
            {i18n.language === 'vi' ? 'VN' : 'EN'}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;