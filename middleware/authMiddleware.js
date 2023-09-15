const jwt = require("jsonwebtoken");

/**
 * Validates the JWT included in the request's Authorization header (access token).
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Next middleware function.
 * @throws {Error} If the access token is missing or invalid, it throws an error and returns a 401 status code.
 */
const validateAccessToken = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    // Access token is missing, continue without authorization
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("Error verifying access token. Token:", token);
      console.error("Error:", err);
      res.status(401);
      return res.send("Access token is not valid");
    }

    const { exp } = decoded;

    // Check if the token is about to expire within 5 minutes (300 seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    if (exp - currentTime <= 300) {
      // Token is about to expire within 5 minutes, generate a new access token
      const newAccessToken = jwt.sign(
        { user: decoded.user },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h", // New access token expires in 1 hour
        }
      );

      // Send the new access token in the response headers
      res.set("Authorization", `Bearer ${newAccessToken}`);
    }

    req.user = decoded.user;
    next();
  });
};

/**
 * Validates the JWT included in the request's Authorization header (refresh token).
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Next middleware function.
 * @throws {Error} If the refresh token is missing or invalid, it throws an error and returns a 401 status code.
 */
const validateRefreshToken = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    // Refresh token is missing, continue without authorization
    return next();
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401);
      throw new Error("Refresh token is not valid");
    }
    req.user = decoded.user;
    next();
  });
};

module.exports = { validateAccessToken, validateRefreshToken };
