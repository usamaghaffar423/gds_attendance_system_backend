const bcrypt = require("bcrypt");
const Employee = require("../Models/EmployeeModel.js");

// Hash password
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

// Create a new employee
const registerEmployee = async (req, res) => {
  const { username, phoneNumber, designation, role, cnicLast6, password } =
    req.body;

  if (role !== "employee" && role !== "admin") {
    return res.status(400).json({ error: "Invalid role selected" });
  }

  try {
    // Check if username already exists
    const existingUser = await Employee.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }
    // Check if username already exists
    const userExisting = await Employee.findOne({ cnicLast6 });
    if (userExisting) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new employee
    const newEmployee = new Employee({
      username,
      phoneNumber,
      designation,
      role,
      cnicLast6,
      password: hashedPassword,
    });

    await newEmployee.save();
    res.status(201).json({ message: "Employee registered successfully" });
  } catch (err) {
    console.error("Error registering employee:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find(); // Fetches all employees
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get an employee by username
const getEmployeeByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const employee = await Employee.findOne({ username });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee by username:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get an employee by CNIC last 6 digits
const getEmployeeByCnicLast6 = async (req, res) => {
  const { cnicLast6 } = req.params;

  try {
    const employee = await Employee.findOne({ cnicLast6 });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee by CNIC:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update employee information by username
const updateEmployeeByUsername = async (req, res) => {
  const { username } = req.params;
  const { phoneNumber, designation, role, cnicLast6, password } = req.body;

  try {
    const updateData = { phoneNumber, designation, role, cnicLast6 };

    if (password) {
      // Hash new password if provided
      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { username, cnicLast6 },
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee updated successfully", updatedEmployee });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete an employee by username
const deleteEmployeeByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const result = await Employee.deleteOne({ username });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee by username:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete an employee by CNIC last 6 digits
const deleteEmployeeByCnicLast6 = async (req, res) => {
  const { cnicLast6 } = req.params;

  try {
    const result = await Employee.deleteOne({ cnicLast6 });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee by CNIC:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  registerEmployee,
  getAllEmployees,
  getEmployeeByUsername,
  getEmployeeByCnicLast6,
  updateEmployeeByUsername,
  deleteEmployeeByUsername,
  deleteEmployeeByCnicLast6,
};
