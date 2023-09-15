/**
 * @fileoverview Main entry point for the application.
 * @module app
 */

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const { requireAuth } = require("./middleware/authMiddleware"); // Update the path if needed
const connectDB = require("./db/connect");
require("dotenv").config();

const app = express();

app.use(express.json());

// Authentication routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;

/**
 * Start the application.
 * @function
 * @async
 */
const start = async () => {
  try {
    // Connect to the MongoDB database
    await connectDB(process.env.MONGO_URI);

    // Start the server
    app.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
