const mongoose = require("mongoose");

// Define the Employee schema
const employeeSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    designation: { type: String },
    role: { type: String },
    cnicLast6: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Create the Employee model
const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
