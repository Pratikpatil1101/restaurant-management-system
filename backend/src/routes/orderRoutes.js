const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  updateOrder,
  deleteOrder
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("admin", "kitchen", "waiter"), getOrders);
router.post("/", authMiddleware, roleMiddleware("waiter", "admin"), createOrder);
router.put("/:id", authMiddleware, roleMiddleware("kitchen", "admin"), updateOrder);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteOrder);

module.exports = router;
