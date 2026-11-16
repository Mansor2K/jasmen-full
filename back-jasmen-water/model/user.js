const mongoose = require("mongoose");
require("mongoose-double")(mongoose);
const SchemaTypes = mongoose.Schema.Types;

const ChargingSchema = mongoose.Schema(
  {
    money: { type: Number },
  },
  { timestamps: true },
);
const taxSchema = mongoose.Schema(
  {
    value: { type: Number },
    reason: { type: String },
  },
  { timestamps: true },
);

const userSchema = mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    SearchEmail: { type: String, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    consumption: { type: Number },
    flowRate: { type: Number },
    limit: { type: Number, default: 0 },
    mobile: { type: String, required: true },
    roomNumber: { type: Number, required: true },
    status: { type: Boolean, default: false },
    reset: { type: Boolean, default: false },
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },
    tax: {
      type: [taxSchema],
      default: [],
    },
    charging: {
      type: [ChargingSchema],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
