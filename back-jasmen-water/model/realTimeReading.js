const mongoose = require("mongoose");
require("mongoose-double")(mongoose);

const realTimeReadingSchema = mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  consumption: { type: Number, required: true },
  flowRate: { type: Number, required: true },
  consumptionLimit: { type: Number, required: true },
  reset: { type: Boolean, required: true },
  state: { type: Boolean, required: true },
  readingTime: { type: Date, required: true, default: Date.now },
},
{ timestamps: true }
);

module.exports = mongoose.model('RealTimeReading', realTimeReadingSchema);
