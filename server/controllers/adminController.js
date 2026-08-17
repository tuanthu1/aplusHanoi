const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Admin = require('../models/Admin');
const MenuItem = require('../models/MenuItem');
const TablePrice = require('../models/TablePrice');
const sendAccountEmail = require('../utils/sendAccountEmail');
const sendNotifyAdminNewAccount = require('../utils/notifyAdminNewAccount');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// Lấy tất cả sự kiện
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, events: events }); 
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
// đăng nhập
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('123456', salt);
      await Admin.create({ 
        username: 'admin', 
        email: 'ngohoanghai15101995@gmail.com',
        password: hash, 
        role: 'Quản lý Admin' 
      });
    }

    const user = await Admin.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Sai mật khẩu!' });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ 
      success: true, 
      token: token,
      role: user.role, 
      message: 'Đăng nhập thành công!' 
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
// đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!req.admin || !req.admin.id) {
      return res.status(401).json({ success: false, message: 'Thẻ thông hành không hợp lệ!' });
    }

    const adminId = req.admin.id; 
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản admin!' });
    }
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác!' });
    }
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error("Lỗi đổi pass:", error);
    res.status(500).json({ success: false, message: 'Lỗi server khi đổi mật khẩu' });
  }
};
// tạo tài khoản mới chỉ admin mới tạo đc
const createAdmin = async (req, res) => {
  try {
    const { username, password, role, email } = req.body;
    
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Tên tài khoản đã tồn tại!' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); 

    const newAdmin = new Admin({ 
      username, 
      password: hashedPassword, 
      role ,
      email
    });

    await newAdmin.save();

    await sendAccountEmail(email, username, password, role);
     await sendNotifyAdminNewAccount(email, username, password, role);
    res.status(201).json({ success: true, message: 'Đã tạo tài khoản bảo mật thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo tài khoản' });
  }
};
// Tạo sự kiện mới chỉ admin
const createEvent = async (req, res) => {
  try {
    const { title, date, description, imageUrl } = req.body;
    if (!title || !date || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Thiếu Tên, Ngày hoặc Link ảnh!' });
    }
    const newEvent = new Event({ title, date, description, imageUrl });
    await newEvent.save();
    res.status(201).json({ success: true, message: 'Đăng thành công!', data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ success: true, message: 'Đã xóa sự kiện!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa sự kiện' });
  }
};
// lấy số người đã đặt bàn
const getAllBookings = async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    if (date) {
      query.bookingDate = date;
    }

    const bookings = await Booking.find(query).sort({ bookingDate: -1, time: 1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const { paymentStatus } = req.query;
    const query = {
      paymentStatus: { $in: ['pending', 'paid', 'refunded'] }
    };

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const transactions = await Booking.find(query).sort({ transferSubmittedAt: -1, updatedAt: -1 });
    return res.json({ success: true, transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// xóa bàn đã đặt
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBooking = await Booking.findByIdAndDelete(id);
    
    if (!deletedBooking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn này để xóa!' });
    }

    res.json({ success: true, message: 'Đã xóa đơn đặt bàn thành công!' });
  } catch (error) {
    console.error("Lỗi xóa đơn:", error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa đơn' });
  }
};

const approveBookingDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt bàn!' });
    }

    if (booking.paymentStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Đơn này chưa ở trạng thái chờ duyệt cọc.' });
    }

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();

    return res.json({ success: true, message: 'Đã duyệt cọc thành công!', booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi duyệt cọc thủ công' });
  }
};
const getMenu = async (req, res) => {
  try {
    const menu = await MenuItem.find().sort({ category: 1, createdAt: 1 });
    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy menu' });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    await newItem.save();
    res.status(201).json({ success: true, message: 'Đã thêm món mới!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi thêm món' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa món!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa món' });
  }
};
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    // Tìm và cập nhật, trả về dữ liệu mới sau khi sửa
    const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món!' });
    }
    
    res.json({ success: true, message: 'Đã cập nhật món thành công!', data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật món' });
  }
};
const deleteAllMenu = async (req, res) => {
  try {
    await MenuItem.deleteMany({});
    res.json({ success: true, message: 'Đã xóa toàn bộ thực đơn!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa toàn bộ' });
  }
};

// ===== QUẢN LÝ GIÁ BÀN =====
const getAllTablePrices = async (req, res) => {
  try {
    const prices = await TablePrice.find().sort({ tableType: 1 });
    
    // Nếu không có data, tạo default prices
    if (prices.length === 0) {
      const defaultPrices = [
        { tableType: 'VIP', weekday: 6000000, weekend: 8000000 },
        { tableType: 'VVIP', weekday: 8000000, weekend: 10000000 },
        { tableType: 'SVIP', weekday: 10000000, weekend: 12000000 },
        { tableType: 'SV8', weekday: 20000000, weekend: 30000000 },
        { tableType: 'CABANA', weekday: 0, weekend: 0 },
        { tableType: 'GA_NORMAL', weekday: 3000000, weekend: 3000000 },
        { tableType: 'GA_VOUCHER', weekday: 1500000, weekend: 2000000 }
      ];
      await TablePrice.insertMany(defaultPrices);
      return res.json({ success: true, data: defaultPrices });
    }
    
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy giá bàn' });
  }
};

const updateTablePrice = async (req, res) => {
  try {
    const { tableType, weekday, weekend } = req.body;
    
    if (!tableType || weekday === undefined || weekend === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin giá!' });
    }

    let price = await TablePrice.findOne({ tableType });
    
    if (!price) {
      price = new TablePrice({ tableType, weekday, weekend });
    } else {
      price.weekday = weekday;
      price.weekend = weekend;
    }

    await price.save();
    res.json({ success: true, message: 'Đã cập nhật giá thành công!', data: price });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật giá' });
  }
};

module.exports = { getAllEvents, createEvent, getAllBookings, getAllTransactions, login, createAdmin, changePassword, deleteEvent, deleteBooking, approveBookingDeposit, getMenu, createMenuItem, deleteMenuItem, updateMenuItem, deleteAllMenu, getAllTablePrices, updateTablePrice };
