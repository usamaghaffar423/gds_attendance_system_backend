const Attendance = require("../Models/AttendanceModel.js");

// const bcrypt = require("bcrypt");

// Find or create user by CNIC last 6 digits
// const findOrCreateUserByCnicLast6 = async (cnic_last6) => {
//   // Check if the user already exists
//   let user = await Employee.findOne({ cnic_last6 });

//   return user;
// };

const recordAttendance = async (req, res) => {
  const {
    cnic_last6,
    username,
    location = {},
    ipAddress = "Unknown",
    action,
  } = req.body;

  const {
    city = "Unknown",
    country = "Unknown",
    latitude = "Unknown",
    longitude = "Unknown",
  } = location;

  // Create a Date object for the current time in Pakistan Standard Time
  const currentDateTime = new Date();

  // Define shift start time and grace period
  const shiftStart = new Date(currentDateTime);
  shiftStart.setHours(21, 0, 0, 0); // 9:00 PM
  const gracePeriodEnd = new Date(shiftStart);
  gracePeriodEnd.setMinutes(shiftStart.getMinutes() + 15); // 9:15 PM

  // Format the current time in HH:mm:ss format
  const formattedTime = currentDateTime.toLocaleTimeString("en-GB", {
    hour12: true,
  });

  try {
    // Prepare the attendance data object
    const attendanceData = {
      cnic_last6,
      username,
      location: {
        city,
        country,
        latitude,
        longitude,
      },
      ipAddress,
      date: currentDateTime.toISOString().slice(0, 10), // Store date as YYYY-MM-DD
      action,
    };

    if (action === "login") {
      // Check if a login record already exists for today
      const existingAttendance = await Attendance.findOne({
        cnic_last6,
        date: currentDateTime.toISOString().slice(0, 10), // Today's date in YYYY-MM-DD
      });

      if (existingAttendance && existingAttendance.loginTime) {
        return res.status(400).json({
          message: "Login already recorded for today.",
        });
      }

      // Determine if the login is late
      const isLate = currentDateTime > gracePeriodEnd;

      // Prepare data for new or updated login record
      const attendanceData = {
        cnic_last6,
        username,
        location: {
          city,
          country,
          latitude,
          longitude,
        },
        ipAddress,
        loginTime: currentDateTime, // Store the actual Date object
        date: currentDateTime.toISOString().slice(0, 10), // Store date as YYYY-MM-DD
        isLate, // Boolean indicating if the user is late
        action,
      };

      // Insert new login record if none exists or update the existing record
      const newAttendance = existingAttendance
        ? await Attendance.findByIdAndUpdate(
            existingAttendance._id,
            attendanceData,
            { new: true }
          )
        : await Attendance.create(attendanceData);

      res.json({
        message: isLate
          ? "Login recorded, but you are late."
          : "Login recorded.",
        data: {
          ...newAttendance.toObject(),
          formattedTime,
        },
      });
    } else if (action === "logout") {
      // Find the login record to update with logout time
      const attendanceRecord = await Attendance.findOne({
        cnic_last6,
        date: currentDateTime.toISOString().slice(0, 10), // Today's date in YYYY-MM-DD
      });

      if (!attendanceRecord) {
        return res.status(400).json({
          message: "No login record found for today. Please login first.",
        });
      }

      if (attendanceRecord.logoutTime) {
        return res.status(400).json({
          message: "Logout already recorded for today.",
        });
      }

      // Prepare data for updating logout time
      const attendanceData = {
        logoutTime: currentDateTime, // Store the actual Date object
        action,
      };

      // Update the logout time in the existing record
      const updatedAttendance = await Attendance.findByIdAndUpdate(
        attendanceRecord._id,
        {
          $set: {
            logoutTime: attendanceData.logoutTime, // Update only logoutTime
            action: attendanceData.action, // Optional, you may not need this
          },
        },
        { new: true }
      );

      res.json({
        message: "Logout recorded.",
        data: {
          ...updatedAttendance.toObject(),
          formattedTime,
        },
      });
    } else {
      return res.status(400).json({
        message: "Invalid action. Must be 'login' or 'logout'.",
      });
    }
  } catch (err) {
    console.error("Error recording attendance:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Check Attendance
const checkAttendance = async (req, res) => {
  const { date } = req.query;
  const { cnic_last6 } = req.user; // Assuming you're using some middleware to get the user

  console.log(cnic_last6);

  try {
    const attendance = await Attendance.findOne({ date, cnic_last6 });

    if (attendance) {
      return res.json({ attendanceRecorded: true });
    } else {
      return res.json({ attendanceRecorded: false, cnic_last6 });
    }
  } catch (error) {
    console.error("Error checking attendance:", error);
    res.status(500).json({ message: "Failed to check attendance." });
  }
};

// Get All Attendance Records
const getAllAttendanceRecords = async (req, res) => {
  try {
    const results = await Attendance.find({})
      .sort({ username: 1, date: -1, timestamp: -1 })
      .exec();

    res.json(results);
  } catch (err) {
    console.error("Error fetching attendance records:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Attendance By Username
const getAttendanceByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const results = await Attendance.find({ username })
      .sort({ date: -1, timestamp: -1 })
      .exec();

    res.json(results);
  } catch (err) {
    console.error("Error fetching attendance by username:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Attendance By CNIC Last 6 Digits
const getAttendanceByCnicLast6 = async (req, res) => {
  const { cnic_last6 } = req.params;

  try {
    const results = await Attendance.find({ cnic_last6 })
      .sort({ date: -1, timestamp: -1 })
      .exec();

    res.json(results);
  } catch (err) {
    console.error("Error fetching attendance by CNIC:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  recordAttendance,
  getAllAttendanceRecords,
  getAttendanceByUsername,
  getAttendanceByCnicLast6,
  checkAttendance,
};
