const mongoose = require('mongoose');

const tablePriceSchema = new mongoose.Schema(
  {
    tableType: {
      type: String,
      required: true,
      unique: true,
      enum: ['VIP', 'VVIP', 'SVIP', 'SV8', 'CABANA', 'GA_NORMAL', 'GA_VOUCHER']
    },
    weekday: {
      type: Number,
      required: true,
      default: 0
    },
    weekend: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TablePrice', tablePriceSchema);
