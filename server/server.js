const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const bookingRoutes = require('./routes/bookingRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
const server = http.createServer(app);
// Kết nối MongoDB
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri || typeof mongoUri !== 'string') {
  console.error('Lỗi cấu hình: thiếu MONGODB_URI hoặc MONGO_URI trong file .env');
  process.exit(1);
}

mongoose.connect(mongoUri, {})
  .then(() => console.log(' Đã kết nối MongoDB thành công!'))
  .catch(err => console.log(' Lỗi kết nối DB:', err));

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`Server Bar Booking đang chạy tại cổng ${PORT}`));
