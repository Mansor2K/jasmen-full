const mongoose = require("mongoose");
require("mongoose-double")(mongoose);


const consumptionSchema = mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    index: true 
  },
  dailyConsumption: { type: Number, required: true, default: 0 },
  maxConsumption: { type: Number, required: true, default: 0 },
  minConsumption: { type: Number, required: true, default: 0 },
  avgConsumption: { type: Number, required: true, default: 0 },
  maxFlowRate: { type: Number, required: true, default: 0 },
  minFlowRate: { type: Number, required: true, default: 0 },
  avgFlowRate: { type: Number, required: true, default: 0 },
  consumptionLimit: { type: Number, required: true },
  totalReadings: { type: Number, required: true, default: 0 },
  resetCount: { type: Number, required: true, default: 0 },
  statusChanges: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, required: true, default: true },
},
{ timestamps: true }
);
module.exports=mongoose.model('Consumption',consumptionSchema)
