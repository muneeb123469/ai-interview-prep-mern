const express = require("express");
const { registerUserController } = require("../controllers/auth.controller");

const router = express.Router();

/**
 * @route POST /api/auth/register
 */
router.post("/register", registerUserController);

module.exports = router;
