import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from 'react-router-dom';
import '../index.css';
import { useTranslation } from 'react-i18next';
import { Autoplay } from 'swiper/modules';
const MenuPreview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Danh sách ảnh menu đại ca muốn khoe (nhớ để ảnh vào public/menu/)
  const menuImages = [
      "/tepanhmenu/441898734745807189.jxl12.jpg",
      "/tepanhmenu/1827183094171399947.jxl4.jpg",
      "/tepanhmenu/1827183094171399947.jxl5.jpg",
      "/tepanhmenu/1827183094171399947.jxl7.jpg",
      "/tepanhmenu/1827183094171399947.jxl9.jpg",
      "/tepanhmenu/2024756600281741344.jxl1.jpg",
      "/tepanhmenu/2024756600281741344.jxl2.jpg",
      "/tepanhmenu/2024756600281741344.jxl3.jpg",
      "/tepanhmenu/3188931239068116277.jxl8.jpg",
      "/tepanhmenu/3188931239068116277.jxl13.jpg",
      "/tepanhmenu/3699557315484452130.jxl6.jpg",
      "/tepanhmenu/4309951040032972990.jxl10.jpg",
      "/tepanhmenu/4309951040032972990.jxl11.jpg",
      "/tepanhmenu/4309951040032972990.jxl12.jpg",
      "/tepanhmenu/4309951040032972990.jxl14.jpg",
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: { delay: 9000 },
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 1 } }, // ipad thì hiện 2 ảnh
      { breakpoint: 768, settings: { slidesToShow: 1 } } // điện thoại thì hiện 1 ảnh
    ]
  };

  return (
    <div className="menu-preview-box">
      <h2 className="preview-title">{t('preview_title')}</h2>
      
      <div className="slider-container">
        <Slider {...settings}>
          {menuImages.map((img, index) => (
            <div key={index} className="menu-slide-item">
              <div className="menu-card-inner">
                <img src={img} alt={`Menu ${index}`} />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <button className="btn-go-to-menu" onClick={() => navigate('/menu')}>
        {t('btn_go_to_menu')} <i className="fa-solid fa-utensils"></i>
      </button>
    </div>
  );
};

export default MenuPreview;