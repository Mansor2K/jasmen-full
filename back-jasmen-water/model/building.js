const mongoose = require("mongoose");
require("mongoose-double")(mongoose);

const buildingSchema = new mongoose.Schema(
  {
    buildingName: { type: String, required: true },
    buildingAddress: { type: String },
    buildingCode: { type: String },
    buildingDescription: { type: String },
    buildingLogo: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Building", buildingSchema);
