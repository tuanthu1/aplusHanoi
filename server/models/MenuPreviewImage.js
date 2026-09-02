const mongoose = require('mongoose');

const menuPreviewImageSchema = new mongoose.Schema({
  imageUrl: { 
    type: String, 
    required: true 
  },
  displayOrder: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuPreviewImage', menuPreviewImageSchema);
