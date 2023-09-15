/**
 * @file Defines the Mongoose schema and model for a user.
 * @module User
 * @requires mongoose
 */

const mongoose = require("mongoose");

/**
 * A Mongoose schema representing a user.
 * @typedef {object} UserSchema
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user.
 * @property {string} password - The password of the user.
 * @property {string} otp - The one-time password (OTP) of the user.
 */

/**
 * The Mongoose user schema.
 * @type {external:Schema}
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
});

/**
 * The Mongoose model for a user.
 * @typedef {Model} UserModel
 * @property {function} model - The Mongoose model function.
 */

/**
 * The Mongoose model for a user.
 * @type {UserModel}
 */
module.exports = mongoose.model("User", userSchema);
