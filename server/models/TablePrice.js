
const mongoose = require('mongoose');

const tablePriceSchema = new mongoose.Schema(
  {
    tableType: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'VIP', 'VVIP', 'SVIP', 'SV8', 'CABANA',
        'SV1', 'SV2', 'SV3', 'SV4', 'SV5', 'SV6', 'SV7',
        'V1', 'V2', 'V3', 'V4', 'V5', 'V6',
        'VV1', 'VV2', 'VV3', 'VV4', 'VV5', 'VV6', 'VV7', 'VV8', 'VV9', 'VV10', 'VV11', 'VV12', 'VV13', 'VV14', 'VV15', 'VV16',
        'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7',
        'GA_NORMAL', 'GA_VOUCHER'
      ]
    },
    label: {
      type: String,
      default: ''
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
