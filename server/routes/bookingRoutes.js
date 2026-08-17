const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const bookingControllers = require('../controllers/bookingController');

const createBookingLimiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000,
	max: 2,
	message: {
		success: false,
		message: 'Bạn đã đặt bàn quá 2 lần trong 24 giờ. Vui lòng thử lại sau.'
	},
	standardHeaders: true,
	legacyHeaders: false
});
// Phân luồng API
router.get('/occupancy', bookingControllers.getOccupancy); // Lấy số lượng khách 
router.post('/', createBookingLimiter, bookingControllers.createBooking); // Tạo đơn đặt bàn 
router.post('/deposit-submitted', createBookingLimiter, bookingControllers.submitDepositTransfer); // Khách báo đã chuyển cọc và hoàn tất tạo đơn
router.get('/:id/payment-status', bookingControllers.getBookingPaymentStatus); // Kiểm tra trạng thái duyệt cọc
module.exports = router;