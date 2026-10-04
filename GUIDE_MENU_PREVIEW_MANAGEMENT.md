# 🎨 Hướng Dẫn Quản Lý Ảnh Menu Preview

## ✅ Tính Năng Đã Thêm

### 1. **Backend (Server)**
- ✅ Model `MenuPreviewImage` lưu trữ ảnh menu preview
- ✅ API endpoints quản lý ảnh:
  - `GET /admin/menu-preview-images` - Lấy danh sách ảnh
  - `POST /admin/menu-preview-images` - Thêm ảnh mới
  - `PUT /admin/menu-preview-images/:id` - Cập nhật ảnh
  - `DELETE /admin/menu-preview-images/:id` - Xóa ảnh

### 2. **Admin Panel**
Trong trang **Admin**, tab mới **"QUẢN LÝ ẢNH CHI TIẾT MENU"** với:
- 📤 **Upload ảnh**: Tải ảnh từ máy tính lên Cloudinary
- 📋 **Danh sách ảnh**: Hiển thị tất cả ảnh đã thêm với:
  - Số thứ tự
  - Preview ảnh
  - Ngày tạo
  - Nút xóa
- 🗑️ **Xóa ảnh**: Có xác nhận trước khi xóa

### 3. **Frontend - MenuPreview Component**
Component tự động:
- 🔄 Lấy ảnh từ API thay vì hardcode
- 📸 Hiển thị slider carousel với ảnh từ database
- ⚠️ Fallback về ảnh mặc định nếu API không có dữ liệu
- 🚀 Tự động cập nhật khi admin thêm/xóa ảnh

## 📍 Cách Sử Dụng

### Thêm Ảnh Menu Preview
1. Đăng nhập Admin Panel
2. Chuyển sang tab **"QUẢN LÝ ẢNH CHI TIẾT MENU"**
3. Click **chọn file** và tải ảnh lên
4. Click **"THÊM ẢNH"** để lưu

### Xóa Ảnh Menu Preview
1. Trong danh sách ảnh
2. Tìm ảnh cần xóa
3. Click nút **"Xóa"**
4. Xác nhận khi được hỏi

### Xem Ảnh Lớn
- Click vào ảnh trong danh sách để xem bản đầy đủ

## 🗄️ Cấu Trúc Database

```javascript
// MenuPreviewImage Schema
{
  _id: ObjectId,
  imageUrl: String,      // Link Cloudinary
  displayOrder: Number,  // Thứ tự hiển thị
  isActive: Boolean,     // Trạng thái kích hoạt
  createdAt: Date,
  updatedAt: Date
}
```

## 🔗 Liên Kết Files

- Backend Model: [server/models/MenuPreviewImage.js](server/models/MenuPreviewImage.js)
- Backend Routes: [server/routes/adminRoutes.js](server/routes/adminRoutes.js)
- Backend Controller: [server/controllers/adminController.js](server/controllers/adminController.js)
- Frontend Page: [client/src/pages/Admin.jsx](client/src/pages/Admin.jsx)
- Frontend Component: [client/src/components/MenuPreview.jsx](client/src/components/MenuPreview.jsx)

## ⚡ Lưu Ý Quan Trọng

1. **Cloudinary Upload**: Đảm bảo cấu hình Cloudinary đúng (upload_preset: 'ml_default')
2. **Authorization**: Cần token admin để add/delete ảnh
3. **Fallback Images**: Nếu database trống, component sẽ dùng ảnh mặc định trong thư mục `public/tepanhmenu/`
4. **Image URL**: Ảnh được lưu dưới dạng URL từ Cloudinary

## 🚀 Kiểm Tra Hoạt Động

1. Khởi động server: `npm start` (thư mục server)
2. Khởi động client: `npm run dev` (thư mục client)
3. Đăng nhập Admin
4. Thêm 2-3 ảnh trong tab "QUẢN LÝ ẢNH CHI TIẾT MENU"
5. Quay lại trang Home, kiểm tra slider MenuPreview hiển thị ảnh mới
