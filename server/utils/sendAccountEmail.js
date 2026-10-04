const nodemailer = require('nodemailer');

const sendAccountEmail = async (email, username, rawPassword, role) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Hệ thống APLUS" <ngohoanghai15101995@gmail.com>', 
    to: email, 
    subject: `THÔNG TIN TÀI KHOẢN APLUS BAR - VỊ TRÍ: ${role.toUpperCase()}`,
    html: `
      <div style="background: #111; color: #fff; padding: 20px; font-family: sans-serif; border-radius: 10px; border: 1px solid #333;">
        <h2 style="color: #f3fc32; text-align: center; border-bottom: 1px dashed #444; padding-bottom: 10px;">CHÀO MỪNG GIA NHẬP APLUS TEAM!</h2>
        
        <p>Chào bạn,</p>
        <p>Tài khoản quản trị hệ thống APLUS Bar của bạn đã được Admin cấp thành công. Dưới đây là thông tin đăng nhập của bạn:</p>
        
        <div style="background: #222; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4e02e;">
          <p style="margin: 5px 0;"><b>Tên đăng nhập:</b> <span style="color: #d4e02e; font-size: 16px;">${username}</span></p>
          <p style="margin: 5px 0;"><b>Mật khẩu:</b> <span style="color: #d4e02e; font-size: 16px;">${rawPassword}</span></p>
          <p style="margin: 5px 0;"><b>Chức vụ:</b> ${role}</p>
        </div>

        <p style="color: #aaa; font-size: 13px; font-style: italic;">* Lưu ý: Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này để đảm bảo an toàn.</p>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="https://aplushanoi.net/admin" style="color: #000; background: #f3fc32; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">ĐĂNG NHẬP HỆ THỐNG</a>
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendAccountEmail;