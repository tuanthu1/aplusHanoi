const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tableId: { type: String, required: true },
  customerName: { type: String, required: true },
  gender: { type: String, default: 'Nam' },
  phone: { type: String, required: true },
  bookingDate: { type: String, required: true },
  time: { type: String, required: true },
  guestCount: { type: Number, required: true, default: 1 },
  bookingType: { type: String, default: 'thuong' }, 
  status: { type: String, default: 'confirmed' },
  preOrderItems: { type: Array, default: [] }, 
  estimatedTotal: { type: Number, default: 0 },
  depositAmount: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'pending', 'paid', 'refunded'], 
    default: 'unpaid' 
  },
  paymentMethod: { type: String }, // 'transfer', 'momo', 'vnpay'
  transactionId: { type: String },  // Lưu mã giao dịch để đối soát
  transferSubmittedAt: { type: Date },
  userLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number },
    timestamp: { type: Number }
  },
  ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);