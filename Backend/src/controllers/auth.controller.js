const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/user.model");
const BlacklistTokenModel = require("../models/blacklist.model");

/**
 * Returns cookie settings for local and deployed environments.
 *
 * Local:
 * - secure: false
 * - sameSite: "lax"
 *
 * Production:
 * - secure: true
 * - sameSite: "none"
 *
 * This is needed because deployed frontend and backend will be on different domains:
 * Vercel frontend + Render backend.
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };
};

/**
 * Returns cookie settings for clearing auth cookie.
 */
const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
};

/**
 * Creates JWT token for authenticated user.
 */
const createAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

/**
 * @desc Register new user
 * @route POST /api/auth/register
 */
const registerUserController = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2. Check if user already exists
    const isUserExists = await UserModel.findOne({ email });

    if (isUserExists) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    // 5. Create JWT token
    const token = createAuthToken(user._id);

    // 6. Set cookie
    res.cookie("token", token, getCookieOptions());

    // 7. Send response
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 */
const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2. Find user and include password manually
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // 4. Generate JWT token
    const token = createAuthToken(user._id);

    // 5. Set cookie
    res.cookie("token", token, getCookieOptions());

    // 6. Send response
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @desc Get logged-in user
 * @route GET /api/auth/get-me
 */
const getMeController = async (req, res) => {
  try {
    // user is already attached by auth middleware
    const user = req.user;

    return res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @desc Logout user
 * @route GET /api/auth/logout
 */
const logoutUserController = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({
        message: "No token found",
      });
    }

    // 1. Add token to blacklist
    await BlacklistTokenModel.create({ token });

    // 2. Clear cookie with same cookie settings
    res.clearCookie("token", getClearCookieOptions());

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUserController,
  loginUserController,
  getMeController,
  logoutUserController,
};
