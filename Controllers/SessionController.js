const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Employee = require("../Models/EmployeeModel.js"); // Ensure this model is set up with Mongoose

// Start a new session (login)
exports.startSession = async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    // Fetch user data by username
    const user = await Employee.findOne({ username });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare provided password with hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // Check password match
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Create session token (JWT) if needed (not required for session management)
    const sessionToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.WEB_SECRET,
      { expiresIn: "24h" }
    );

    // Store user data in the session
    req.session.user = {
      username: user.username,
      role: user.role,
      phoneNumber: user.phoneNumber,
      designation: user.designation,
      cnicLast6: user.cnicLast6,
    };

    // Respond with session token (if using JWT) or success message
    res.json({
      user: req.session.user,
      sessionToken, // Optionally include the JWT
    });
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle sign-out
exports.signOut = async (req, res) => {
  try {
    // Assuming you are using session management with express-session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Failed to sign out" });
      }

      res.status(200).json({ message: "Signed out successfully" });
    });
  } catch (error) {
    console.error("Error during sign out:", error);
    res.status(500).json({ message: "Failed to sign out" });
  }
};
