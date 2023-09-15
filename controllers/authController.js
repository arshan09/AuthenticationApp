const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail, sendPasswordResetEmail } = require("../email");

/**
 * Generates a random OTP of specified length.
 *
 * @param {number} length - The length of the OTP to generate.
 * @returns {string} The generated OTP.
 */
const generateOTP = (length) => {
  const charset = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    // Generate a random index within the charset length
    const randomIndex = Math.floor(Math.random() * charset.length);
    // Append a random character from the charset to the OTP
    otp += charset[randomIndex];
  }

  return otp;
};

/**
 * Registers a new user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */

exports.register = async (req, res) => {
  const { username, email, password, deviceId } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Regular expression to enforce password complexity
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password is too weak" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP(4);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      otp,
      tokens: [{ token: "", deviceId }], // Initialize with an empty token and the device ID
    });

    await newUser.save();

    if (!newUser.tokens) {
      newUser.tokens = [];
    }

    const refreshToken = jwt.sign(
      { userId: newUser._id, deviceId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    // Push the token to the tokens array
    newUser.tokens.push({ token: refreshToken, deviceId });

    await newUser.save();

    const otpMessage = `Your OTP is: ${otp}`;
    await sendEmail(email, "OTP Verification", otpMessage);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Verifies OTP and logs in a user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */

exports.verifyOTPAndLogin = async (req, res) => {
  const { email, otpInput, password } = req.body;

  try {
    // Retrieve the saved OTP
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const savedOTP = user.otp;

    // Verify OTP
    if (!savedOTP || otpInput !== savedOTP) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a new access token (expires in 1 hour)
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", // New access token expires in 1 hour
      }
    );

    // Generate a new refresh token (expires in 5 minutes)
    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    res.json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Handles forgot password functionality. Sends a password reset link to the user's email.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a password reset token (expires in 30 minutes)
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_TOKEN_SECRET,
      {
        expiresIn: "30m",
      }
    );

    // Create the reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send password reset email
    const resetMessage = `Click the link below to reset your password:\n${resetLink}`;
    await sendPasswordResetEmail(email, resetMessage);

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Resets the user's password using a valid reset token.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Promise that resolves when the password is reset.
 */
exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Verify and decode the reset token
    const decoded = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);

    // Find the user by their decoded userId
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password with the new hashed password
    user.password = hashedPassword;

    // Save the user document with the updated password
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

/**
 * Refreshes the access token for a user based on the provided refresh token.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */

exports.refreshToken = async (req, res) => {
  try {
    // Extract the userId and deviceId from the decoded token in req.user
    const { userId, deviceId } = req.user;

    // Ensure userId is valid
    if (!userId) {
      return res.status(401).json({ error: "Invalid user ID in token" });
    }

    // Fetch the user based on userId
    const user = await User.findById(userId);

    // Find the token for the specified device
    const deviceToken = user.tokens.find((token) => {
      const decodedToken = jwt.decode(token.token);
      return decodedToken.deviceId === deviceId;
    });

    if (!deviceToken) {
      return res.status(401).json({ error: "Device not authorized" });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, deviceId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    deviceToken.token = accessToken; // Update the token for the device
    await user.save();

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Retrieves a list of users with pagination.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Promise that resolves with the list of users or an error.
 */
exports.listUsers = async (req, res) => {
  const { page, limit } = req.query;

  // Parse query parameters for pagination, default to page 1 and limit 10 if not provided
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
  };

  try {
    // Retrieve users with pagination using skip and limit
    const users = await User.find()
      .skip((options.page - 1) * options.limit) // Calculate the starting index based on the page number and limit
      .limit(options.limit); // Limit the number of users per page

    res.json(users); // Respond with the list of users
  } catch (error) {
    console.error(error); // Log any errors for debugging
    res.status(500).json({ error: "Internal Server Error" }); // Respond with a 500 status and error message
  }
};
