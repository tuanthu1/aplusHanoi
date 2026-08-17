// FILE: routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../auth/verifyToken');
router.post('/login', adminController.login);// đăng nhập
router.post('/events', verifyToken, adminController.createEvent); // tạo sự kiện mới
router.get('/all', adminController.getAllBookings);// lấy tất cả bàn đã đặt
router.get('/transactions', verifyToken, adminController.getAllTransactions); // lấy danh sách giao dịch cọc
router.get('/alle', adminController.getAllEvents);// lấy tất cả sự kiện
router.post('/register',verifyToken , adminController.createAdmin); // tạo tài khoản mưới
router.put('/change-password', verifyToken, adminController.changePassword); // đổi pass
router.delete('/events/:id', verifyToken, adminController.deleteEvent); // xóa sự kiện
router.delete('/booking/:id', verifyToken, adminController.deleteBooking); // xóa vé
router.put('/booking/:id/approve-deposit', verifyToken, adminController.approveBookingDeposit); // duyệt cọc thủ công
router.get('/menu', adminController.getMenu); // lấy menu
router.delete('/menu/delete-all', verifyToken, adminController.deleteAllMenu); // xóa toàn bộ menu
router.post('/menu', verifyToken, adminController.createMenuItem); // thêm menu mới
router.delete('/menu/:id', verifyToken, adminController.deleteMenuItem); // xóa menu
router.put('/menu/:id', verifyToken, adminController.updateMenuItem); // cập nhật menu
router.get('/table-prices', adminController.getAllTablePrices); // lấy giá bàn
router.put('/table-prices', verifyToken, adminController.updateTablePrice); // cập nhật giá bàn
module.exports = router;