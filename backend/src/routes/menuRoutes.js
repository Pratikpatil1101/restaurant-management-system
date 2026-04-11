const express = require("express");
const router = express.Router();

const { addItem, getItems, updateItem, deleteItem } = require("../controllers/menuController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("admin"), addItem);
router.get("/", authMiddleware, roleMiddleware("admin", "waiter", "kitchen"), getItems);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateItem);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteItem);

module.exports = router;
