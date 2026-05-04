const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

/**
 * @desc Middleware to protect routes
 * Checks if user is authenticated using JWT token
 */
const authUser = async (req, res, next) => {
  try {
    // 1. Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Get user from DB
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
      });
    }

    // 4. Attach user to request
    req.user = user;

    // 5. Continue
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
};

module.exports = authUser;
