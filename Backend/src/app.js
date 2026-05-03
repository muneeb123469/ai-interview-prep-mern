const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

/**
 * Middlewares
 * These help Express understand incoming data and cookies.
 */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * Health check route
 * This is just to confirm that our backend server is running.
 */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend server is running successfully",
  });
});

module.exports = app;
