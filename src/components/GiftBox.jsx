import React, { useState } from 'react';
import zaloQr from '../assets/zalo.jpg';
import gitboximg from '../assets/gitbox.png'
import { useTranslation } from 'react-i18next';
import '../index.css';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
const GiftBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation(); 
  return (
    <>
      <div className="floating-gift-container" onClick={() => setIsOpen(true)}>
        <div className="gift-icon">
          <img 
            src={gitboximg} 
            alt="Hộp quà APLUS" 
            style={{ width: '60px', height: '60px', objectFit: 'contain' }} 
          />
        </div>
        <div className="gift-text">{t('gift_btn_receive')}</div>
      </div>
      <div className="zalo-contact">
        <a href="https://zalo.me/0877114444" target="_blank" rel="noreferrer" className="contact-icon zalo">
          <img src="/zalo.png" alt="Zalo" />
        </a>
      </div>
      {isOpen && (
        <div className="gift-modal-overlay" >
          <div className="gift-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gift-close-btn" onClick={() => setIsOpen(false)}>✖</button>
            
            <h2 className="gift-title">{t('gift_title')}</h2>
            {t('gift_zalo_code')}:
            <div className="qr-container" style={{ textAlign: 'center' }}>
                
              <img 
                src={zaloQr} 
                alt="Zalo Trung Hiếu" 
                style={{ width: '160px', height: '160px', borderRadius: '10px', border: '2px solid #f3fc32', marginBottom: '10px', objectFit: 'cover' }} 
              />
            </div>

            <p style={{ marginBottom: '10px', fontSize: '14px'}}>
               <strong>{t('gift_step1')}:</strong> {t('gift_step1_desc')}
            </p>
            
            <div className="gift-social-buttons">
              <a href="https://www.facebook.com/profile.php?id=100092699245258" target="_blank" rel="noreferrer" className="btn-social fb">
                <FaFacebook className="social-icon" /> Facebook
              </a>
              <a href="https://www.instagram.com/aplushanoi78?igsh=YmV2aWk1cmxheGc3" target="_blank" rel="noreferrer" className="btn-social ig">
                <FaInstagram className="social-icon" /> Instagram
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="btn-social tiktok">
                <FaTiktok className="social-icon" /> TikTok
              </a>
            </div>
            
            <div className="reward-box">
              <p style={{ fontSize: '14px', marginBottom: '10px' }}>
                🎁 <strong>{t('gift_step2')}:</strong> {t('gift_step2_p1')}  
                <a href="https://zalo.me/0877114444" target="_blank" rel="noreferrer" className="contact-icon-git zalo">
                    Zalo
                </a> {t('gift_step2_p2')}
              </p>
              <h3> 01 JÄGERMEISTER</h3>
              <p style={{ margin: '5px 0' }}>{t('gift_or')}</p>
              <h3> {t('gift_fruit')}</h3>
              
              <p style={{ color: '#aaa', fontSize: '11px', marginTop: '10px', fontStyle: 'italic' }}>
                * {t('gift_note')}
              </p>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
};

export default GiftBox;