const nodemailer = require('nodemailer');

const notifyAdminNewAccount = async (newUsername, newEmail, newRole) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"APLUS SECURITY" <ngohoanghai15101995@gmail.com>',
    to: 'ngohoanghai15101995@gmail.com', 
    subject: ` [CẢNH BÁO BẢO MẬT] CÓ TÀI KHOẢN MỚI ĐƯỢC TẠO: ${newUsername}`,
    html: `
      <div style="background: #111; color: #fff; padding: 20px; font-family: sans-serif; border-radius: 10px; border: 1px solid #ff4d4d;">
        <h2 style="color: #ff4d4d; text-align: center; border-bottom: 1px dashed #444; padding-bottom: 10px;">HỆ THỐNG VỪA TẠO TÀI KHOẢN MỚI</h2>
        
        <p>Chào Admin,</p>
        <p>Hệ thống APLUS Bar vừa ghi nhận thao tác tạo mới một tài khoản quản trị. Dưới đây là thông tin chi tiết:</p>
        
        <div style="background: #222; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff4d4d;">
          <p style="margin: 5px 0;"><b>Tên đăng nhập:</b> ${newUsername}</p>
          <p style="margin: 5px 0;"><b>Email đăng ký:</b> ${newEmail}</p>
          <p style="margin: 5px 0;"><b>Phân quyền (Role):</b> <span style="color: #f3fc32;">${newRole}</span></p>
          <p style="margin: 5px 0;"><b>Thời gian tạo:</b> ${new Date().toLocaleString('vi-VN')}</p>
        </div>

        <p style="color: #ff4d4d; font-size: 14px; font-weight: bold;">
          * Nếu thao tác này KHÔNG PHẢI do bạn thực hiện, vui lòng đăng nhập vào hệ thống kiểm tra và XÓA tài khoản ngay lập tức để bảo đảm an toàn!
        </p>
        
        <p style="text-align: center; margin-top: 30px;">
            <a href="https://aplushanoi.net/admin" style="color: #000; background: #ff4d4d; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">KIỂM TRA HỆ THỐNG NGAY</a>
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = notifyAdminNewAccount;