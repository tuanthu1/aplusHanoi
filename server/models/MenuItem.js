const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: { type: String }, // Tên tiếng Anh
  category: { type: String, required: true }, // VD: gaBOTTLE, vipPackages, foodSnacks...
  price: { type: String }, // Giá (để String vì đại ca hay ghi kiểu '1.299')
  desc: { type: String },
  image: { type: String }, // Đường dẫn ảnh
  isHeader: { type: Boolean, default: false }, // Để phân biệt dòng tiêu đề
  options: [{
    label: String,
    labelEn: String,
    price: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);