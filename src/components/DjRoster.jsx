import React from 'react';
import '../index.css';
import { useTranslation } from 'react-i18next';
const DjRoster = () => {
    const { t } = useTranslation();
  const djImages = [
    { id: 1, src: '/anhDjPoster/agry.jpg', alt: 'DJ Argy' },
    { id: 2, src: '/anhDjPoster/thuct.jpg', alt: 'Stephan Bodzin' },
    { id: 3, src: '/anhDjPoster/ravese.jpg', alt: 'Roverse' },
    { id: 4, src: '/anhDjPoster/ravese2.jpg', alt: 'Dubvision' },
    { id: 5, src: '/anhDjPoster/mouse.jpg', alt: 'Museum Of Sound' },
    { id: 6, src: '/anhDjPoster/quanap.jpg', alt: 'Quân A.P' },
    { id: 7, src: '/anhDjPoster/summer.jpg', alt: 'Summer Madness' },
    { id: 8, src: '/anhDjPoster/tuslay.jpg', alt: 'Tuslav' },
  ];

  return (
    <section className="dj-roster-section">
      <div className="dj-header-content">
        <h2 className="dj-title">{t('dj_title')}</h2>
        <p className="dj-desc">
          {t('dj_desc')}
        </p>
      </div>

      <div className="dj-grid-container">
        {djImages.map((dj) => (
          <div className="dj-card-item" key={dj.id}>
            <img src={dj.src} alt={dj.alt} className="dj-img" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default DjRoster;