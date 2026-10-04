const Event = require('../models/Event');

//Lấy tất cả sự kiện cho Khách xem
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Lỗi lấy sự kiện:", error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  getAllEvents
};