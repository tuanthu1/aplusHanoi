import React, { useEffect, useState } from 'react';
import {Trans, useTranslation} from 'react-i18next';
import axiosClient from '../api/axiosClient';
import FloorMap from '../components/FloorMap';
import Events from './Events';
import MenuPreview from '../components/MenuPreview';
import DjRoster from '../components/DjRoster';
const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [homeBannerImage, setHomeBannerImage] = useState('/sukien.jpg');
  const [homeBannerTitle, setHomeBannerTitle] = useState('Special Event');
  const { t } = useTranslation();
  // Function to handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsZoomed(false);
  };

  const handleOpenVideo = () => {
    setIsVideoOpen(true);
  };

  const handleCloseVideo = () => {
    setIsVideoOpen(false);
  };

  useEffect(() => {
    const savedBanner = localStorage.getItem('homeBannerImage');
    if (savedBanner) {
      setHomeBannerImage(savedBanner);
      setHomeBannerTitle('Custom Home Banner');
      return;
    }

    const fetchHomeBanner = async () => {
      try {
        const data = await axiosClient.get('/events');
        const homeEvent = Array.isArray(data)
          ? data.find((event) => event.isHomeBanner) || data[0]
          : null;

        if (homeEvent?.imageUrl) {
          setHomeBannerImage(homeEvent.imageUrl);
          setHomeBannerTitle(homeEvent.title || 'Special Event');
        }
      } catch (error) {
        console.error('Lỗi tải ảnh banner đầu trang:', error);
      }
    };

    fetchHomeBanner();
  }, []);

  // Function to request access to personal information
  const requestPersonalInfo = async () => {
    try {
      if (navigator.permissions) {
        navigator.permissions.query('creditCard').then(permission => {
          if (permission.state === 'granted') {
            console.log('Access granted, getting personal info...');
            // Get personal info here...
          } else {
            console.log('Permission denied, request access again...');
            // Request access again...
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='home-page'>
      <div className='home-page-body'>
        <section className="hero-video-section">
          <button
            type="button"
            className="hero-video-card"
            onClick={handleOpenVideo}
            aria-label="Mở video hướng dẫn đặt bàn toàn màn hình"
          >
            <video
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              poster="/sukien.jpg"
            >
              <source src="/exampleaplus.mp4" type="video/mp4" />
            </video>
            <div className="hero-video-overlay" />
            <div className="hero-video-content">
              <span className="hero-video-badge">APLUS HANOI</span>
              <h1>Video hướng dẫn đặt bàn</h1>
              <p>Ấn vào video để phóng to toàn màn hình và xem cách đặt bàn nhanh nhất.</p>
              <div className="hero-video-actions">
                <span className="hero-video-button primary">Bấm để phóng to</span>
                <span className="hero-video-button secondary">Xem trước nội dung</span>
              </div>
            </div>
          </button>
        </section>

        {isVideoOpen && (
          <div className="video-modal-overlay" onClick={handleCloseVideo}>
            <div className="modal-close-btn" onClick={handleCloseVideo}>&times;</div>
            <video
              className="video-modal-content"
              src="/exampleaplus.mp4"
              autoPlay
              controls
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <section className="event-glow-section">
          <div
            className="event-glow-container"
            onClick={() => setIsModalOpen(true)}
          >
            <img src={homeBannerImage} alt={homeBannerTitle} className="event-img-glow" />
            <div className="event-glow-label">HOT EVENT</div>
          </div>
        </section>

        {isModalOpen && (
          <div
            className="image-modal-overlay"
            onClick={handleCloseModal}
          >
            <div className="modal-close-btn">&times;</div>
            <img
              src={homeBannerImage}
              alt={homeBannerTitle}
              className={`modal-image-content ${isZoomed ? 'zoomed' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
            />
          </div>
        )}

        <section className="intro-section">
          <div className="intro-content">
            <h2 className="intro-title">APLUS HANOI {t('home_subtitle')}</h2>
            <p>{t('home_description_1')}</p>
            <p>{t('home_description_2')}</p>
            <p>{t('home_description_3')}</p>
          </div>
          <div className="intro-images">
            <img src="/anhtrai.png" alt="APLUS Birthday" className="intro-img intro-img-left" />
            <img src="/anhphai.png" alt="APLUS Wedding" className="intro-img intro-img-right" />
          </div>
        </section>

        <header
          style={{ textAlign: 'center', marginBottom: '30px' }}
        >
          <h1
            style={{
              color: '#fff',
              fontSize: '2.5rem',
              textTransform: 'uppercase',
              letterSpacing: '4px'
            }}
          >
            <Trans i18nKey="home_title_main">
              APLUS <span style={{ color: '#d4e02e' }}>HA</span> NOI
            </Trans>
          </h1>
          <p
            style={{
              color: '#ff0000',
              fontSize: '11px',
              marginTop: '10px',
              fontStyle: 'italic'
            }}
          >
            {t('home_note')}
          </p>
        </header>

        <main>
          <FloorMap />
          <Events />
          <MenuPreview />
          <DjRoster />

          <button
            onClick={requestPersonalInfo}
            style={{ position: 'fixed', top: '10px', right: '10px' }}
          >
            Get Personal Info
          </button>

        </main>
      </div>
    </div>
  );
};

export default Home;