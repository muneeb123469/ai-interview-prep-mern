const express = require("express");
const {
  registerUserController,
  loginUserController,
  getMeController,
  logoutUserController,
} = require("../controllers/auth.controller");

const authUser = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);

// 🔥 protected route
router.get("/get-me", authUser, getMeController);

router.get("/logout", authUser, logoutUserController);

module.exports = router;
