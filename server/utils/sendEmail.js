const nodemailer = require('nodemailer');

const sendEmailToAdmin = async (bookingData) => {
  const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
  let title = '';
  if (bookingData.gender === 'Nam') {
    title = 'Mr.';
  } else if (bookingData.gender === 'Nữ') {
    title = 'Ms.';
  } else if (bookingData.gender === 'Khác') {
    title = 'Mx.'; 
  } else {
    title = ''; 
  }
  const mailOptions = {
    from: '"Hệ thống APLUS" <ngohoanghai15101995@gmail.com>',
    to: process.env.ADMIN_EMAILS, 
    subject: `ĐƠN ĐẶT BÀN MỚI - BÀN ${bookingData.tableId}`,
    html: `
      <div style="background: #000; color: #fff; padding: 20px; font-family: sans-serif; border-radius: 10px; border: 1px solid #333;">
        <h2 style="color: #f3fc32; text-align: center; border-bottom: 1px dashed #444; padding-bottom: 10px;">CÓ KHÁCH ĐẶT BÀN MỚI!</h2>
        <h3 style="color: #d4e02e;">Khách VIP: ${title} ${bookingData.customerName}</h3>
        <p><b>Số điện thoại:</b> ${bookingData.phone}</p>
        <p><b>Số người:</b> ${bookingData.guestCount}</p>
        <p><b>Thời gian:</b> ${bookingData.time} - Ngày: ${bookingData.bookingDate}</p>
        <p><b>Giới tính:</b> ${bookingData.gender}</p>
        <p><b>Loại đơn:</b> ${bookingData.bookingType === 'voucher' ? 'GA Voucher' : 'Thường'}</p>
        <hr style="border-color: #333;"/>
        <p style="text-align: center;">
          <a href="https://aplushanoi.net/admin" style="color: #000; background: #f3fc32; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">VÀO TRANG QUẢN TRỊ NGAY</a>
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmailToAdmin;