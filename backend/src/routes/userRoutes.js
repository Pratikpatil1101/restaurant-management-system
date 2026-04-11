const express = require("express");
const router = express.Router();

const { createStaffUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/create", authMiddleware, roleMiddleware("admin"), createStaffUser);

module.exports = router;
