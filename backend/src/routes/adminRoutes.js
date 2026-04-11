const express = require("express");
const router = express.Router();

const { getAdminStats } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/stats", authMiddleware, roleMiddleware("admin"), getAdminStats);

module.exports = router;
