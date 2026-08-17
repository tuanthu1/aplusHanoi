import React from 'react';
import { useTranslation } from 'react-i18next';
import '../index.css';
import logo from '../assets/logo.png'; 

const Footer = () => {
  const { t } = useTranslation(); 

  return (
    <footer className="home-footer" style={{ paddingTop: '50px' }}>
      <div className="map-section" style={{ maxWidth: '800px', margin: '0 auto 40px', padding: '0 20px' }}>
        <h2 style={{ textAlign: 'center', color: '#f3fc32', marginBottom: '15px', fontSize: '1.5rem', letterSpacing: '2px' }}>
          📍{t('footer_location')}
        </h2>
        
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid #333', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.7628054807833!2d105.84828720000002!3d21.042174700000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0027ff0379%3A0x78c7533411e245d3!2zQVBMVVMgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1773065502265!5m2!1svi!2s" 
            width="100%"  
            height="300" 
            style={{ border: 0, display: 'block' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="APLUS Bar Location"
          ></iframe>
        </div>
      </div>

      <div className="footer-container">
        <div className="footer-section">
          <h2 className="footer-logo">
            <img src={logo} alt="Aplus Logo" className="logo-img-f" style={{ maxWidth: '150px' }} />
          </h2>
          <p className="footer-desc">
            {t('footer_desc')}
          </p>
          <div className="social-links">
            <a href="https://www.facebook.com/profile.php?id=100092699245258" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://zalo.me/087711444" target="_blank" rel="noreferrer">Zalo</a>
          </div>
        </div>
        <div className="footer-section">
          <h3>{t('footer_contact_title')}</h3>
          <ul className="footer-links">
            <li>📍 {t('footer_address')}</li>
            <li>📞 Hotline: 0877.114.444</li>
            <li>⏰ Open: 21:00 - 02:00</li> 
          </ul>
        </div>
        <div className="footer-section">
          <h3>{t('footer_utilities_title')}</h3>
          <ul className="footer-links">
            <li><a href="/">{t('footer_book_now')}</a></li>
            <li><a href="/events">{t('footer_hot_events')}</a></li>
            <li><a href="/menu">{t('footer_menu_list')}</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 APLUS BAR & LOUNGE. All Rights Reserved.</p>
      </div>
      
    </footer>
  );
};

export default Footer;