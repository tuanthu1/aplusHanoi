const jwt = require('jsonwebtoken');
require('dotenv').config();
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không có token, từ chối truy cập!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Token không hợp lệ!' });
  }
};

module.exports = verifyToken;