const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const BlacklistTokenModel = require("../models/blacklist.model");

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

    // 🔥 2. Check if token is blacklisted (MOVE HERE)
    const isBlacklisted = await BlacklistTokenModel.findOne({ token });

    if (isBlacklisted) {
      return res.status(401).json({
        message: "Unauthorized: Token is blacklisted",
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Get user from DB
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
      });
    }

    // 5. Attach user to request
    req.user = user;

    // 6. Continue
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
};

module.exports = authUser;
