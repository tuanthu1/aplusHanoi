import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';
import { menuaData } from '../data/menuData';
const Admin = () => {
  const [bookings, setBookings] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [eventForm, setEventForm] = useState({ title: '', date: '', description: '', imageUrl: '' });
  const [newAccount, setNewAccount] = useState({ username: '', password: '', email: '', role: 'Quản lý Admin' });
  const [activeTab, setActiveTab] = useState('bookings'); 
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [eventSearchTerm, setEventSearchTerm] = useState(''); 
  const [eventFilterMonth, setEventFilterMonth] = useState(''); 
  const [eventFilterDate, setEventFilterDate] = useState('');
  const [bookingSearch, setBookingSearch] = useState(''); 
  const [statusFilter, setStatusFilter] = useState(''); 
  const [transactions, setTransactions] = useState([]);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState('pending');
  const [isUploading, setIsUploading] = useState(false);
  // STATE CHO QUẢN LÝ MENU
  const [events, setEvents] = useState([]);
  const [isDeleteAllUnlocked, setIsDeleteAllUnlocked] = useState(false); // Mặc định cho phép xóa tất cả để dễ phát triển, sau này có thể đổi thành false
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [editingMenuId, setEditingMenuId] = useState(null); // Lưu ID món đang được sửa
  const [menuForm, setMenuForm] = useState({ name: '', category: 'gaBOTTLE', price: '', desc: '', imageUrl: '', optionsText: '',isHeader: false });
  const isTransactionsEndpointUnavailableRef = useRef(false);
  const navigate = useNavigate();
  const role = localStorage.getItem('adminRole'); 
  
    // STATE FOR PRICE MANAGEMENT
    const [tablePrices, setTablePrices] = useState([]);
    const [editingPrice, setEditingPrice] = useState(null);
    const [priceForm, setPriceForm] = useState({ tableType: '', weekday: 0, weekend: 0 });
  const filteredEvents = events.filter(ev => {
    const matchesName = ev.title.toLowerCase().includes(eventSearchTerm.toLowerCase());
    const matchesMonth = eventFilterMonth === '' || new Date(ev.date).getMonth() + 1 === parseInt(eventFilterMonth);
    const eventDateOnly = new Date(ev.date).toISOString().split('T')[0];
    const matchesDate = eventFilterDate === '' || eventDateOnly === eventFilterDate;
    return matchesName && matchesMonth && matchesDate;
  });
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) || b.phone.includes(bookingSearch);
    const matchesStatus = statusFilter === '' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const filteredTransactions = transactions.filter(t => {
    const normalizedSearch = transactionSearch.toLowerCase();
    const matchesSearch = (t.customerName || '').toLowerCase().includes(normalizedSearch)
      || (t.phone || '').includes(transactionSearch)
      || (t.transactionId || '').toLowerCase().includes(normalizedSearch);
    const matchesStatus = transactionStatusFilter === '' || t.paymentStatus === transactionStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const formatBookingLocation = (location) => {
    if (!location || location.latitude == null || location.longitude == null) {
      return 'Chưa có';
    }

    const latitude = Number(location.latitude).toFixed(6);
    const longitude = Number(location.longitude).toFixed(6);
    const accuracy = Number.isFinite(Number(location.accuracy)) ? `${Math.round(Number(location.accuracy))}m` : 'N/A';

    return `${latitude}, ${longitude} (${accuracy})`;
  };
  const categoryDictionary = {
  'gaBOTTLE': 'GA BOTTLE',
  'vipPackages': 'VIP PACKAGE',
  'vvipPackages': 'VVIP PACKAGE',
  'sVipPackage': 'SVIP PACKAGE',
  'Champagne': 'CHAMPAGNE',
  'singleMartWishky': 'SINGLE MART WHISKY',
  'whisky': 'WHISKY',
  'sparkling': 'SPARKLING',
  'GAvoucher': 'GA VOUCHER',
  'tequila': 'TEQUILA',
  'GAnormal': 'GA NORMAL',
    'SoftDrink': 'ĐỒ UỐNG',
  'liquor': 'LIQUOR',
  'foodSnacks': 'FOOD & SNACKS',
  'other': 'KHÁC (MIXER, HEADER...)'
};
  const currentToken = localStorage.getItem('adminToken');
  const formatVnd = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`;
  const parseVndInput = (value) => Number(String(value).replace(/[^\d]/g, '')) || 0;

  useEffect(() => {
    if (!currentToken) {
      toast.error("Vui lòng đăng nhập để vào quản trị!");
      navigate('/admin-login');
      return;
    }
    if (activeTab === 'bookings') {
      fetchAllBookings();
    }
  }, [navigate, currentToken, activeTab, filterDate]);
  // STATE TÌM KIẾM TRONG ADMIN
  const [searchMenuTerm, setSearchMenuTerm] = useState('');

  // Hàm gỡ dấu tiếng Việt (Để gõ "trai cay" nó vẫn tìm ra "Trái cây")
  const removeAccents = (str) => {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
  };

  // Logic tự động lọc món ăn theo từ khóa
  const filteredMenuItems = menuItems.filter(item => {
    if (!searchMenuTerm) return true; // Không gõ gì thì hiện tất cả
    const searchStr = removeAccents(searchMenuTerm.toLowerCase());
    const nameStr = removeAccents((item.name || '').toLowerCase());
    const catStr = removeAccents((item.category || '').toLowerCase());
    
    // Tìm trong tên món HOẶC tìm trong tên danh mục đều ra
    return nameStr.includes(searchStr) || catStr.includes(searchStr);
  });
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error("Mật khẩu mới và xác nhận không khớp!");
    }
    try {
      const currentToken = localStorage.getItem('adminToken');
      
      const data = await axiosClient.put('/admin/change-password', passForm, {
        headers: {
          Authorization: `Bearer ${currentToken}` 
        }
      });

      if (data.success) {
        toast.success("Đổi mật khẩu thành công!");
        setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi rồi!");
    }
  };
    const fetchAllBookings = async () => {
      try {
        const data = await axiosClient.get(`/admin/all?date=${filterDate}`);
        if (data.success) setBookings(data.bookings);
      } catch (error) {
        console.error("Lỗi lấy danh sách admin:", error);
      }
    };
    const fetchEvents = async () => {
    try {
      const data = await axiosClient.get('/admin/alle'); 
      setEvents(data.events || []);
    } catch (err) { console.error(err); }
  };

    const fetchTablePrices = async () => {
      try {
        const data = await axiosClient.get('/admin/table-prices');
        if (data.success) setTablePrices(data.data || []);
      } catch (error) {
        console.error('Lỗi lấy giá bàn:', error);
        toast.error('Lỗi khi lấy giá bàn');
      }
    };

    const handleSavePrice = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('adminToken');
        const data = await axiosClient.put('/admin/table-prices', priceForm, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (data.success) {
          toast.success('Đã cập nhật giá thành công!');
          setPriceForm({ tableType: '', weekday: 0, weekend: 0 });
          setEditingPrice(null);
          fetchTablePrices();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi cập nhật giá');
      }
    };

    const startEditPrice = (price) => {
      setEditingPrice(price._id);
      setPriceForm({
        tableType: price.tableType,
        weekday: price.weekday,
        weekend: price.weekend
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  const fetchTransactionsFromBookings = async () => {
    const fallback = await axiosClient.get('/admin/all', {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    });

    if (fallback.success) {
      const validStatuses = ['pending', 'paid', 'refunded'];
      const tx = (fallback.bookings || []).filter((b) => {
        if (!validStatuses.includes(b.paymentStatus)) return false;
        if (!transactionStatusFilter) return true;
        return b.paymentStatus === transactionStatusFilter;
      });

      setTransactions(tx);
    }
  };

  const fetchTransactions = async () => {
    try {
      if (isTransactionsEndpointUnavailableRef.current) {
        await fetchTransactionsFromBookings();
        return;
      }

      const query = transactionStatusFilter ? `?paymentStatus=${transactionStatusFilter}` : '';
      const data = await axiosClient.get(`/admin/transactions${query}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      if (data.success) setTransactions(data.transactions || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          isTransactionsEndpointUnavailableRef.current = true;
          await fetchTransactionsFromBookings();
          return;
        } catch (fallbackErr) {
          console.error('Lỗi fallback giao dịch:', fallbackErr);
        }
      }

      console.error('Lỗi tải giao dịch:', err);
      toast.error('Không tải được danh sách giao dịch');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sự kiện này không?")) return;
    
    try {
      const data = await axiosClient.delete(`/admin/events/${id}`, {
        headers: {
          Authorization: `Bearer ${currentToken}` 
        }
      });

      if (data.success) {
        toast.success(" Đã xóa sự kiện!");
        fetchEvents();
      }
    } catch (err) { 
      console.error("Lỗi xóa:", err);
      toast.error("Lỗi xóa vui lòng đăng nhập lại!"); 
    }
  };
  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn đơn này không?")) return;
    
    try {
      const data = await axiosClient.delete(`/admin/booking/${id}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (data.success) {
        toast.success(" Đã xóa đơn!");
        setBookings(bookings.filter(b => b._id !== id));
      }
    } catch (err) {
      toast.error("Lỗi xóa vui lòng đăng nhập lại!");
    }
  };

  const handleApproveDeposit = async (id) => {
    try {
      const data = await axiosClient.put(`/admin/booking/${id}/approve-deposit`, {}, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (data.success) {
        toast.success('Đã duyệt cọc thủ công!');
        fetchAllBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi duyệt cọc!');
    }
  };

  useEffect(() => {
    if (currentToken && activeTab === 'events-list') fetchEvents();
  }, [currentToken, activeTab]);
  useEffect(() => {
    if (currentToken && activeTab === 'bookings') fetchAllBookings();
  }, [filterDate, currentToken, activeTab]);
  useEffect(() => {
    if (currentToken && activeTab === 'transactions') fetchTransactions();
  }, [currentToken, activeTab, transactionStatusFilter]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const data = await axiosClient.post('/admin/register', newAccount, {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      });

      if (data.success) {
        toast.success(data.message);
        setNewAccount({ username: '', password: '', role: 'Nhân Viên' }); 
      }
    } catch (error) {
      toast.error((error.response?.data?.message || 'Lỗi rồi!'));
    }
  };
  // --- CÁC HÀM XỬ LÝ QUẢN LÝ MENU ---
  const fetchMenu = async () => {
    try {
      const data = await axiosClient.get('/admin/menu', { headers: { Authorization: `Bearer ${currentToken}` } }); // Đảm bảo đúng endpoint
      if (data.success) setMenuItems(data.data || []);
    } catch (err) { console.error("Lỗi kéo menu", err); }
  };

  useEffect(() => {
    if (currentToken && activeTab === 'menu') fetchMenu();
  }, [currentToken, activeTab]);

  useEffect(() => {
    if (currentToken && activeTab === 'prices') fetchTablePrices();
  }, [currentToken, activeTab]);
  const handlePostMenu = async (e) => {
    e.preventDefault();
    // Băm cái đống chữ Options thành mảng chuẩn
    let optionsArray = [];
    if (menuForm.optionsText) {
      optionsArray = menuForm.optionsText.split('\n').filter(line => line.includes('|')).map(line => {
        const [label, price] = line.split('|');
        return { label: label.trim(), price: price.trim() };
      });
    }

    try {
      const data = await axiosClient.post('/admin/menu', {
        ...menuForm,
        image: menuForm.imageUrl,
        options: optionsArray
      }, { headers: { Authorization: `Bearer ${currentToken}` } });

      if (data.success) {
        toast.success("Đã lưu món vào Menu!");
        setMenuForm({ name: '', category: 'gaBOTTLE', price: '', desc: '', imageUrl: '', optionsText: '' });
        fetchMenu(); // Load lại bảng
      }
    } catch (err) { toast.error("Lỗi khi thêm món!"); }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm("Xóa món này khỏi thực đơn?")) return;
    try {
      const data = await axiosClient.delete(`/admin/menu/${id}`, { headers: { Authorization: `Bearer ${currentToken}` } });
      if (data.success) {
        toast.success("Đã xóa món!");
        fetchMenu();
      }
    } catch (err) { toast.error("Lỗi xóa món!"); }
  };
  const handleSaveMenu = async (e) => {
    e.preventDefault();
    
    let optionsArray = [];
    if (menuForm.optionsText) {
      optionsArray = menuForm.optionsText.split('\n').filter(line => line.includes('|')).map(line => {
        const [label, price] = line.split('|');
        return { label: label.trim(), price: price.trim() };
      });
    }

    const payload = {
      ...menuForm,
      image: menuForm.imageUrl,
      options: optionsArray,
      isHeader: menuForm.isHeader || false
    };

    try {
      let data;
      if (editingMenuId) {
        // CHẾ ĐỘ SỬA
        data = await axiosClient.put(`/admin/menu/${editingMenuId}`, payload, { headers: { Authorization: `Bearer ${currentToken}` } });
      } else {
        // CHẾ ĐỘ THÊM MỚI
        data = await axiosClient.post('/admin/menu', payload, { headers: { Authorization: `Bearer ${currentToken}` } });
      }

      if (data.success) {
        toast.success(editingMenuId ? "Đã cập nhật món!" : "Đã thêm món mới!");
        // Reset form về trắng
        setMenuForm({ name: '', category: 'gaBOTTLE', price: '', desc: '', imageUrl: '', optionsText: '' });
        setEditingMenuId(null);
        fetchMenu(); 
      }
    } catch (err) { toast.error("Có lỗi xảy ra!"); }
  };

  // Hàm đổ dữ liệu vào Form khi ấn nút Sửa
  const startEditMenu = (item) => {
    setEditingMenuId(item._id);
    // Biến mảng options thành text để hiện lên textarea
    const optText = item.options ? item.options.map(o => `${o.label}|${o.price}`).join('\n') : '';
    
    setMenuForm({
      name: item.name,
      category: item.category,
      price: item.price,
      desc: item.desc,
      imageUrl: item.image,
      optionsText: optText,
      isHeader: item.isHeader || false
    });
    // Cuộn lên đầu form cho đại ca dễ nhìn
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSyncToDatabase = async () => {
    if (!window.confirm("Cảnh báo: Hành động này sẽ đẩy toàn bộ data từ file vào Database. Tiếp tục?")) return;
    setIsImporting(true);
    setIsUploading(true);
    let count = 0;
    
    // Quét từng danh mục (gaBOTTLE, vipPackages...)
    for (const category in menuaData) {
      const items = menuaData[category];
      
      // Quét từng món trong danh mục
      for (const item of items) {
        try {
          const payload = {
            name: item.name || item.title || 'TIÊU ĐỀ',
            category: category,
            price: item.price || '',
            desc: item.desc || '',
            image: item.image || '',
            isHeader: item.isHeader || false,
            options: item.options || []
          };
          
          await axiosClient.post('/admin/menu', payload, { 
            headers: { Authorization: `Bearer ${currentToken}` } 
          });
          count++;
        } catch (err) {
          console.error(`Lỗi khi đẩy món ${item.name}`, err);
        }
      }
    }
    
    setIsUploading(false);
    toast.success(`Đã đồng bộ thành công ${count} món lên Server!`);
    setIsImporting(false);
    fetchMenu(); // Load lại bảng menu
  };
  const handleDeleteAllMenu = async () => {
    if (!window.confirm("CẢNH BÁO ĐỎ: Hành động này sẽ XÓA SẠCH toàn bộ Menu trên Database. Không thể khôi phục! Đại ca có chắc chắn không?")) return;

    setIsDeletingAll(true);
    try {
      const data = await axiosClient.delete('/admin/menu/delete-all', { headers: { Authorization: `Bearer ${currentToken}` } });
      if (data.success) {
        toast.success("Đã dọn sạch Database Menu!");
        setMenuItems([]); 
        setIsDeleteAllUnlocked(false);
      }
    } catch (err) {
      toast.error("Lỗi khi xóa!");
    } finally {
      setIsDeletingAll(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole'); 
    navigate('/admin-login');
  };

  const uploadImage = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dtfebizud/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setIsUploading(false);
      return data.secure_url; 
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      setIsUploading(false)
      return null;
    }
  };
  const handlePostEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.imageUrl) return toast.error('Chưa chọn ảnh!');

    try {
      const currentToken = localStorage.getItem('adminToken'); 
      const data = await axiosClient.post('/admin/events', eventForm, {
        headers: {
          Authorization: `Bearer ${currentToken}` 
        }
      });
      
      if (data.success) {
        toast.success('Đã đăng sự kiện!');
        setEventForm({ title: '', date: '', description: '', imageUrl: '' }); 
      }
    } catch (error) {
      console.error("Lỗi đăng sự kiện:", error);
      toast.error(error.response?.data?.message || 'Lỗi!');
    }
  };
  if (!currentToken) return null;

  return (
    <div className="admin-page">
      
      {/* HEADER */}
      <div className="admin-header-row">
        <h1 className="admin-header-title">HỆ THỐNG QUẢN TRỊ APLUS</h1>
        <div className="admin-user-info">
          <span>Đang đăng nhập: <strong>{role}</strong></span>
          <button onClick={handleLogout} className="admin-logout-btn">
            Đăng Xuất
          </button>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG TABS */}
      <div className="admin-tabs-container">
        <button 
          className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          QUẢN LÝ ĐẶT BÀN
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          QUẢN LÝ GIAO DỊCH
        </button>

        {(role === 'Quản lý Admin' || role === 'Quản lý') && (
          <button 
            className={`admin-tab-btn tab-account ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            CẤP TÀI KHOẢN
          </button>
        )}

        <button 
          className={`admin-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          ĐĂNG SỰ KIỆN
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          ĐỔI MẬT KHẨU
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'events-list' ? 'active' : ''}`}
          onClick={() => setActiveTab('events-list')}
        >
          DANH SÁCH SỰ KIỆN
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          QUẢN LÝ MENU
        </button>

        <button 
          className={`admin-tab-btn ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          QUẢN LÝ GIÁ BÀN
        </button>
      </div>

      {/* DANH SÁCH BÀN */}
      {activeTab === 'bookings' && (
        <div className="tab-content fade-in">
          <div className="admin-filter-container" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="admin-filter-item">
              <label className="admin-filter-label">Lọc theo ngày: </label>
              <input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
                className="admin-date-input"
              />
            </div>
            <input 
              type="text" 
              placeholder="Tìm tên hoặc SĐT..." 
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="admin-input"
              style={{ flex: 1, marginBottom: 0 }}
            />

            <button 
              onClick={() => { setFilterDate(''); setBookingSearch(''); setStatusFilter(''); }}
              style={{ 
                padding: '10px 20px', 
                background: '#444', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Xem tất cả đơn
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Bàn</th>
                  <th>Khách Hàng</th>
                  <th>SĐT</th>
                  <th>Số Người</th>
                  <th>Giờ</th>
                  <th className="admin-col-nowrap">Trạng Thái</th>
                  <th>Loại</th>
                  <th className="admin-col-nowrap">Vị trí GPS</th>
                  <th className="admin-col-nowrap">IP</th>
                  <th>Menu Đã Chọn</th>
                  <th className="admin-col-nowrap">Tổng Tiền</th>
                  <th className="admin-col-nowrap">Cọc</th>
                  <th className="admin-col-nowrap">TT Cọc</th>
                  <th style={{ textAlign: 'center' }}>Hành Động</th> 
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="admin-empty-msg">Không tìm thấy đơn đặt bàn nào phù hợp.</td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b._id}>
                      <td className="admin-td-tableId">{b.tableId}</td>
                      <td>{b.customerName}</td>
                      <td className="admin-td-phone">{b.phone}</td>
                      <td>{b.guestCount} Người</td>
                      <td>{b.time}</td>
                      <td className="admin-col-nowrap">
                        <span className={`admin-badge-status status-${b.status?.toLowerCase()}`}>
                          {b.status === 'confirmed' ? 'Đã duyệt' : b.status === 'cancelled' ? 'Đã hủy' : 'Chờ duyệt'}
                        </span>
                      </td>
                      <td className={`admin-td-type ${b.bookingType === 'voucher' ? 'voucher' : 'normal'}`}>
                        {b.bookingType === 'voucher' ? 'Voucher' : 'Thường'}
                      </td>
                      <td className="admin-col-nowrap" style={{ fontSize: '13px', lineHeight: '1.45', maxWidth: '240px' }}>
                        {formatBookingLocation(b.userLocation)}
                      </td>
                      <td className="admin-col-nowrap" style={{ fontSize: '13px', maxWidth: '180px' }}>
                        {b.ipAddress || 'Chưa có'}
                      </td>
                      {/* --- CỘT HIỂN THỊ MENU ĐÃ ĐẶT --- */}
                      <td style={{ textAlign: 'left', fontSize: '13px', maxWidth: '280px' }}>
                        <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '5px', color: '#f5f5f5' }}>
                          {/* Đã sửa thành đúng tên trường preOrderItems trong Database của đại ca */}
                          {b.preOrderItems && b.preOrderItems.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: '18px', color: '#f0f0f0', fontSize: '14px' }}>
                              {b.preOrderItems.map((item, idx) => (
                                <li key={idx} style={{ marginBottom: '6px', lineHeight: '1.45' }}>
                                  <strong style={{ color: '#d4e02e' }}>{item.qty || 0}x</strong> <span style={{ color: '#ffffff', fontWeight: 600 }}>{item.name}</span>
                                  {item.optionName && ` (${item.optionName})`}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span style={{ color: '#9ea5b1', fontStyle: 'italic', fontSize: '13px' }}>Chỉ đặt bàn</span>
                          )}
                        </div>
                      </td>
                      <td className="admin-td-price admin-col-nowrap">
                        {b.estimatedTotal ? b.estimatedTotal.toLocaleString('vi-VN') + ' đ' : '0 đ'}
                      </td>
                      <td className="admin-col-nowrap">{(b.depositAmount || 500000).toLocaleString('vi-VN')} đ</td>
                      <td className="admin-col-nowrap">
                        <span className={`admin-badge-status status-${b.paymentStatus || 'unpaid'}`}>
                          {b.paymentStatus === 'paid' ? 'Đã cọc' : b.paymentStatus === 'pending' ? 'Chờ duyệt cọc' : 'Chưa cọc'}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {(role === 'Quản lý Admin') && (
                            <button 
                              onClick={() => handleDeleteBooking(b._id)}
                              className="action-btn btn-cancel"
                              title="Xóa vĩnh viễn"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="tab-content fade-in">
          <div className="admin-filter-container" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT hoặc mã giao dịch..."
              value={transactionSearch}
              onChange={(e) => setTransactionSearch(e.target.value)}
              className="admin-input"
              style={{ flex: 1, marginBottom: 0 }}
            />
            <select
              value={transactionStatusFilter}
              onChange={(e) => setTransactionStatusFilter(e.target.value)}
              className="admin-input"
              style={{ width: '220px', marginBottom: 0 }}
            >
              <option value="pending">Chờ duyệt cọc</option>
              <option value="paid">Đã duyệt cọc</option>
              <option value="refunded">Đã hoàn cọc</option>
              <option value="">Tất cả giao dịch</option>
            </select>
            <button
              onClick={fetchTransactions}
              style={{
                padding: '10px 20px',
                background: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Làm mới
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Bàn</th>
                  <th>Tiền cọc</th>
                  <th>TT cọc</th>
                  <th>Mã GD</th>
                  <th>Thời gian báo chuyển</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="admin-empty-msg">Chưa có giao dịch nào phù hợp.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t._id}>
                      <td>{t.customerName}</td>
                      <td>{t.phone}</td>
                      <td>{t.tableId}</td>
                      <td>{(t.depositAmount || 500000).toLocaleString('vi-VN')} đ</td>
                      <td>
                        <span className={`admin-badge-status status-${t.paymentStatus || 'unpaid'}`}>
                          {t.paymentStatus === 'paid' ? 'Đã duyệt' : t.paymentStatus === 'pending' ? 'Chờ duyệt' : t.paymentStatus === 'refunded' ? 'Đã hoàn' : 'Chưa cọc'}
                        </span>
                      </td>
                      <td>{t.transactionId || '-'}</td>
                      <td>{t.transferSubmittedAt ? new Date(t.transferSubmittedAt).toLocaleString('vi-VN') : '-'}</td>
                      <td>
                        {t.paymentStatus === 'pending' ? (
                          <button
                            onClick={() => handleApproveDeposit(t._id)}
                            className="action-btn btn-cancel"
                            title="Duyệt cọc"
                          >
                            Duyệt
                          </button>
                        ) : (
                          <span style={{ color: '#aaa' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/*CẤP TÀI KHOẢN */}
      {activeTab === 'accounts' && (role === 'Quản lý Admin' || role === 'Quản lý') && (
        <div className="tab-content fade-in admin-form-container">
          <h2 className="admin-form-title account">CẤP TÀI KHOẢN NHÂN VIÊN</h2>
          <form onSubmit={handleCreateAccount} className="admin-form">
            <input 
              type="email" 
              placeholder="Địa chỉ Gmail..." 
              value={newAccount.email} 
              onChange={e => setNewAccount({...newAccount, email: e.target.value})} 
              className="admin-input" 
              required
            />

            <input 
              type="text" 
              placeholder="Tên tài khoản..." 
              value={newAccount.username} 
              onChange={e => setNewAccount({...newAccount, username: e.target.value})} 
              className="admin-input" 
              required
            />
            <input required type="password" placeholder="Mật khẩu" value={newAccount.password} onChange={e => setNewAccount({...newAccount, password: e.target.value})} className="admin-input" />
            <select value={newAccount.role} 
            onChange={e => setNewAccount({...newAccount, role: e.target.value})} className="admin-input">
              <option value="Quản lý">Quản lý (Full quyền)</option>
            </select>
            <button type="submit" className="admin-submit-btn account">TẠO</button>
          </form>
        </div>
      )}

      {/*ĐĂNG SỰ KIỆN */}
      {activeTab === 'events' && (
        <div className="tab-content fade-in admin-form-container">
          <h2 className="admin-form-title event">ĐĂNG SỰ KIỆN MỚI</h2>
          <form onSubmit={handlePostEvent} className="admin-form">
            <input required type="text" placeholder="Tên sự kiện" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="admin-input" />
            <input required type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="admin-input" />
            <div className="admin-input-file-group">
              <label>Chọn ảnh Banner:</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = await uploadImage(file);
                    if (url) {
                      setEventForm({...eventForm, imageUrl: url});
                      toast.success("Đã tải ảnh lên thành công!");
                    }
                  }
                }} 
                className="admin-input"
              />
              {eventForm.imageUrl && <img src={eventForm.imageUrl} alt="preview" style={{width: '100px', marginTop: '10px', borderRadius: '5px'}} />}
            </div>

            <textarea placeholder="Mô tả sự kiện..." rows="4" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="admin-input admin-textarea"></textarea>
            <button 
              type="submit" 
              disabled={isUploading} 
              className="admin-submit-btn event"
              style={{ opacity: isUploading ? 0.5 : 1 }}
            >
              {isUploading ? 'ĐANG TẢI ẢNH...' : 'ĐĂNG'}
            </button>
          </form>
        </div>
      )}
      {/* Sự kiện */}
      {activeTab === 'events-list' && (
        <div className="tab-content fade-in">
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Tìm tên sự kiện..." 
              value={eventSearchTerm}
              onChange={(e) => setEventSearchTerm(e.target.value)}
              className="admin-input"
              style={{ flex: 2, marginBottom: 0 }}
            />
            <input 
              type="date" 
              value={eventFilterDate}
              onChange={(e) => setEventFilterDate(e.target.value)}
              className="admin-input"
              style={{ flex: 1, marginBottom: 0 }}
            />
            <button 
              onClick={() => { setEventSearchTerm(''); setEventFilterMonth(''); setEventFilterDate(''); }}
              style={{ padding: '10px 15px', background: '#444', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}
            >
              Xóa lọc
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên Sự Kiện</th>
                  <th>Ngày Diễn Ra</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr><td colSpan="4" className="admin-empty-msg">Không tìm thấy sự kiện nào phù hợp.</td></tr>
                ) : (
                  filteredEvents.map((ev) => (
                    <tr key={ev._id}>
                      <td><img src={ev.imageUrl} alt="ev" style={{width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} /></td>
                      <td style={{textAlign: 'left', fontWeight: 'bold'}}>{ev.title}</td>
                      <td>{new Date(ev.date).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteEvent(ev._id)}
                          className="action-btn btn-cancel"
                          title="Xóa sự kiện"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* đổi mật khẩu */}
      {activeTab === 'password' && (
        <div className="tab-content fade-in admin-form-container">
          <h2 className="admin-form-title account"> ĐỔI MẬT KHẨU</h2>
          <form onSubmit={handleChangePassword} className="admin-form">
            <input 
              required type="password" placeholder="Mật khẩu hiện tại" 
              value={passForm.oldPassword} 
              onChange={e => setPassForm({...passForm, oldPassword: e.target.value})} 
              className="admin-input" 
            />
            <input 
              required type="password" placeholder="Mật khẩu mới" 
              value={passForm.newPassword} 
              onChange={e => setPassForm({...passForm, newPassword: e.target.value})} 
              className="admin-input" 
            />
            <input 
              required type="password" placeholder="Xác nhận mật khẩu mới" 
              value={passForm.confirmPassword} 
              onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} 
              className="admin-input" 
            />
            <button type="submit" className="admin-submit-btn account">CẬP NHẬT MẬT KHẨU</button>
          </form>
        </div>
      )}
      {/* QUẢN LÝ THỰC ĐƠN */}
      {activeTab === 'menu' && (
        <div className="tab-content fade-in">
          <div className="admin-form-container" style={{ maxWidth: '100%', marginBottom: '30px' }}>
            <h2 className="admin-form-title event">
              {editingMenuId ? `ĐANG SỬA: ${menuForm.name}` : 'THÊM MÓN MỚI VÀO THỰC ĐƠN'}
            </h2>
            <form onSubmit={handlePostMenu} className="admin-form">
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <input required type="text" placeholder="Tên món (VD: CHIVAS 18)" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className="admin-input" style={{flex: 2, minWidth: '200px'}} />
                <select value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className="admin-input" style={{flex: 1, minWidth: '150px'}}>
                  <option value="gaBOTTLE">GA BOTTLE</option>
                  <option value="vipPackages">VIP PACKAGE</option>
                  <option value="vvipPackages">VVIP PACKAGE</option>
                  <option value="sVipPackage">SVIP PACKAGE</option>
                  <option value="Champagne">CHAMPAGNE</option>
                  <option value="singleMartWishky">SINGLE MART WHISKY</option>
                  <option value="whisky">WHISKY</option>
                  <option value="sparkling">SPARKLING</option>
                  <option value="GAvoucher">GA VOUCHER</option>
                  <option value="tequila">TEQUILA</option>
                  <option value="GAnormal">GA NORMAL</option>
                  <option value="liquor">LIQUOR</option>
                  <option value="foodSnacks">FOOD & SNACKS</option>
                  <option value="SoftDrink">ĐỒ UỐNG</option>
                  <option value="other">KHÁC</option>
                </select>
                <input type="text" placeholder="Giá (VD: 3.500)" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} className="admin-input" style={{flex: 1, minWidth: '100px'}} />
              </div>
              
              <div className="admin-input-file-group">
                <label>Ảnh món ăn (Tùy chọn):</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = await uploadImage(file);
                      if (url) { setMenuForm({...menuForm, imageUrl: url}); toast.success("Đã tải ảnh lên!"); }
                    }
                  }} className="admin-input" />
                {menuForm.imageUrl && <img src={menuForm.imageUrl} alt="preview" style={{width: '60px', marginTop: '10px', borderRadius: '5px'}} />}
              </div>
                <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" className="admin-submit-btn event" style={{ flex: 3 }}>
                  {editingMenuId ? 'CẬP NHẬT (LƯU THAY ĐỔI)' : 'LƯU MÓN MỚI'}
                </button>
                {isImporting && (
                <button onClick={handleSyncToDatabase} className="admin-submit-btn" style={{ background: '#ff00ff', marginBottom: '20px' }}>
                  ĐỒNG BỘ DATA TỪ FILE LÊN DATABASE
                </button>
                )}
                <div style={{ padding: '15px', background: '#2a0000', border: '1px solid #ff0000', borderRadius: '8px', marginBottom: '20px' }}>


            {isDeleteAllUnlocked && (
              <button 
                onClick={handleDeleteAllMenu} 
                disabled={isDeletingAll}
                className="admin-submit-btn" 
                style={{ background: '#ff0000', marginTop: '15px', opacity: isDeletingAll ? 0.5 : 1, width: '100%' }}
              >
                {isDeletingAll ? ' ĐANG TIÊU HỦY...' : ' BẤM VÀO ĐÂY ĐỂ XÓA TOÀN BỘ 100% MENU'}
              </button>
            )}
          </div>
                {editingMenuId && (
                  <button type="button" onClick={() => {
                    setEditingMenuId(null);
                    setMenuForm({ name: '', category: 'gaBOTTLE', price: '', desc: '', imageUrl: '', optionsText: '' });
                  }} className="admin-submit-btn" style={{ flex: 1, background: '#555' }}>
                    HỦY SỬA
                  </button>
                )}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d4e02e', marginBottom: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={menuForm.isHeader}
                onChange={(e) => setMenuForm({ ...menuForm, isHeader: e.target.checked })}
                style={{ width: '20px', height: '20px', accentColor: '#d4e02e' }}
              />
              ĐÂY LÀ DÒNG TIÊU ĐỀ (Không phải món trong menu)
            </label>

              {!menuForm.isHeader && (
              <>
                <textarea placeholder="Mô tả món ăn (Dùng Enter để xuống dòng)" rows="2" value={menuForm.desc} onChange={e => setMenuForm({...menuForm, desc: e.target.value})} className="admin-input admin-textarea"></textarea>
              
              <textarea placeholder="Các lựa chọn (Dành cho Combo/Bán theo chai). Cú pháp 1 dòng: Tên|Giá. Ví dụ:&#10;1 BOTTLE|5.500&#10;3 BOTTLE|13.800" rows="3" value={menuForm.optionsText} onChange={e => setMenuForm({...menuForm, optionsText: e.target.value})} className="admin-input admin-textarea"></textarea>
                  
              </>
            )}
              <button type="submit" disabled={isUploading} className="admin-submit-btn event" style={{ opacity: isUploading ? 0.5 : 1 }}>
                {isUploading ? 'ĐANG TẢI ẢNH...' : 'LƯU MÓN'}
              </button>
            </form>
          </div>

          <div className="admin-table-wrapper">
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
            <input 
              type="text" 
              placeholder=" Tìm tên món hoặc danh mục..." 
              value={searchMenuTerm}
              onChange={(e) => setSearchMenuTerm(e.target.value)}
              className="admin-input"
              style={{ 
                width: '100%', maxWidth: '350px', padding: '10px 15px', 
                borderRadius: '8px', border: '1px solid #444', 
                background: '#111', color: '#fff' 
              }}
            />
          </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên Món</th>
                  <th>Danh Mục</th>
                  <th>Giá / Options</th>
                  <th>Tiêu Đề</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenuItems.length === 0 ? (
                  <tr><td colSpan="5" className="admin-empty-msg">Không tìm thấy món nào.</td></tr>
                ) : (
                  filteredMenuItems.map((item) => (
                    <tr key={item._id} style={{ background: item.isHeader ? '#222' : 'transparent' }}>
                      <td>{item.image ? <img src={item.image} alt="menu" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} /> : ''}</td>
                      <td style={{textAlign: 'left', fontWeight: 'bold'}}>{item.name}</td>
                      <td style={{ fontWeight: 'bold', color: '#d4e02e' }}>
                        {categoryDictionary[item.category] || item.category}
                      </td>
                      <td>
                        {item.options && item.options.length > 0 ? (
                          <div style={{fontSize: '12px', color: '#aaa'}}>{item.options.map((o, i) => <div key={i}>{o.label}: {o.price}k</div>)}</div>
                        ) : (
                          <span style={{color: '#d4e02e'}}>{item.price ? `${item.price}k` : ''}</span>
                        )}
                      </td>
                      <td style={{ color: item.isHeader ? '#d4e02e' : '#fff', fontWeight: item.isHeader ? 'bold' : 'normal' }}>
                        {item.isHeader ? `${item.name}` : ''}
                      </td>
                      <td>
                        <button onClick={() => startEditMenu(item)} className="action-btn btn-edit" style={{width: ' 50px', height: '44px', marginRight: '5px', borderRadius: '7px', cursor: 'pointer'}} >
                          Sửa
                        </button>
                        <button onClick={() => handleDeleteMenu(item._id)} className="action-btn btn-cancel" >
                          Xóa
                        </button>
                        
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUẢN LÝ GIÁ BÀN */}
      {activeTab === 'prices' && (
        <div className="tab-content fade-in">
          <div className="admin-form-container" style={{ maxWidth: '100%', marginBottom: '30px' }}>
            <h2 className="admin-form-title event">
              {editingPrice ? `CHỈNH SỬA GIÁ` : 'CẬP NHẬT GIÁ BÀN'}
            </h2>
            <form onSubmit={handleSavePrice} className="admin-form">
              <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <select 
                  value={priceForm.tableType} 
                  onChange={e => setPriceForm({...priceForm, tableType: e.target.value})} 
                  className="admin-input" 
                  style={{flex: 1, minWidth: '150px'}}
                  disabled={editingPrice ? true : false}
                  required
                >
                  <option value="">-- Chọn loại bàn --</option>
                  <option value="VIP">VIP</option>
                  <option value="VVIP">VVIP</option>
                  <option value="SVIP">SVIP</option>
                  <option value="SV8">SV8</option>
                  <option value="CABANA">CABANA</option>
                  <option value="GA_NORMAL">GA NORMAL</option>
                  <option value="GA_VOUCHER">GA VOUCHER</option>
                </select>
                <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#d4e02e', fontSize: '13px', fontWeight: 'bold' }}>Ngày thường</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Giá ngày thường (VND)" 
                    value={formatVnd(priceForm.weekday)} 
                    onChange={e => setPriceForm({...priceForm, weekday: parseVndInput(e.target.value)})} 
                    className="admin-input" 
                    required
                  />
                </div>
                <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#d4e02e', fontSize: '13px', fontWeight: 'bold' }}>Cuối tuần</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Giá cuối tuần (VND)" 
                    value={formatVnd(priceForm.weekend)} 
                    onChange={e => setPriceForm({...priceForm, weekend: parseVndInput(e.target.value)})} 
                    className="admin-input" 
                    required
                  />
                </div>
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" className="admin-submit-btn event" >
                  {editingPrice ? 'CẬP NHẬT GIÁ' : 'THÊM GIÁ MỚI'}
                </button>
                {editingPrice && (
                  <button type="button" onClick={() => {
                    setEditingPrice(null);
                    setPriceForm({ tableType: '', weekday: 0, weekend: 0 });
                  }} className="admin-submit-btn" style={{ flex: 1, background: '#555' }}>
                    HỦY SỬA
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Loại Bàn</th>
                  <th>Giá Ngày Thường</th>
                  <th>Giá Cuối Tuần</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {tablePrices.length === 0 ? (
                  <tr><td colSpan="4" className="admin-empty-msg">Chưa có giá nào. Vui lòng thêm giá bàn.</td></tr>
                ) : (
                  tablePrices.map((price) => (
                    <tr key={price._id}>
                      <td style={{fontWeight: 'bold', color: '#d4e02e'}}>{price.tableType}</td>
                      <td>{price.weekday.toLocaleString('vi-VN')} đ</td>
                      <td>{price.weekend.toLocaleString('vi-VN')} đ</td>
                      <td>
                        <button onClick={() => startEditPrice(price)} className="action-btn btn-edit" style={{width: '50px', height: '44px', marginRight: '5px', borderRadius: '7px', cursor: 'pointer'}}>
                          Sửa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;