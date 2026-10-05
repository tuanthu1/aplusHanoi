
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Admin = require('../models/Admin');
const MenuItem = require('../models/MenuItem');
const TablePrice = require('../models/TablePrice');
const MenuPreviewImage = require('../models/MenuPreviewImage');
const sendAccountEmail = require('../utils/sendAccountEmail');
const sendNotifyAdminNewAccount = require('../utils/notifyAdminNewAccount');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const normalizeTableType = (value) => {
  if (typeof value !== 'string') return '';

  const cleaned = value.trim().toUpperCase();
  if (!cleaned) return '';

  const normalized = cleaned
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  const aliasMap = {
    GAVOUCHER: 'GA_VOUCHER',
    GANORMAL: 'GA_NORMAL'
  };

  return aliasMap[normalized] || normalized;
};

const repairLegacyTableTypes = async () => {
  const validTableTypes = new Set(TablePrice.schema.path('tableType').enumValues);
  const allPrices = await TablePrice.find();

  for (const price of allPrices) {
    const normalized = normalizeTableType(price.tableType);
    if (!normalized) {
      await TablePrice.deleteOne({ _id: price._id });
      continue;
    }

    if (normalized === price.tableType) continue;

    if (validTableTypes.has(normalized)) {
      const existingSameNormalized = await TablePrice.findOne({
        tableType: normalized,
        _id: { $ne: price._id }
      });

      if (existingSameNormalized) {
        await TablePrice.deleteOne({ _id: price._id });
      } else {
        await TablePrice.updateOne({ _id: price._id }, { $set: { tableType: normalized } });
      }
      continue;
    }

    await TablePrice.deleteOne({ _id: price._id });
  }
};

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
      return res.status(401).json({ success: false, message: 'Vui lòng đăng xuất ra và đăng nhập lại!' });
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
    const newEvent = new Event({ title, date, description, imageUrl, isHomeBanner: false });
    await newEvent.save();
    res.status(201).json({ success: true, message: 'Đăng thành công!', data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const toggleHomeBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện!' });
    }

    const nextValue = !event.isHomeBanner;

    if (nextValue) {
      await Event.updateMany({}, { $set: { isHomeBanner: false } });
    }

    event.isHomeBanner = nextValue;
    await event.save();

    return res.json({
      success: true,
      message: nextValue ? 'Đã đặt làm ảnh đầu trang.' : 'Đã bỏ ảnh đầu trang.',
      event
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật ảnh đầu trang' });
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
    await repairLegacyTableTypes();

    const validTableTypes = new Set(TablePrice.schema.path('tableType').enumValues);
    let prices = await TablePrice.find().sort({ tableType: 1 });

    const invalidTypes = prices
      .filter(price => !validTableTypes.has(normalizeTableType(price.tableType)))
      .map(price => price.tableType);

    if (invalidTypes.length > 0) {
      await TablePrice.deleteMany({ tableType: { $in: invalidTypes } });
      prices = prices.filter(price => validTableTypes.has(normalizeTableType(price.tableType)));
    }

    // Nếu không có data, tạo default prices
    if (prices.length === 0) {
      const defaultPrices = [
        { tableType: 'VIP', label: 'VIP', weekday: 6000000, weekend: 8000000 },
        { tableType: 'VVIP', label: 'VVIP', weekday: 8000000, weekend: 10000000 },
        { tableType: 'SVIP', label: 'SVIP', weekday: 10000000, weekend: 12000000 },
        { tableType: 'SV8', label: 'SV8', weekday: 20000000, weekend: 30000000 },
        { tableType: 'PRESIDENT', label: 'PRESIDENT', weekday: 20000000, weekend: 30000000 },
        { tableType: 'CABANA', label: 'CABANA', weekday: 0, weekend: 0 },
        { tableType: 'GA_NORMAL', label: 'GA THƯỜNG', weekday: 3000000, weekend: 3000000 },
        { tableType: 'GA_VOUCHER', label: 'GA VOUCHER', weekday: 1500000, weekend: 2000000 },
        { tableType: 'SV1', label: 'SV1', weekday: 10000000, weekend: 12000000 },
        { tableType: 'SV2', label: 'SV2', weekday: 10000000, weekend: 12000000 },
        { tableType: 'SV3', label: 'SV3', weekday: 10000000, weekend: 12000000 },
        { tableType: 'SV4', label: 'SV4', weekday: 10000000, weekend: 12000000 },
        { tableType: 'SV5', label: 'SV5', weekday: 10000000, weekend: 12000000 },
        { tableType: 'SV6', label: 'SV6', weekday: 10000000, weekend: 12000000 },
        { tableType: 'SV7', label: 'SV7', weekday: 10000000, weekend: 12000000 },
        { tableType: 'V1', label: 'V1', weekday: 6000000, weekend: 8000000 },
        { tableType: 'V2', label: 'V2', weekday: 6000000, weekend: 8000000 },
        { tableType: 'V3', label: 'V3', weekday: 6000000, weekend: 8000000 },
        { tableType: 'V4', label: 'V4', weekday: 6000000, weekend: 8000000 },
        { tableType: 'V5', label: 'V5', weekday: 6000000, weekend: 8000000 },
        { tableType: 'V6', label: 'V6', weekday: 6000000, weekend: 8000000 },
        { tableType: 'VV1', label: 'VV1', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV2', label: 'VV2', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV3', label: 'VV3', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV4', label: 'VV4', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV5', label: 'VV5', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV6', label: 'VV6', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV7', label: 'VV7', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV8', label: 'VV8', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV9', label: 'VV9', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV10', label: 'VV10', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV11', label: 'VV11', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV12', label: 'VV12', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV13', label: 'VV13', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV14', label: 'VV14', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV15', label: 'VV15', weekday: 8000000, weekend: 10000000 },
        { tableType: 'VV16', label: 'VV16', weekday: 8000000, weekend: 10000000 },
        { tableType: 'C1', label: 'C1', weekday: 0, weekend: 0 },
        { tableType: 'C2', label: 'C2', weekday: 0, weekend: 0 },
        { tableType: 'C3', label: 'C3', weekday: 0, weekend: 0 },
        { tableType: 'C4', label: 'C4', weekday: 0, weekend: 0 },
        { tableType: 'C5', label: 'C5', weekday: 0, weekend: 0 },
        { tableType: 'C6', label: 'C6', weekday: 0, weekend: 0 },
        { tableType: 'C7', label: 'C7', weekday: 0, weekend: 0 }
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
    const { tableType, label, weekday, weekend } = req.body;
    const validTableTypes = TablePrice.schema.path('tableType').enumValues;
    const normalizedTableType = normalizeTableType(tableType);

    if (!normalizedTableType || weekday === undefined || weekend === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin giá!' });
    }

    if (!validTableTypes.includes(normalizedTableType)) {
      return res.status(400).json({ success: false, message: 'Mã bàn không hợp lệ.' });
    }

    let price = await TablePrice.findOne({ tableType: normalizedTableType });
    
    if (!price) {
      price = new TablePrice({ tableType: normalizedTableType, label: label || normalizedTableType, weekday, weekend });
    } else {
      price.label = label || price.label || normalizedTableType;
      price.weekday = weekday;
      price.weekend = weekend;
    }

    await price.save();
    res.json({ success: true, message: 'Đã cập nhật giá thành công!', data: price });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật giá' });
  }
};

// ===== QUẢN LÝ ẢNH MENU PREVIEW =====
const getMenuPreviewImages = async (req, res) => {
  try {
    const images = await MenuPreviewImage.find().sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy ảnh menu preview' });
  }
};

const createMenuPreviewImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Thiếu link ảnh!' });
    }

    // Lấy displayOrder cao nhất và cộng 1
    const lastImage = await MenuPreviewImage.findOne().sort({ displayOrder: -1 });
    const displayOrder = (lastImage?.displayOrder || 0) + 1;

    const newImage = new MenuPreviewImage({ 
      imageUrl, 
      displayOrder,
      isActive: true 
    });
    
    await newImage.save();
    res.status(201).json({ success: true, message: 'Đã thêm ảnh menu preview!', data: newImage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi thêm ảnh menu preview' });
  }
};

const updateMenuPreviewImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, displayOrder, isActive } = req.body;

    const updatedImage = await MenuPreviewImage.findByIdAndUpdate(
      id, 
      { imageUrl, displayOrder, isActive },
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh!' });
    }

    res.json({ success: true, message: 'Đã cập nhật ảnh menu preview!', data: updatedImage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật ảnh menu preview' });
  }
};

const deleteMenuPreviewImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedImage = await MenuPreviewImage.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh để xóa!' });
    }

    res.json({ success: true, message: 'Đã xóa ảnh menu preview!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa ảnh menu preview' });
  }
};

const deleteTablePrice = async (req, res) => {
  const rawTableType = req.params.tableType;
  const tableType = normalizeTableType(rawTableType);
  const validTableTypes = TablePrice.schema.path('tableType').enumValues;
  if (!validTableTypes.includes(tableType)) {
    return res.status(400).json({ success: false, message: 'Mã bàn không hợp lệ.' });
  }

  try {
    if (await TablePrice.countDocuments() <= 1) {
      return res.status(400).json({ success: false, message: 'Cần giữ lại ít nhất một cấu hình bàn.' });
    }

    const deletedPrice = await TablePrice.findOneAndDelete({ tableType });
    if (!deletedPrice) {
      return res.status(404).json({ success: false, message: `Không tìm thấy cấu hình ${tableType}.` });
    }

    return res.json({ success: true, message: `Đã xóa cấu hình ${tableType}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Lỗi xóa cấu hình ${tableType}.` });
  }
};

module.exports = { getAllEvents, createEvent, toggleHomeBanner, getAllBookings, getAllTransactions, login, createAdmin, changePassword, deleteEvent, deleteBooking, approveBookingDeposit, getMenu, createMenuItem, deleteMenuItem, updateMenuItem, deleteAllMenu, getAllTablePrices, updateTablePrice, deleteTablePrice, getMenuPreviewImages, createMenuPreviewImage, updateMenuPreviewImage, deleteMenuPreviewImage };
