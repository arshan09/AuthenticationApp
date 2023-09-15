const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  validateAccessToken,
  validateRefreshToken,
} = require("../middleware/authMiddleware");

/**
 * Route for user registration.
 * @name POST /auth/register
 * @function
 * @inner
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
router.post("/register", authController.register);

/**
 * Route for user login.
 * @name POST /auth/verifyOTPAndLogin
 * @function
 * @inner
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
router.post("/verifyOTPAndLogin", authController.verifyOTPAndLogin);

/**
 * Route for refreshing access tokens.
 * @name POST /auth/refreshToken
 * @function
 * @inner
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
router.post("/refreshToken", authController.refreshToken);

/**
 * Route for user listing with pagination.
 * @name GET /auth/users
 * @function
 * @inner
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
router.get("/users", validateAccessToken, authController.listUsers);

/**
 * Route for sending a password reset link to the user's email.
 * @name POST /auth/forgotPassword
 * @function
 * @inner
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
router.post("/forgotPassword", authController.forgotPassword);

/**
 * Route for resetting the user's password using the reset token.
 * @name POST /auth/resetPassword
 * @function
 * @inner
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
router.post("/resetPassword", authController.resetPassword);

module.exports = router;
