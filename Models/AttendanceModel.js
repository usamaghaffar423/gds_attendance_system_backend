const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  cnic_last6: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  location: {
    city: { type: String, default: "Unknown" },
    country: { type: String, default: "Unknown" },
    latitude: { type: String, default: "Unknown" },
    longitude: { type: String, default: "Unknown" },
  },
  ipAddress: {
    type: String,
    default: "Unknown",
  },
  loginTime: {
    type: Date,
    default: Date.now, // Automatically set to current time
  },
  logoutTime: {
    type: Date,
    default: null, // Initially set to null
  },
  date: {
    type: Date,
    default: Date.now, // Store only the date part
  },
  action: {
    type: String,
    enum: ["login", "logout"],
    required: true,
  },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
