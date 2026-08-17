import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useTranslation } from 'react-i18next';

// 1. IMPORT SWIPER (MỚI)
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import '../index.css'; // Nhớ import CSS tổng vào đây

const Events = () => {
  const [events, setEvents] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    // Tải dữ liệu sự kiện từ API
    const fetchEvents = async () => {
      try {
        const data = await axiosClient.get('/events');
        // Chỉ lấy các sự kiện có đầy đủ tiêu đề, ảnh và ngày
        setEvents(data.filter(ev => ev.title && ev.imageUrl && ev.date));
      } catch (error) {
        console.error("Lỗi tải sự kiện:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="events-section-wrapper">
      <div className="events-header">
        <h2>{t('event_title_1')} & {t('event_title_2')}</h2>
      </div>
      <div className="swiper-outer-container">
        <Swiper
          modules={[Pagination, Autoplay, Navigation]}
          spaceBetween={20}
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 10000, disableOnInteraction: true }} // Tự động chuyển slide sau 10 giây, dừng khi người dùng tương tác
        breakpoints={{
          0: { slidesPerView: 1 },    // Điện thoại hiện 1
          768: { slidesPerView: 2 },  // Tablet hiện 2
          1100: { slidesPerView: 4 }  // PC màn hình to hiện 4
        }}
          className="mySwiper"
        >
          {events.map((ev, idx) => (
            <SwiperSlide key={idx}>
              <div className="event-card-white">
                <div className="event-img-box">
                  <img src={ev.imageUrl} alt={ev.title} />
                  <div className="event-date-badge-fixed">
                    {new Date(ev.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
                <div className="event-text-box">
                  <h3>{t(ev.title)}</h3>
                  <p className="event-desc-style">{t(ev.description)}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Events;