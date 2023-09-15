/**
 * @file A module for connecting to a MongoDB database using Mongoose.
 * @module connectDB
 * @requires mongoose
 */

const mongoose = require("mongoose");

/**
 * Connects to a MongoDB database using the provided URL.
 *
 * @function
 * @param {string} url - The URL of the MongoDB database.
 * @returns {Promise} A promise that resolves once the connection is established.
 * @throws {Error} If the connection to the database fails.
 */
const connectDB = (url) => {
  /**
   * Mongoose connection instance.
   * @external "mongoose.Connection"
   * @see {@link https://mongoosejs.com/docs/api/connection.html#connection-js Mongoose Connection Documentation}
   */

  /**
   * Mongoose connection options.
   * @typedef {object} MongooseConnectOptions
   * @property {boolean} [useNewUrlParser=true] - Enables the new MongoDB connection string parser.
   * @property {boolean} [useUnifiedTopology=true] - Enables the new unified topology in the MongoDB driver.
   */

  /**
   * Options for connecting to the MongoDB database.
   * @type {MongooseConnectOptions}
   */
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  return mongoose.connect(url, options); // Connect to the MongoDB database with the provided URL and options
};

module.exports = connectDB; // Export the connectDB function
