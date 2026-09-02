const Booking = require('../models/Booking');
const sendEmailToAdmin = require('../utils/sendEmail');

const REQUIRED_DEPOSIT = 500000;

const getRequestIpAddress = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || '';
};

const prepareBookingPayload = (input = {}) => {
  const {
    tableId,
    customerName,
    phone,
    bookingDate,
    time,
    guestCount,
    bookingType,
    preOrderItems,
    estimatedTotal,
    gender,
    userLocation
  } = input;

  const safeItems = Array.isArray(preOrderItems) ? preOrderItems : [];
  const menuTotal = safeItems.reduce((sum, item) => {
    const qty = Number(item?.qty) || 0;
    const price = Number(item?.price) || 0;
    return sum + qty * price;
  }, 0);
  const tablePrice = getTablePrice(tableId, bookingDate);

  const finalEstimatedTotal = tableId !== 'GA'
    ? (menuTotal + tablePrice)
    : (Number(estimatedTotal) || menuTotal);

  return {
    tableId,
    customerName,
    phone,
    bookingDate,
    time,
    guestCount,
    bookingType,
    preOrderItems: safeItems,
    estimatedTotal: finalEstimatedTotal,
    gender,
    userLocation: userLocation && typeof userLocation === 'object'
      ? {
          latitude: Number(userLocation.latitude),
          longitude: Number(userLocation.longitude),
          accuracy: Number(userLocation.accuracy),
          timestamp: Number(userLocation.timestamp)
        }
      : undefined
  };
};

const getTablePrice = (tableId, bookingDate) => {
  if (!tableId || !bookingDate || tableId === 'GA') return 0;
  const dateObj = new Date(bookingDate);
  const isSunday = dateObj.getDay() === 0;

  if (isSunday) {
    if (tableId === 'SV8') return 30000000;
    if (tableId.startsWith('VV')) return 10000000;
    if (tableId.startsWith('SV')) return 12000000;
    if (tableId.startsWith('C')) return 0;
    if (tableId.startsWith('V')) return 8000000;
  } else {
    if (tableId === 'SV8') return 20000000;
    if (tableId.startsWith('VV')) return 8000000;
    if (tableId.startsWith('SV')) return 10000000;
    if (tableId.startsWith('C')) return 0;
    if (tableId.startsWith('V')) return 6000000;
  }

  return 0;
};
//LẤY TRẠNG THÁI BÀN
const getOccupancy = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Thiếu tham số ngày (date)' });

    const bookings = await Booking.find({ bookingDate: date, status: 'confirmed' });
    const occupancy = bookings.reduce((acc, curr) => {
      acc[curr.tableId] = (acc[curr.tableId] || 0) + (curr.guestCount || 0);
      return acc;
    }, {});

    res.json({ success: true, occupancy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//TẠO ĐƠN ĐẶT BÀN MỚI
const createBooking = async (req, res) => {
  try {
    const bookingPreview = prepareBookingPayload(req.body);

    res.status(201).json({ 
      success: true, 
      message: 'Đã tạo thông tin đơn tạm. Vui lòng chuyển cọc để hoàn tất đặt bàn.',
      bookingPreview,
      depositAmount: REQUIRED_DEPOSIT
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitDepositTransfer = async (req, res) => {
  try {
    const { bookingData, transactionId } = req.body || {};

    if (!bookingData) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu đơn đặt bàn để xác nhận chuyển khoản.' });
    }

    const payload = prepareBookingPayload(bookingData);
    const newBooking = new Booking({
      ...payload,
      status: 'pending',
      depositAmount: REQUIRED_DEPOSIT,
      paymentStatus: 'pending',
      paymentMethod: 'transfer',
      transactionId,
      transferSubmittedAt: new Date(),
      ipAddress: getRequestIpAddress(req)
    });

    await newBooking.save();
    try {
      await sendEmailToAdmin(newBooking);
    } catch (mailError) {
      console.error('Lỗi gửi mail:', mailError);
    }

    return res.json({
      success: true,
      message: 'Đã ghi nhận chuyển khoản. Vui lòng đợi 2 phút để admin duyệt.',
      booking: newBooking
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).select('paymentStatus status transferSubmittedAt');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt bàn.' });
    }

    return res.json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getOccupancy, createBooking, submitDepositTransfer, getBookingPaymentStatus };