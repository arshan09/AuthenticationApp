/**
 * @fileoverview Functions for sending emails using Nodemailer.
 * @module email
 */

const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

// Create a Nodemailer transporter with your email service details
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use the email service you prefer
  auth: {
    user: process.env.EMAIL_USER, // Use the EMAIL_USER environment variable
    pass: process.env.EMAIL_PASS, // Use the EMAIL_PASS environment variable
  },
});

/**
 * Sends an OTP email using Nodemailer.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} otp - The OTP to be sent.
 * @returns {Promise<Object>} - A Promise that resolves to the email sending information.
 * @throws Will throw an error if sending the email fails.
 */
const sendOTPEmail = async (to, otp) => {
  try {
    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email address
      to, // Recipient email address
      subject: "OTP Verification", // Email subject
      text: `Your OTP is: ${otp}`, // Email content as plain text
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info);

    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

/**
 * Sends a password reset email using Nodemailer.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} resetLink - The link to reset the password.
 * @returns {Promise<Object>} - A Promise that resolves to the email sending information.
 * @throws Will throw an error if sending the email fails.
 */
const sendPasswordResetEmail = async (to, resetLink) => {
  try {
    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email address
      to, // Recipient email address
      subject: "Password Reset", // Email subject
      html: `Click <a href="${resetLink}">here</a> to reset your password.`, // Email content as HTML
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info);

    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
