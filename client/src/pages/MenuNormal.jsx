import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import '../index.css';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // 1. IMPORT TỪ ĐIỂN
import { buildTransferContent } from '../data/paymentTransferInfo';

const MenuGA = () => {
  const { t, i18n } = useTranslation(); // 2. GỌI HOOK
  const location = useLocation();
  const navigate = useNavigate();
  const bookingInfo = location.state?.bookingData || null;

  const [activeTab, setActiveTab] = useState('GAnormal');
  const [cart, setCart] = useState({});
  const [isLoading, setIsLoading] = useState(false); 
  const [menuData, setMenuData] = useState({});
  // Xử lý thêm/bớt món 
  const handleUpdateCart = (item, amount, option = null) => {
    setCart(prev => {
      const currentName = i18n.language === 'vi' ? item.name : (item.nameEn || item.name);
      const optLabel = option ? (i18n.language === 'vi' ? option.label : (option.labelEn || option.label)) : '';
      
      const cartItemName = option ? `${currentName} (${optLabel})` : currentName;
      const rawPrice = option ? option.price : item.price;

      const currentQty = prev[cartItemName]?.qty || 0;
      const newQty = currentQty + amount;
      
      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[cartItemName];
        return newCart;
      }
      
      const finalPrice = parseInt(String(rawPrice).split('.').join('')) * 1000;

      return {
        ...prev,
        [cartItemName]: { price: finalPrice, qty: newQty }
      };
    });
  };

  const getTablePrice = (dateString) => {
    if (!dateString) return 0;
    const dateObj = new Date(dateString);
    const isSunday = dateObj.getDay() === 0;
    return isSunday ? 300000 : 3000000;
  };
  const getMenuPrice = () => Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);

  const getEstimatedTotal = () => {
    const tableFee = bookingInfo ? getTablePrice(bookingInfo.bookingDate) : 0;
    return getMenuPrice() + tableFee;
  };

  const waitForAdminApproval = async (bookingId) => {
    while (true) {
      try {
        const statusData = await axiosClient.get(`/bookings/${bookingId}/payment-status`);
        if (
          statusData?.success
          && statusData?.booking?.paymentStatus === 'paid'
          && statusData?.booking?.status === 'confirmed'
        ) {
          return true;
        }
      } catch (error) {
        console.error('Lỗi kiểm tra trạng thái duyệt:', error);
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  };

  const handleFinalSubmit = async () => {
    if (!bookingInfo) return;
    if (isLoading) return;
    setIsLoading(true);

    try {
      const preOrderArray = Object.keys(cart).map(itemName => ({
        name: itemName,
        qty: cart[itemName].qty,
        price: cart[itemName].price
      }));

      const preparedBookingData = {
        ...bookingInfo,
        preOrderItems: preOrderArray, 
        estimatedTotal: getEstimatedTotal(), 
        bookingType: 'voucher' 
      };

      const transferContent = buildTransferContent(`${bookingInfo.phone || 'CUS'}${Date.now()}`);

      let transferData;
      try {
        transferData = await axiosClient.post('/bookings/deposit-submitted', {
          bookingData: preparedBookingData,
          transactionId: transferContent
        });
      } catch (submitError) {
        if (submitError?.response?.status !== 404) {
          throw submitError;
        }

        transferData = await axiosClient.post('/bookings', {
          ...preparedBookingData,
          transactionId: transferContent,
          paymentMethod: 'transfer',
          paymentStatus: 'pending'
        });
      }

      const bookingId = transferData?.booking?._id || transferData?.bookingId || transferData?.data?.booking?._id;
      if (!bookingId) {
        throw new Error('Không nhận được mã đơn để theo dõi duyệt.');
      }

      toast.info('Đã gửi đơn đặt bàn. Vui lòng chờ admin duyệt...');
      await waitForAdminApproval(bookingId);

      toast.success('Admin đã duyệt cọc. Đặt bàn thành công!');
      setIsLoading(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Lỗi đặt bàn:', error);
      toast.error('Không thể gửi đơn đặt, vui lòng thử lại.');
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const loadMenuFromDatabase = async () => {
      try {
        const res = await axiosClient.get('/admin/menu');
        const menuArray = res.data?.data || res.data || []; 

        if (!Array.isArray(menuArray)) {
           console.error("Dữ liệu menu trả về không phải là mảng:", menuArray);
           return;
        }

        const groupedData = menuArray.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});
        
        setMenuData(groupedData);
      } catch (error) {
        console.error("Lỗi kéo Menu từ DB:", error);
      }
    };
    loadMenuFromDatabase();
  }, []);
  const renderItems = (items) => (
    <div className="menu-grid">
      {items.map((item, index) => {
        const currentName = i18n.language === 'vi' ? item.name : (item.nameEn || item.name);
        const currentDesc = i18n.language === 'vi' ? item.desc : (item.descEn || item.desc);

        if (item.isHeader) {
          return (
            <div key={index} className="menu-section-title">
              <span style={{ color: '#d4e02e' }}>✦</span> {currentName} <span style={{ color: '#d4e02e' }}>✦</span>
            </div>
          );
        }
        return (
          <div className={`menu-item-card ${!item.image ? 'no-image' : ''}`} key={index}>
            {item.image && (
              <div className="menu-image-container">
                <img src={item.image} alt={currentName} className="menu-image" />
              </div>
            )}
            
            <div className="menu-info">
              <h3 className="menu-name">{currentName}</h3>
              {currentDesc && <p className="menu-desc">{currentDesc}</p>}
              {item.options ? (
                <div className="menu-options-container">
                  {item.options.map((opt, i) => {
                    const optLabel = i18n.language === 'vi' ? opt.label : (opt.labelEn || opt.label);
                    return (
                      <div className="menu-action-row multi-option" key={i}>
                        <div className="option-detail">
                          <span className="opt-label">{optLabel}</span>
                          <span className="opt-price"> {opt.price}k</span>
                        </div>
                        {bookingInfo && (
                          <div className="cart-controls mini">
                            <button onClick={() => handleUpdateCart(item, -1, opt)}>-</button>
                            <span>{cart[`${currentName} (${optLabel})`]?.qty || 0}</span>
                            <button onClick={() => handleUpdateCart(item, 1, opt)}>+</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="menu-action-row">
                  <div className="menu-price">{item.price}k</div>
                  {bookingInfo && (
                    <div className="cart-controls">
                      <button onClick={() => handleUpdateCart(item, -1)}>-</button>
                      <span>{cart[currentName]?.qty || 0}</span>
                      <button onClick={() => handleUpdateCart(item, 1)}>+</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const daysOfWeek = [t('day_0'), t('day_1'), t('day_2'), t('day_3'), t('day_4'), t('day_5'), t('day_6')];

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1 className="menu-title">APLUS <span className="highlight">MENU</span></h1>
        {bookingInfo && (
          <p style={{ color: '#fff', fontSize: '16px', background: '#222', padding: '10px', borderRadius: '8px', display: 'inline-block' }}>
            {t('menu_table')}: <strong>{t('menu_normal')}</strong> | {t('menu_guest')}: <strong>{bookingInfo.customerName}</strong>
          </p>
        )}
      </div>

      <div className="menu-tabs">
        <button className={activeTab === 'GAnormal' ? 'active' : ''} onClick={() => setActiveTab('GAnormal')}>GA NORMAL</button>
      </div>

      <div className="menu-content">
        {renderItems(menuData[activeTab] || [])}
      </div>
      {bookingInfo && (
        <div className="floating-cart-bar">
          <div className="cart-total-container">
            <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '5px' }}>
              Menu: <strong style={{color: '#fff'}}>{getMenuPrice().toLocaleString('vi-VN')}đ</strong>
            </div>
            <div className="cart-total">
              {t('cart_total')}: <span>{getMenuPrice().toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="cart-note">
              {t('menu_note')} {getTablePrice(bookingInfo.bookingDate).toLocaleString()}đ
            </div>
          </div>

          <button className="btn-chot-don" onClick={handleFinalSubmit} disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? '⏳...' : t('cart_btn_submit')}
          </button>
        </div>
      )}

    </div>
  );
};

export default MenuGA;